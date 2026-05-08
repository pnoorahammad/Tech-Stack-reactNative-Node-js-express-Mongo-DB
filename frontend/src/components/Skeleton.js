import React from 'react';
import { motion } from 'framer-motion';

export const ExpertSkeleton = () => {
  return (
    <div className="expert-card skeleton-card">
      <div className="card-header">
        <div className="avatar skeleton-avatar shimmer" />
        <div style={{ flex: 1 }}>
          <div className="skeleton-line shimmer" style={{ width: '70%', height: '18px', marginBottom: '8px' }} />
          <div className="skeleton-line shimmer" style={{ width: '40%', height: '12px' }} />
        </div>
      </div>
      <div className="skeleton-line shimmer" style={{ width: '30%', height: '24px', borderRadius: '20px', marginBottom: '12px' }} />
      <div className="card-stats">
        <div className="skeleton-line shimmer" style={{ width: '25%', height: '14px' }} />
        <div className="skeleton-line shimmer" style={{ width: '25%', height: '14px' }} />
      </div>
      <div className="card-footer">
        <div className="skeleton-line shimmer" style={{ width: '30%', height: '24px' }} />
        <div className="skeleton-line shimmer" style={{ width: '40%', height: '36px', borderRadius: '12px' }} />
      </div>
    </div>
  );
};

export const DetailSkeleton = () => {
  return (
    <div className="detail-layout">
      <div className="detail-card skeleton-card">
        <div className="detail-header">
          <div className="avatar-lg skeleton-avatar-lg shimmer" />
          <div style={{ flex: 1, marginTop: '8px' }}>
            <div className="skeleton-line shimmer" style={{ width: '80%', height: '24px', marginBottom: '10px' }} />
            <div className="skeleton-line shimmer" style={{ width: '50%', height: '14px' }} />
          </div>
        </div>
        <div className="skeleton-line shimmer" style={{ width: '100%', height: '80px', marginBottom: '20px' }} />
        <div className="skeleton-line shimmer" style={{ width: '40%', height: '12px', marginBottom: '10px' }} />
        <div className="skills-wrap">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-line shimmer" style={{ width: '60px', height: '24px', borderRadius: '8px' }} />
          ))}
        </div>
      </div>
      <div className="slots-panel skeleton-card">
        <div className="skeleton-line shimmer" style={{ width: '30%', height: '24px', marginBottom: '24px' }} />
        {[1, 2].map(i => (
          <div key={i} style={{ marginBottom: '24px' }}>
            <div className="skeleton-line shimmer" style={{ width: '20%', height: '14px', marginBottom: '12px' }} />
            <div className="slots-grid">
              {[1, 2, 3, 4, 5].map(j => (
                <div key={j} className="skeleton-line shimmer" style={{ width: '80px', height: '36px', borderRadius: '8px' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
