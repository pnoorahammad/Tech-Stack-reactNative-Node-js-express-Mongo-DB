const { body, query, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateCreateBooking = [
  body('expertId').notEmpty().isMongoId().withMessage('Valid expertId is required'),
  body('slotId').notEmpty().isMongoId().withMessage('Valid slotId is required'),
  body('clientName').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('clientEmail').trim().notEmpty().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('clientPhone')
    .trim()
    .notEmpty()
    .matches(/^[+]?[\d\s\-()\\.]{7,20}$/)
    .withMessage('Valid phone number is required'),
  body('date')
    .notEmpty()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  body('timeSlot').trim().notEmpty().withMessage('Time slot is required'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  handleValidation,
];

const validateStatusUpdate = [
  body('status')
    .notEmpty()
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Status must be one of: pending, confirmed, completed, cancelled'),
  handleValidation,
];

module.exports = { validateCreateBooking, validateStatusUpdate };
