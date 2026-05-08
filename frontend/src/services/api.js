import axios from 'axios';

const API_BASE_RAW = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
// Remove trailing slash if present to avoid double-slash issues in requests
const API_BASE = API_BASE_RAW.endsWith('/') ? API_BASE_RAW.slice(0, -1) : API_BASE_RAW;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor — unwrap data or throw clean errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0]?.message ||
      error.message ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// ── Expert APIs ───────────────────────────────────────────────────────────────
export const fetchExperts = ({ search = '', category = '', page = 1, limit = 9 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category && category !== 'All') params.append('category', category);
  params.append('page', page);
  params.append('limit', limit);
  return api.get(`/experts?${params.toString()}`);
};

export const fetchExpertById = (id) => api.get(`/experts/${id}`);

// ── Booking APIs ──────────────────────────────────────────────────────────────
export const createBooking = (payload) => api.post('/bookings', payload);

export const fetchBookingsByEmail = (email) =>
  api.get(`/bookings?email=${encodeURIComponent(email)}`);

export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status });

export default api;
