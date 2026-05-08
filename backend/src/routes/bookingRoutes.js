const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookingsByEmail,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { validateCreateBooking, validateStatusUpdate } = require('../validators/bookingValidator');

router.post('/', validateCreateBooking, createBooking);
router.get('/', getBookingsByEmail);
router.patch('/:id/status', validateStatusUpdate, updateBookingStatus);

module.exports = router;
