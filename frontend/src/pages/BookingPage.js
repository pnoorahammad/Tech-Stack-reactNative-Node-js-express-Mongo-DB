import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createBooking } from '../services/api';

const initialForm = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  notes: '',
};

const validate = (values) => {
  const errors = {};
  if (!values.clientName.trim()) errors.clientName = 'Full name is required';
  else if (values.clientName.trim().length < 2) errors.clientName = 'Name must be at least 2 characters';

  if (!values.clientEmail.trim()) errors.clientEmail = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(values.clientEmail)) errors.clientEmail = 'Enter a valid email address';

  if (!values.clientPhone.trim()) errors.clientPhone = 'Phone number is required';
  else if (!/^[+]?[\d\s\-()\\.]{7,20}$/.test(values.clientPhone)) errors.clientPhone = 'Enter a valid phone number';

  if (values.notes.length > 500) errors.notes = 'Notes cannot exceed 500 characters';

  return errors;
};

export default function BookingPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Navigate back if arrived without state
  const expert = state?.expert;
  const selectedSlot = state?.selectedSlot;

  const mutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => setSubmitted(true),
  });

  if (!expert || !selectedSlot) {
    return (
      <div className="page">
        <div className="state-box">
          <div className="state-icon">⚠️</div>
          <div className="state-title">Invalid Access</div>
          <div className="state-text">Please select a slot from the expert's profile first.</div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Experts</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    mutation.mutate({
      expertId: id,
      slotId: selectedSlot.slotId,
      date: selectedSlot.date,
      timeSlot: selectedSlot.time,
      ...form,
    });
  };

  if (submitted) {
    return (
      <div className="page">
        <div className="state-box">
          <div className="state-icon">🎉</div>
          <div className="state-title">Booking Confirmed!</div>
          <div className="state-text">
            Your session with <strong>{expert.name}</strong> on{' '}
            <strong>{selectedSlot.date}</strong> at <strong>{selectedSlot.time}</strong> has been booked successfully.
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
            <button className="btn btn-outline" onClick={() => navigate('/')}>Browse More Experts</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <div className="page-header">
        <h1 className="page-title">Book a Session</h1>
        <p className="page-subtitle">Fill in your details to confirm the booking</p>
      </div>

      <div className="booking-container">
        {/* Booking Summary */}
        <div className="booking-summary">
          <div className="avatar" style={{ flexShrink: 0 }}>
            {expert.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="summary-expert">{expert.name}</div>
            <div className="summary-detail">
              📅 {new Date(selectedSlot.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              &nbsp;&nbsp;🕐 {selectedSlot.time}
            </div>
            <div className="summary-detail">💰 ${expert.hourlyRate}/hr · {expert.category}</div>
          </div>
        </div>

        <div className="booking-card">
          {/* Error Alert */}
          {mutation.isError && (
            <div className="alert alert-error" role="alert">
              <span>❌</span>
              <span>{mutation.error?.message || 'Booking failed. Please try again.'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="clientName">Full Name *</label>
                <input
                  id="clientName"
                  name="clientName"
                  type="text"
                  className={`form-input ${errors.clientName ? 'error' : ''}`}
                  placeholder="John Doe"
                  value={form.clientName}
                  onChange={handleChange}
                  autoComplete="name"
                />
                {errors.clientName && <span className="error-msg">{errors.clientName}</span>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="clientEmail">Email Address *</label>
                <input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  className={`form-input ${errors.clientEmail ? 'error' : ''}`}
                  placeholder="john@example.com"
                  value={form.clientEmail}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.clientEmail && <span className="error-msg">{errors.clientEmail}</span>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="clientPhone">Phone Number *</label>
                <input
                  id="clientPhone"
                  name="clientPhone"
                  type="tel"
                  className={`form-input ${errors.clientPhone ? 'error' : ''}`}
                  placeholder="+91 98765 43210"
                  value={form.clientPhone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
                {errors.clientPhone && <span className="error-msg">{errors.clientPhone}</span>}
              </div>

              {/* Date & Time (read-only from slot selection) */}
              <div className="form-group">
                <label>Session Date & Time</label>
                <input
                  className="form-input"
                  value={`${selectedSlot.date} · ${selectedSlot.time}`}
                  readOnly
                  style={{ opacity: 0.7, cursor: 'default' }}
                />
              </div>

              {/* Notes */}
              <div className="form-group full">
                <label htmlFor="notes">Notes / Agenda (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  className={`form-input ${errors.notes ? 'error' : ''}`}
                  placeholder="Topics you'd like to cover, specific questions, background context..."
                  value={form.notes}
                  onChange={handleChange}
                  maxLength={500}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  {form.notes.length}/500
                </span>
                {errors.notes && <span className="error-msg">{errors.notes}</span>}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              style={{ marginTop: '1.5rem', padding: '0.85rem' }}
              disabled={mutation.isPending}
              id="submit-booking-btn"
            >
              {mutation.isPending ? (
                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Confirming...</>
              ) : (
                '✓ Confirm Booking'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
