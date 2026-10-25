import React from 'react';
import { Calendar } from 'lucide-react';

const DateSelector = ({ selectedDate, onSelectDate }) => {
  // Generate dates: today + next 4 days
  const dates = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formatDayName = (date, index) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="mb-4" role="region" aria-label="Select screening date">
      <div
        className="d-flex align-items-center gap-2 mb-3 small fw-bold text-uppercase"
        style={{ color: 'var(--text-heading)', letterSpacing: '0.05em' }}
      >
        <Calendar size={16} style={{ color: 'var(--accent-coral)' }} aria-hidden="true" />
        <span>Select Screening Date</span>
      </div>

      <div
        className="d-flex gap-2 pb-2 overflow-x-auto"
        style={{ scrollbarWidth: 'thin' }}
        role="group"
        aria-label="Calendar day choices"
      >
        {dates.map((date, idx) => {
          const selected = isSameDay(date, selectedDate);
          const fullLabel = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          });

          return (
            <button
              key={idx}
              type="button"
              className={`btn d-flex flex-column align-items-center justify-content-center px-4 py-2 rounded-3 text-nowrap transition ${
                selected ? 'btn-cinema-primary shadow-sm' : 'btn-cinema-outline'
              }`}
              style={{ minWidth: '95px' }}
              onClick={() => onSelectDate(date)}
              aria-pressed={selected}
              aria-label={`${formatDayName(date, idx)}, ${fullLabel}`}
            >
              <span
                className="small fw-semibold"
                style={{ fontSize: '0.75rem', opacity: selected ? 0.95 : 0.8 }}
              >
                {formatDayName(date, idx)}
              </span>
              <span className="fs-5 fw-black my-0">{date.getDate()}</span>
              <span
                className="small text-uppercase"
                style={{ fontSize: '0.65rem', opacity: selected ? 0.9 : 0.75 }}
              >
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateSelector;
