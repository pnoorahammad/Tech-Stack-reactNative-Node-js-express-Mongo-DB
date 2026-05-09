const { supabase } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../config/logger');

/**
 * GET /api/experts
 * List experts with search, filter, and pagination using Supabase
 */
const getExperts = async (req, res, next) => {
  try {
    const {
      search = '',
      category,
      page = 1,
      limit = 9,
    } = req.query;

    let query = supabase
      .from('experts')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!search.trim()) {
      query = query.order('rating', { ascending: false });
    }

    query = query.range(skip, skip + parseInt(limit) - 1);

    const { data: experts, count, error } = await query;

    if (error) throw error;

    // Map snake_case to camelCase to maintain frontend compatibility
    const formattedExperts = experts.map(e => ({
      ...e,
      _id: e.id,
      totalReviews: e.total_reviews,
      hourlyRate: e.hourly_rate,
      isActive: e.is_active
    }));

    return successResponse(res, {
      experts: formattedExperts,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/experts/:id
 * Get single expert with full slot details using Supabase
 */
const getExpertById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Supabase relation query
    const { data: expert, error } = await supabase
      .from('experts')
      .select(`
        *,
        expert_slots (*)
      `)
      .eq('id', id)
      .single();

    if (error || !expert) {
      return errorResponse(res, 'Expert not found', 404);
    }

    // Map to camelCase
    const formattedExpert = {
      ...expert,
      _id: expert.id,
      totalReviews: expert.total_reviews,
      hourlyRate: expert.hourly_rate,
      isActive: expert.is_active
    };

    // Group slots by date for the frontend
    const slotsByDate = {};
    (expert.expert_slots || []).forEach((slot) => {
      const formattedSlot = {
        _id: slot.id,
        date: slot.date,
        time: slot.time,
        isBooked: slot.is_booked
      };
      if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
      slotsByDate[slot.date].push(formattedSlot);
    });

    delete formattedExpert.expert_slots;

    return successResponse(res, { expert: { ...formattedExpert, slotsByDate } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getExperts, getExpertById };
