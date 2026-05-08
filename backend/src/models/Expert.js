const mongoose = require('mongoose');

// Individual slot schema embedded in Expert
const slotSchema = new mongoose.Schema({
  date: {
    type: String, // "YYYY-MM-DD"
    required: true,
  },
  time: {
    type: String, // "09:00 AM"
    required: true,
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
}, { _id: true });

const expertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Expert name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Technology', 'Finance', 'Marketing', 'Health', 'Legal', 'Design', 'Business', 'Education'],
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      required: [true, 'Experience is required'],
      min: [0, 'Experience cannot be negative'],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    skills: [{ type: String, trim: true }],
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    slots: [slotSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search by name
expertSchema.index({ name: 'text' });
expertSchema.index({ category: 1 });
expertSchema.index({ isActive: 1 });

module.exports = mongoose.model('Expert', expertSchema);
