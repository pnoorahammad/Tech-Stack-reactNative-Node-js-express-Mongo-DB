import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import ExpertListPage from './pages/ExpertListPage';
import ExpertDetailPage from './pages/ExpertDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';

import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider } from './context/ToastContext';

import { Users, Calendar, ShieldCheck, Zap } from 'lucide-react';

const Navbar = () => (
  <nav className="navbar">
    <div className="navbar-brand">
      <Zap className="brand-icon" size={24} fill="currentColor" />
      <span className="brand-name">ExpertConnect</span>
    </div>
    <div className="navbar-links">
      <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <Users size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        Experts
      </NavLink>
      <NavLink to="/my-bookings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
        <Calendar size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        My Bookings
      </NavLink>
    </div>
  </nav>
);

const AnimatedPage = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<AnimatedPage><ExpertListPage /></AnimatedPage>} />
                <Route path="/experts/:id" element={<AnimatedPage><ExpertDetailPage /></AnimatedPage>} />
                <Route path="/experts/:id/book" element={<AnimatedPage><BookingPage /></AnimatedPage>} />
                <Route path="/my-bookings" element={<AnimatedPage><MyBookingsPage /></AnimatedPage>} />
              </Routes>
            </AnimatePresence>
          </main>
          <footer className="footer">
            <p>© 2025 ExpertConnect. Real-time expert sessions.</p>
          </footer>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
