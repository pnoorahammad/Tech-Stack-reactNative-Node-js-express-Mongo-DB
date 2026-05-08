import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchBookingsByEmail } from '../services/api';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   className: 'status-pending',   icon: '⏳' },
  confirmed: { label: 'Confirmed', className: 'status-confirmed', icon: '✅' },
  completed: { label: 'Completed', className: 'status-completed', icon: '🎓' },
  cancelled: { label: 'Cancelled', className: 'status-cancelled', icon: '❌' },
};

const AvatarEl = ({ name }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  return <div className="avatar">{initials}</div>;
};

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bookings', searchEmail],
    queryFn: () => fetchBookingsByEmail(searchEmail),
    enabled: Boolean(searchEmail),
  });

  const bookings = data?.data?.bookings || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) return;
    setSearchEmail(email.trim());
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Track all your expert sessions in one place</p>
      </div>

      {/* Email Lookup */}
      <form onSubmit={handleSearch}>
        <div className="email-lookup">
          <input
            id="booking-email-input"
            type="email"
            className="form-input"
            placeholder="Enter your email address..."
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            aria-label="Email address to search bookings"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            id="lookup-bookings-btn"
          >
            {isLoading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Searching</> : 'Find Bookings'}
          </button>
        </div>
      </form>

      {/* Results */}
      {isError && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error?.message || 'Failed to fetch bookings.'}</span>
        </div>
      )}

      {searchEmail && !isLoading && !isError && bookings.length === 0 && (
        <div className="state-box">
          <div className="state-icon">📭</div>
          <div className="state-title">No bookings found</div>
          <div className="state-text">No bookings are associated with <strong>{searchEmail}</strong>.</div>
          <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '0.5rem' }}>
            Book a Session
          </button>
        </div>
      )}

      {!searchEmail && !isLoading && (
        <div className="state-box">
          <div className="state-icon">📋</div>
          <div className="state-title">Enter your email above</div>
          <div className="state-text">We'll show all sessions booked with your email address.</div>
        </div>
      )}

      {bookings.length > 0 && (
        <>
          <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Found <strong style={{ color: 'var(--text-primary)' }}>{bookings.length}</strong> booking{bookings.length !== 1 ? 's' : ''} for <strong style={{ color: 'var(--primary-light)' }}>{searchEmail}</strong>
          </div>
          <div className="bookings-list">
            {bookings.map(booking => {
              const statusInfo = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              const expertName = booking.expert?.name || 'Expert';
              const expertCat = booking.expert?.category || '';
              return (
                <div
                  key={booking._id}
                  className="booking-item"
                  role="article"
                  aria-label={`Booking with ${expertName}`}
                >
                  <AvatarEl name={expertName} />
                  <div className="booking-info">
                    <div className="booking-expert">{expertName}</div>
                    <div className="booking-meta">
                      {expertCat && <span>🏷️ {expertCat}</span>}
                      <span>📅 {booking.date}</span>
                      <span>🕐 {booking.timeSlot}</span>
                      {booking.notes && <span title={booking.notes}>📝 Notes</span>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      Booked {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <span className={`status-badge ${statusInfo.className}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
