const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expert-booking';

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  logger.info(`✅ MongoDB connected: ${mongoose.connection.host}`);

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
};

module.exports = { connectDB };
