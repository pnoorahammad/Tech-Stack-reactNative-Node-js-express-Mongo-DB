# ⚡ ExpertConnect: Elite Full-Stack Booking System

ExpertConnect is a production-grade, real-time platform designed to connect industry leaders with professionals seeking 1-on-1 mentorship. Built with an elite full-stack architecture, it ensures 100% data integrity, zero double-bookings, and a premium "Tech-SaaS" user experience.

## 🌟 Key Features
- **Elite UI/UX**: Glassmorphic dark theme, smooth entry animations (Framer Motion), and responsive layouts.
- **Atomic Bookings**: MongoDB transactions and unique compound indexing prevent race conditions and double-bookings.
- **Real-Time Sync**: Socket.io integration instantly reflects booked slots across all active clients.
- **Expert Discovery**: Advanced search (text-indexed) and category filtering with optimistic UI updates.
- **Production Security**: Rate limiting, Helmet security headers, and input validation.

## 🏗️ Technical Architecture
- **Frontend**: React 18, React Query v5, Framer Motion, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, Socket.io, Mongoose (ACID Transactions).
- **Quality**: Winston logging, Centralized Error Handling, Standardized API Responses.

## 🚀 Quick Start (Local)

### 1. Prerequisites
- Node.js v16+
- MongoDB (Atlas or Local Replica Set for Transactions)

### 2. Environment Setup
Create a `.env` in the `backend` folder:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
CORS_ORIGIN=http://localhost:3000
```

### 3. Installation & Seeding
```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Seed the database (Experts & 14 days of slots)
cd ../backend && npm run seed
```

### 4. Run the App
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm start
```

## 🎞️ Verification
A verification recording of the search and real-time functionality is available at:
`./recordings/search_verification.webp`

## 🌍 Deployment Guide

### Backend (Render/Railway)
- Root: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Env Vars: `MONGODB_URI`, `CORS_ORIGIN`

### Frontend (Vercel/Netlify)
- Root: `frontend`
- Build Command: `npm run build`
- Output: `build`
- Env Vars: `REACT_APP_API_URL` (to backend `/api`), `REACT_APP_SOCKET_URL` (to backend root)

---
Developed by the Elite Engineering Team for high-performance mentorship booking.
