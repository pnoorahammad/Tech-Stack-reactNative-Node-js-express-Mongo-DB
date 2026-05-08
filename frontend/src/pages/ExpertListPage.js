import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchExperts } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

const CATEGORIES = ['All', 'Technology', 'Finance', 'Marketing', 'Health', 'Legal', 'Design', 'Business', 'Education'];

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars" aria-label={`${rating} stars`}>
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

const ExpertCard = ({ expert, onClick }) => (
  <div className="expert-card" onClick={onClick} role="button" tabIndex={0}
    onKeyDown={e => e.key === 'Enter' && onClick()}
    aria-label={`View ${expert.name}'s profile`}>
    <div className="card-header">
      <AvatarEl name={expert.name} avatar={expert.avatar} />
      <div>
        <div className="expert-name">{expert.name}</div>
        <div className="expert-designation">{expert.designation}</div>
        {expert.company && <div className="expert-company">@ {expert.company}</div>}
      </div>
    </div>
    <span className="category-badge">{expert.category}</span>
    <div className="card-stats">
      <div className="stat">
        <StarRating rating={expert.rating} />
        <span className="stat-value">{expert.rating}</span>
        <span className="stat-label">({expert.totalReviews})</span>
      </div>
      <div className="stat">
        <span className="stat-icon">💼</span>
        <span className="stat-value">{expert.experience}yr</span>
      </div>
    </div>
    <div className="card-footer">
      <div className="rate">${expert.hourlyRate}<span>/hr</span></div>
      <button className="btn btn-primary btn-sm" tabIndex={-1}>Book Session</button>
    </div>
  </div>
);

const LoadingGrid = () => (
  <div className="experts-grid">
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className="expert-card" style={{ opacity: 0.4, pointerEvents: 'none' }}>
        <div className="card-header">
          <div className="avatar" style={{ background: 'var(--bg-surface)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, background: 'var(--bg-surface)', borderRadius: 4, marginBottom: 8, width: '70%' }} />
            <div style={{ height: 11, background: 'var(--bg-surface)', borderRadius: 4, width: '50%' }} />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function ExpertListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['experts', debouncedSearch, category, page],
    queryFn: () => fetchExperts({ search: debouncedSearch, category, page }),
    keepPreviousData: true,
  });

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    setPage(1);
  }, []);

  const handleCategoryChange = useCallback((cat) => {
    setCategory(cat);
    setPage(1);
  }, []);

  const experts = data?.data?.experts || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Find Your Expert</h1>
        <p className="page-subtitle">Book 1-on-1 sessions with top industry professionals</p>
      </div>

      {/* Search & Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            id="expert-search"
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Search experts by name"
          />
        </div>
        <div className="filter-chips" role="group" aria-label="Filter by category">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`chip ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat)}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {isLoading && <LoadingGrid />}

      {isError && (
        <div className="state-box">
          <div className="state-icon">⚠️</div>
          <div className="state-title">Failed to load experts</div>
          <div className="state-text">{error?.message || 'Please check your connection and try again.'}</div>
        </div>
      )}

      {!isLoading && !isError && experts.length === 0 && (
        <div className="state-box">
          <div className="state-icon">🔍</div>
          <div className="state-title">No experts found</div>
          <div className="state-text">Try adjusting your search or filters.</div>
        </div>
      )}

      {!isLoading && !isError && experts.length > 0 && (
        <>
          <div className="experts-grid">
            {experts.map(expert => (
              <ExpertCard
                key={expert._id}
                expert={expert}
                onClick={() => navigate(`/experts/${expert._id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="pagination" role="navigation" aria-label="Expert list pagination">
              <button
                className="page-btn"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >‹</button>

              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`page-btn ${page === p ? 'current' : ''}`}
                  onClick={() => setPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={page === p ? 'page' : undefined}
                >{p}</button>
              ))}

              <button
                className="page-btn"
                onClick={() => setPage(p => p + 1)}
                disabled={page === pagination.pages}
                aria-label="Next page"
              >›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
