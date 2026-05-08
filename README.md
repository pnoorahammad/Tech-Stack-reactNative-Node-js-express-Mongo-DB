# ExpertConnect — Real-Time Expert Session Booking System

A production-ready full-stack application for booking 1-on-1 sessions with industry experts in real time.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, React Router v6, React Query v5, Axios, Socket.io-client |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB + Mongoose |
| Styling | Vanilla CSS with dark glassmorphism design |
| Real-time | Socket.io (WebSocket + polling fallback) |

## 📁 Project Structure

```
expert-booking-system/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, logger, seed script
│   │   ├── controllers/     # Business logic (expert, booking)
│   │   ├── middleware/       # Error handler, auth (future)
│   │   ├── models/          # Mongoose schemas (Expert, Booking)
│   │   ├── routes/          # API route definitions
│   │   ├── sockets/         # Socket.io initialization & events
│   │   ├── utils/           # API response helpers
│   │   ├── validators/      # express-validator rules
│   │   ├── app.js           # Express app config
│   │   └── server.js        # HTTP server + Socket.io bootstrap
│   └── package.json
│
└── frontend/
    ├── public/
    └── src/
        ├── hooks/           # useDebounce
        ├── pages/           # ExpertList, ExpertDetail, Booking, MyBookings
        ├── services/        # Axios API service, Socket.io singleton
        ├── styles/          # Global CSS design system
        ├── App.js           # Router + Navbar
        └── index.js         # React entry + QueryClientProvider
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm

### 1. Clone & Install

```bash
# Backend
cd expert-booking-system/backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend `.env`:**
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/expert-booking
CORS_ORIGIN=http://localhost:3000
```

**Frontend `.env`:**
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

### 4. Start the Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

App runs at **http://localhost:3000** | API at **http://localhost:5000**

---

## 🔌 API Reference

### Experts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/experts` | List experts (search, filter, paginate) |
| GET | `/api/experts/:id` | Get expert details with slots |

**Query params for GET `/api/experts`:**
- `search` — Text search by name
- `category` — Filter by category
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 9)

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings?email=` | Get bookings by email |
| PATCH | `/api/bookings/:id/status` | Update booking status |

**POST `/api/bookings` payload:**
```json
{
  "expertId": "665abc123...",
  "slotId": "665def456...",
  "clientName": "John Doe",
  "clientEmail": "john@example.com",
  "clientPhone": "+1 555 000 1234",
  "date": "2025-06-10",
  "timeSlot": "10:00 AM",
  "notes": "Want to discuss system design."
}
```

---

## 🛡️ Double-Booking Prevention

Uses a **two-layer atomic strategy**:

1. **MongoDB `findOneAndUpdate` with slot condition** — Only marks slot booked if `isBooked: false` at the time of write (atomic operation within a session)
2. **Compound unique index** on `Booking` — `{ expert, date, timeSlot }` ensures DB-level rejection of any duplicate that bypasses layer 1
3. **MongoDB session/transaction** wraps both operations atomically

---

## ⚡ Real-Time Flow

1. Client opens Expert Detail → joins Socket.io room `expert:<id>`
2. Another user books a slot → backend marks slot booked + emits `slotBooked` event to all connected clients
3. React Query cache is updated optimistically → booked slot instantly grayed out for everyone
4. If user had that slot selected, selection is cleared automatically

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy `build/` folder to Vercel
```

### Backend (Render)
- Set environment variables in Render dashboard
- Build command: `npm install`
- Start command: `npm start`

### Database (MongoDB Atlas)
- Create free cluster at cloud.mongodb.com
- Whitelist your server IP
- Set `MONGODB_URI` to the Atlas connection string

---

## 📊 Database Schema

### Expert
- `name`, `category`, `designation`, `company`
- `experience`, `rating`, `totalReviews`, `hourlyRate`
- `bio`, `skills[]`, `avatar`, `isActive`
- `slots[]` — embedded `{ date, time, isBooked }`

### Booking
- `expert` (ref), `expertSlotId`
- `clientName`, `clientEmail`, `clientPhone`
- `date`, `timeSlot`, `notes`
- `status` — pending | confirmed | completed | cancelled
- **Unique index:** `{ expert, date, timeSlot }`
