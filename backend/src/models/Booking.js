const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: [true, 'Expert ID is required'],
    },
    expertSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Slot ID is required'],
    },
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    clientEmail: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    clientPhone: {
      type: String,
      required: [true, 'Phone is required'],
      match: [/^[+]?[\d\s\-()]{7,20}$/, 'Please provide a valid phone number'],
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: [true, 'Date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index — the core of double-booking prevention
bookingSchema.index(
  { expert: 1, date: 1, timeSlot: 1 },
  { unique: true, name: 'unique_expert_slot' }
);

// Index for fast email lookups (My Bookings screen)
bookingSchema.index({ clientEmail: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
