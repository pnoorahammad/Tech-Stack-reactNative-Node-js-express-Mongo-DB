const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Expert = require('../models/Expert');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getIO } = require('../sockets');
const logger = require('../config/logger');

/**
 * POST /api/bookings
 * Create a booking — atomic double-booking prevention
 */
const createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { expertId, slotId, clientName, clientEmail, clientPhone, date, timeSlot, notes } = req.body;

    // 1. Lock the expert document for update within the transaction
    const expert = await Expert.findOneAndUpdate(
      {
        _id: expertId,
        'slots._id': slotId,
        'slots.isBooked': false, // only proceed if slot is still free
        'slots.date': date,
        'slots.time': timeSlot,
      },
      {
        $set: { 'slots.$.isBooked': true },
      },
      { new: true, session }
    );

    if (!expert) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 'This slot is already booked or does not exist. Please choose another slot.', 409);
    }

    // 2. Create the booking record
    const [booking] = await Booking.create(
      [
        {
          expert: expertId,
          expertSlotId: slotId,
          clientName,
          clientEmail,
          clientPhone,
          date,
          timeSlot,
          notes: notes || '',
          status: 'pending',
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // 3. Populate expert info for the response
    await booking.populate('expert', 'name category designation avatar');

    // 4. Broadcast real-time slot update to ALL connected clients
    const io = getIO();
    io.emit('slotBooked', {
      expertId,
      slotId,
      date,
      timeSlot,
    });

    logger.info(`Booking created: ${booking._id} by ${clientEmail}`);

    return successResponse(res, { booking }, 'Booking created successfully', 201);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    // MongoDB duplicate key error (fallback for race conditions)
    if (err.code === 11000) {
      return errorResponse(res, 'This slot was just booked by someone else. Please choose another slot.', 409);
    }

    next(err);
  }
};

/**
 * GET /api/bookings?email=user@example.com
 * Fetch all bookings for a given email
 */
const getBookingsByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return errorResponse(res, 'Email query parameter is required', 400);
    }

    const bookings = await Booking.find({ clientEmail: email.toLowerCase() })
      .populate('expert', 'name category designation avatar rating')
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, { bookings });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bookings/:id/status
 * Update booking status (admin/system use)
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('expert', 'name category designation avatar');

    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    // Broadcast status update via Socket.io
    const io = getIO();
    io.emit('bookingStatusUpdated', {
      bookingId: booking._id,
      status: booking.status,
      clientEmail: booking.clientEmail,
    });

    logger.info(`Booking ${booking._id} status updated to ${status}`);

    return successResponse(res, { booking }, 'Booking status updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getBookingsByEmail, updateBookingStatus };
