-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Experts Table
CREATE TABLE experts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Technology', 'Finance', 'Marketing', 'Health', 'Legal', 'Design', 'Business', 'Education')),
    designation VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    experience INT NOT NULL CHECK (experience >= 0),
    rating NUMERIC(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INT DEFAULT 0,
    hourly_rate NUMERIC(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    bio VARCHAR(1000),
    skills TEXT[],
    avatar TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expert Slots Table (Normalized from Mongoose Embedded Schema)
CREATE TABLE expert_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
    date VARCHAR(20) NOT NULL, -- Storing as string to match Mongoose exactly ("YYYY-MM-DD")
    time VARCHAR(20) NOT NULL, -- Storing as string ("09:00 AM")
    is_booked BOOLEAN DEFAULT false,
    UNIQUE(expert_id, date, time)
);

-- Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
    expert_slot_id UUID NOT NULL REFERENCES expert_slots(id) ON DELETE RESTRICT,
    client_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    date VARCHAR(20) NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    notes VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Prevent double booking at database level
    UNIQUE(expert_id, date, time_slot)
);

-- Search and Performance Indexes
CREATE INDEX idx_experts_name ON experts(name);
CREATE INDEX idx_experts_category ON experts(category);
CREATE INDEX idx_experts_is_active ON experts(is_active);
CREATE INDEX idx_bookings_client_email ON bookings(client_email);
CREATE INDEX idx_bookings_status ON bookings(status);
