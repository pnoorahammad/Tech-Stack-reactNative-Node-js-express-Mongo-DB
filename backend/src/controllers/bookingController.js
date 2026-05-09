const { supabase } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getIO } = require('../sockets');
const logger = require('../config/logger');

/**
 * POST /api/bookings
 * Create a booking — relies on Postgres UNIQUE constraint for double-booking prevention
 */
const createBooking = async (req, res, next) => {
  try {
    const { expertId, slotId, clientName, clientEmail, clientPhone, date, timeSlot, notes } = req.body;

    // 1. Insert the booking (fails with code '23505' if a double booking happens)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          expert_id: expertId,
          expert_slot_id: slotId,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          date,
          time_slot: timeSlot,
          notes: notes || '',
          status: 'pending'
        }
      ])
      .select(`
        *,
        expert:experts(name, category, designation, avatar)
      `)
      .single();

    if (bookingError) {
      if (bookingError.code === '23505') { // Postgres Unique Violation
        return errorResponse(res, 'This slot was just booked by someone else. Please choose another slot.', 409);
      }
      throw bookingError;
    }

    // 2. Update the slot to show it's booked
    const { error: slotError } = await supabase
      .from('expert_slots')
      .update({ is_booked: true })
      .eq('id', slotId);

    if (slotError) {
      logger.error(`Failed to update slot status for slot ${slotId}`, slotError);
    }

    // Map snake_case to camelCase
    const formattedBooking = {
      ...booking,
      _id: booking.id,
      expert: {
        ...booking.expert,
        _id: booking.expert_id
      },
      clientEmail: booking.client_email,
      clientName: booking.client_name,
      clientPhone: booking.client_phone,
      timeSlot: booking.time_slot,
      expertSlotId: booking.expert_slot_id
    };

    // 4. Broadcast real-time slot update to ALL connected clients
    const io = getIO();
    io.emit('slotBooked', {
      expertId,
      slotId,
      date,
      timeSlot,
    });

    logger.info(`Booking created: ${booking.id} by ${clientEmail}`);

    return successResponse(res, { booking: formattedBooking }, 'Booking created successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings?email=user@example.com
 * Fetch all bookings for a given email via Supabase
 */
const getBookingsByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return errorResponse(res, 'Email query parameter is required', 400);
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        expert:experts(name, category, designation, avatar, rating)
      `)
      .eq('client_email', email.toLowerCase())
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedBookings = bookings.map(b => ({
      ...b,
      _id: b.id,
      expert: {
        ...b.expert,
        _id: b.expert_id
      },
      clientEmail: b.client_email,
      clientName: b.client_name,
      clientPhone: b.client_phone,
      timeSlot: b.time_slot,
      expertSlotId: b.expert_slot_id,
      createdAt: b.created_at
    }));

    return successResponse(res, { bookings: formattedBookings });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bookings/:id/status
 * Update booking status (admin/system use) via Supabase
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', req.params.id)
      .select(`
        *,
        expert:experts(name, category, designation, avatar)
      `)
      .single();

    if (error || !booking) {
      return errorResponse(res, 'Booking not found', 404);
    }
    
    const formattedBooking = {
      ...booking,
      _id: booking.id,
      expert: {
        ...booking.expert,
        _id: booking.expert_id
      },
      clientEmail: booking.client_email,
      clientName: booking.client_name,
      clientPhone: booking.client_phone,
      timeSlot: booking.time_slot,
      expertSlotId: booking.expert_slot_id
    };

    // Broadcast status update via Socket.io
    const io = getIO();
    io.emit('bookingStatusUpdated', {
      bookingId: booking.id,
      status: booking.status,
      clientEmail: booking.client_email,
    });

    logger.info(`Booking ${booking.id} status updated to ${status}`);

    return successResponse(res, { booking: formattedBooking }, 'Booking status updated successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getBookingsByEmail, updateBookingStatus };
