import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import ExpertListPage from './pages/ExpertListPage';
import ExpertDetailPage from './pages/ExpertDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';

const Navbar = () => (
  <nav className="navbar">
    <div className="navbar-brand">
      <span className="brand-icon">⚡</span>
      <span className="brand-name">ExpertConnect</span>
    </div>
    <div className="navbar-links">
      <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        Experts
      </NavLink>
      <NavLink to="/my-bookings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        My Bookings
      </NavLink>
    </div>
  </nav>
);

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ExpertListPage />} />
            <Route path="/experts/:id" element={<ExpertDetailPage />} />
            <Route path="/experts/:id/book" element={<BookingPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
          </Routes>
        </main>
        <footer className="footer">
          <p>© 2025 ExpertConnect. Real-time expert sessions.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
