const Expert = require('../models/Expert');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../config/logger');

/**
 * GET /api/experts
 * List experts with search, filter, and pagination
 */
const getExperts = async (req, res, next) => {
  try {
    const {
      search = '',
      category,
      page = 1,
      limit = 9,
    } = req.query;

    const filter = { isActive: true };

    // Full-text search on name
    if (search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [experts, total] = await Promise.all([
      Expert.find(filter)
        .select('-slots') // exclude slots on listing for performance
        .sort(search ? { score: { $meta: 'textScore' } } : { rating: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Expert.countDocuments(filter),
    ]);

    return successResponse(res, {
      experts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/experts/:id
 * Get single expert with full slot details
 */
const getExpertById = async (req, res, next) => {
  try {
    const expert = await Expert.findById(req.params.id).lean();

    if (!expert) {
      return errorResponse(res, 'Expert not found', 404);
    }

    // Group slots by date for the frontend
    const slotsByDate = {};
    (expert.slots || []).forEach((slot) => {
      if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
      slotsByDate[slot.date].push(slot);
    });

    return successResponse(res, { expert: { ...expert, slotsByDate } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getExperts, getExpertById };
