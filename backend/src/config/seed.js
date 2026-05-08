require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Expert = require('../models/Expert');
const logger = require('./logger');

// Helper to generate available slots for next 14 days
const generateSlots = () => {
  const slots = [];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
  const today = new Date();

  for (let d = 1; d <= 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dateStr = date.toISOString().split('T')[0];
    times.forEach((time) => {
      slots.push({ date: dateStr, time, isBooked: false });
    });
  }
  return slots;
};

const experts = [
  {
    name: 'Dr. Arjun Mehta',
    category: 'Technology',
    designation: 'Principal Engineer',
    company: 'Google',
    experience: 14,
    rating: 4.9,
    totalReviews: 312,
    hourlyRate: 250,
    bio: 'Ex-Google principal engineer with 14+ years in distributed systems, cloud architecture, and AI/ML. Has led teams building systems serving 1B+ users.',
    skills: ['System Design', 'Kubernetes', 'Go', 'Python', 'AI/ML', 'Distributed Systems'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ArjunMehta',
  },
  {
    name: 'Priya Sharma',
    category: 'Finance',
    designation: 'Senior Investment Analyst',
    company: 'Goldman Sachs',
    experience: 10,
    rating: 4.8,
    totalReviews: 245,
    hourlyRate: 200,
    bio: 'CFA charterholder with 10 years at Goldman Sachs. Expert in portfolio management, equity research, and fintech investment strategy.',
    skills: ['Portfolio Management', 'Equity Research', 'Financial Modeling', 'CFA', 'FinTech'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharma',
  },
  {
    name: 'Marcus Johnson',
    category: 'Marketing',
    designation: 'Chief Marketing Officer',
    company: 'Shopify',
    experience: 12,
    rating: 4.7,
    totalReviews: 198,
    hourlyRate: 180,
    bio: 'CMO with 12+ years building brands from 0 to $1B. Expert in growth hacking, performance marketing, and brand strategy.',
    skills: ['Growth Marketing', 'SEO/SEM', 'Brand Strategy', 'Performance Marketing', 'Analytics'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusJohnson',
  },
  {
    name: 'Dr. Kavya Reddy',
    category: 'Health',
    designation: 'Senior Cardiologist',
    company: 'Apollo Hospitals',
    experience: 18,
    rating: 4.9,
    totalReviews: 520,
    hourlyRate: 300,
    bio: 'Board-certified cardiologist with 18 years of clinical experience. Specialist in preventive cardiology and lifestyle medicine.',
    skills: ['Cardiology', 'Preventive Medicine', 'Nutrition', 'Stress Management', 'Diagnostics'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KavyaReddy',
  },
  {
    name: 'James O\'Brien',
    category: 'Legal',
    designation: 'Partner',
    company: 'Baker McKenzie',
    experience: 20,
    rating: 4.8,
    totalReviews: 167,
    hourlyRate: 400,
    bio: 'Senior partner specializing in corporate law, M&A, and international contracts. Advised Fortune 500 companies across 30+ countries.',
    skills: ['Corporate Law', 'M&A', 'Contract Law', 'IP Law', 'International Trade'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JamesOBrien',
  },
  {
    name: 'Aisha Patel',
    category: 'Design',
    designation: 'Head of Product Design',
    company: 'Airbnb',
    experience: 9,
    rating: 4.9,
    totalReviews: 289,
    hourlyRate: 160,
    bio: 'Design leader from Airbnb with expertise in user research, design systems, and building products loved by millions.',
    skills: ['UX Research', 'Figma', 'Design Systems', 'Product Strategy', 'Accessibility'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AishaPatel',
  },
  {
    name: 'Rohan Gupta',
    category: 'Business',
    designation: 'Strategy Consultant',
    company: 'McKinsey & Company',
    experience: 11,
    rating: 4.7,
    totalReviews: 203,
    hourlyRate: 350,
    bio: 'Ex-McKinsey consultant with expertise in digital transformation, operational excellence, and startup strategy.',
    skills: ['Business Strategy', 'Operations', 'Startup Advisory', 'Digital Transformation', 'P&L Management'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanGupta',
  },
  {
    name: 'Dr. Linda Chen',
    category: 'Education',
    designation: 'Learning Experience Designer',
    company: 'Coursera',
    experience: 8,
    rating: 4.6,
    totalReviews: 412,
    hourlyRate: 120,
    bio: 'PhD in Learning Sciences. Designed online courses taken by 2M+ learners. Expert in pedagogy, EdTech, and curriculum development.',
    skills: ['Curriculum Design', 'EdTech', 'Instructional Design', 'E-Learning', 'Assessment Design'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LindaChen',
  },
  {
    name: 'Carlos Mendez',
    category: 'Technology',
    designation: 'Blockchain Architect',
    company: 'Coinbase',
    experience: 7,
    rating: 4.8,
    totalReviews: 154,
    hourlyRate: 220,
    bio: 'Blockchain architect at Coinbase. Expert in DeFi protocols, smart contracts, and Web3 infrastructure.',
    skills: ['Blockchain', 'Solidity', 'Web3', 'DeFi', 'Smart Contracts', 'Ethereum'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosMendez',
  },
];

const seedDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expert-booking';
    await mongoose.connect(uri);
    logger.info('Connected to MongoDB for seeding');

    await Expert.deleteMany({});
    logger.info('Cleared existing experts');

    const expertsWithSlots = experts.map((expert) => ({
      ...expert,
      slots: generateSlots(),
    }));

    await Expert.insertMany(expertsWithSlots);
    logger.info(`✅ Seeded ${experts.length} experts with slots`);

    await mongoose.disconnect();
    logger.info('Disconnected — seed complete');
    process.exit(0);
  } catch (err) {
    logger.error('Seed failed:', err);
    process.exit(1);
  }
};

seedDB();
