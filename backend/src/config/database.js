const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('CRITICAL ERROR: MONGODB_URI environment variable is missing in production.');
      console.error('You must configure MONGODB_URI in your Render dashboard.');
      process.exit(1);
    }
  }
  
  const finalUri = uri || 'mongodb://localhost:27017/expert-booking';

  try {
    await mongoose.connect(finalUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB Connected");
    logger.info(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error(err);
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
};

module.exports = { connectDB };
