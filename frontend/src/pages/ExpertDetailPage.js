import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchExpertById } from '../services/api';
import { getSocket } from '../services/socket';

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
};

const AvatarEl = ({ name, avatar, size }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={`avatar ${size || ''}`}>
      {avatar
        ? <img src={avatar} alt={name} onError={e => { e.target.style.display = 'none'; }} />
        : initials}
    </div>
  );
};

export default function ExpertDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSlot, setSelectedSlot] = useState(null); // { slotId, date, time }

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expert', id],
    queryFn: () => fetchExpertById(id),
  });

  // ── Real-time slot updates via Socket.io ──────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    socket.emit('joinExpert', id);

    socket.on('slotBooked', ({ expertId, slotId }) => {
      if (expertId !== id) return;

      // Optimistically update the cached expert data
      queryClient.setQueryData(['expert', id], (old) => {
        if (!old) return old;
        const updatedExpert = {
          ...old.data.expert,
          slots: old.data.expert.slots.map(slot =>
            slot._id === slotId ? { ...slot, isBooked: true } : slot
          ),
        };
        // Recompute slotsByDate
        const slotsByDate = {};
        updatedExpert.slots.forEach(slot => {
          if (!slotsByDate[slot.date]) slotsByDate[slot.date] = [];
          slotsByDate[slot.date].push(slot);
        });
        return {
          ...old,
          data: { expert: { ...updatedExpert, slotsByDate } },
        };
      });

      // If user had this slot selected, deselect it
      setSelectedSlot(prev => (prev?.slotId === slotId ? null : prev));
    });

    return () => {
      socket.emit('leaveExpert', id);
      socket.off('slotBooked');
    };
  }, [id, queryClient]);

  const expert = data?.data?.expert;
  const slotsByDate = expert?.slotsByDate || {};

  const handleSlotSelect = useCallback((slot) => {
    if (slot.isBooked) return;
    setSelectedSlot(prev =>
      prev?.slotId === slot._id ? null : { slotId: slot._id, date: slot.date, time: slot.time }
    );
  }, []);

  const handleBook = () => {
    if (!selectedSlot) return;
    navigate(`/experts/${id}/book`, {
      state: { expert, selectedSlot },
    });
  };

  if (isLoading) return (
    <div className="page">
      <div className="state-box"><div className="spinner" /></div>
    </div>
  );

  if (isError) return (
    <div className="page">
      <div className="state-box">
        <div className="state-icon">⚠️</div>
        <div className="state-title">Failed to load expert</div>
        <div className="state-text">{error?.message}</div>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </div>
  );

  if (!expert) return null;

  const sortedDates = Object.keys(slotsByDate).sort();

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back to Experts
      </button>

      <div className="detail-layout">
        {/* ── Left: Expert Info Card ── */}
        <aside>
          <div className="detail-card">
            <div className="detail-header">
              <AvatarEl name={expert.name} avatar={expert.avatar} size="avatar-lg" />
              <div>
                <div className="expert-name" style={{ fontSize: '1.15rem' }}>{expert.name}</div>
                <div className="expert-designation">{expert.designation}</div>
                {expert.company && <div className="expert-company">@ {expert.company}</div>}
              </div>
            </div>

            <span className="category-badge">{expert.category}</span>

            <div className="card-stats" style={{ marginTop: '1rem' }}>
              <div className="stat">
                <StarRating rating={expert.rating} />
                <span className="stat-value">{expert.rating}</span>
                <span className="stat-label">({expert.totalReviews} reviews)</span>
              </div>
            </div>

            <div className="card-stats">
              <div className="stat">
                <span className="stat-icon">💼</span>
                <span className="stat-value">{expert.experience} years</span>
                <span className="stat-label">experience</span>
              </div>
              <div className="stat">
                <span className="stat-icon">💰</span>
                <span className="stat-value">${expert.hourlyRate}</span>
                <span className="stat-label">/hr</span>
              </div>
            </div>

            {expert.bio && (
              <div style={{ marginTop: '1.25rem' }}>
                <div className="section-label">About</div>
                <p className="expert-bio">{expert.bio}</p>
              </div>
            )}

            {expert.skills?.length > 0 && (
              <div className="skills-section">
                <div className="section-label">Skills</div>
                <div className="skills-wrap">
                  {expert.skills.map(skill => (
                    <span key={skill} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Book CTA */}
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: '1.5rem' }}
              onClick={handleBook}
              disabled={!selectedSlot}
            >
              {selectedSlot
                ? `Book ${selectedSlot.date} at ${selectedSlot.time}`
                : 'Select a Slot to Book'}
            </button>
          </div>
        </aside>

        {/* ── Right: Slots Panel ── */}
        <section>
          <div className="slots-panel">
            <div className="slots-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Available Slots</h2>
              <span className="live-badge">
                <span className="live-dot" />
                Live Updates
              </span>
            </div>

            {sortedDates.length === 0 ? (
              <div className="state-box" style={{ minHeight: 200 }}>
                <div className="state-icon">📅</div>
                <div className="state-title">No slots available</div>
                <div className="state-text">Check back soon for new availability.</div>
              </div>
            ) : (
              sortedDates.map(date => {
                const dateSlots = slotsByDate[date];
                const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                });
                return (
                  <div key={date} className="date-group">
                    <div className="date-label">{dateLabel}</div>
                    <div className="slots-grid">
                      {dateSlots.map(slot => (
                        <button
                          key={slot._id}
                          className={`slot-btn ${slot.isBooked ? 'booked' : ''} ${selectedSlot?.slotId === slot._id ? 'selected' : ''}`}
                          onClick={() => handleSlotSelect(slot)}
                          disabled={slot.isBooked}
                          aria-label={slot.isBooked ? `${slot.time} — Booked` : `Select ${slot.time}`}
                          aria-pressed={selectedSlot?.slotId === slot._id}
                        >
                          {slot.time} {slot.isBooked ? '✕' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
