import axios from 'axios';

let API_BASE_RAW = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'http://localhost:5000/api';

if (API_BASE_RAW.includes('your-backend.onrender.com')) {
  console.error("CRITICAL CONFIGURATION ERROR: You are using the placeholder backend URL. Please update REACT_APP_API_URL in your Vercel dashboard to point to your ACTUAL Render backend URL.");
}

// Remove trailing slash if present
API_BASE_RAW = API_BASE_RAW.endsWith('/') ? API_BASE_RAW.slice(0, -1) : API_BASE_RAW;
// Ensure it ends with /api to prevent 404s if user forgets it in the env var
const API_BASE = API_BASE_RAW.endsWith('/api') ? API_BASE_RAW : `${API_BASE_RAW}/api`;

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
