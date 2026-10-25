import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { formatINR } from '../../utils/currency';

const ShowtimeList = ({ showtimes, loading, onSelectDateTomorrow }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="py-5 text-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading showtimes...</span>
        </div>
        <p className="text-muted small mt-2">Checking cinema schedules & auditorium availability...</p>
      </div>
    );
  }

  if (!showtimes || showtimes.length === 0) {
    return (
      <div className="cinema-card p-4 p-md-5 text-center my-4">
        <AlertCircle size={36} className="mb-3 mx-auto" style={{ color: 'var(--accent-coral)' }} />
        <h5 className="fw-bold mb-2" style={{ color: 'var(--text-heading)' }}>No Showtimes Available For This Date</h5>
        <p className="text-muted small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
          There are no scheduled screenings matching your chosen date and theatre selection. Try checking tomorrow's screenings!
        </p>
        {onSelectDateTomorrow && (
          <button
            type="button"
            className="btn btn-cinema-primary"
            onClick={onSelectDateTomorrow}
          >
            View Tomorrow's Shows
          </button>
        )}
      </div>
    );
  }

  // Group showtimes by theatre ID
  const theatreMap = {};
  showtimes.forEach((st) => {
    const tId = st.theatre?._id || 'unknown';
    if (!theatreMap[tId]) {
      theatreMap[tId] = {
        theatre: st.theatre,
        slots: [],
      };
    }
    theatreMap[tId].slots.push(st);
  });

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="d-flex flex-column gap-4">
      {Object.values(theatreMap).map(({ theatre, slots }) => (
        <div key={theatre?._id || Math.random()} className="cinema-card p-4">
          {/* Theatre Header */}
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pb-3 border-bottom mb-3 gap-2" style={{ borderColor: 'var(--border-subtle)' }}>
            <div>
              <h5 className="fw-bold mb-1" style={{ color: 'var(--text-heading)' }}>{theatre?.name || 'Multiplex Cinema'}</h5>
              <div className="text-muted small d-flex align-items-center gap-1">
                <MapPin size={14} className="flex-shrink-0" style={{ color: 'var(--accent-coral)' }} />
                <span>{theatre?.address}, {theatre?.city}</span>
              </div>
            </div>

            {/* Facilities badges */}
            <div className="d-flex flex-wrap gap-1">
              {theatre?.facilities?.slice(0, 3).map((facility, i) => (
                <span
                  key={i}
                  className="badge"
                  style={{
                    backgroundColor: 'var(--bg-surface-soft)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.7rem',
                  }}
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>

          {/* Time Slot Buttons */}
          <div className="d-flex flex-wrap gap-3">
            {slots.map((slot) => (
              <button
                key={slot._id}
                type="button"
                className="btn btn-cinema-outline text-start p-3 rounded-3 transition d-flex flex-column gap-1"
                style={{ minWidth: '150px' }}
                onClick={() => navigate(`/seat-selection/${slot._id}`)}
                aria-label={`Select showtime at ${formatTime(slot.startTime)} for ${slot.screenFormat} in ${slot.screenName}, price ${formatINR(slot.basePrice)}`}
              >
                <div className="d-flex justify-content-between align-items-center w-100 gap-2">
                  <span className="fw-black fs-5" style={{ color: 'var(--text-heading)' }}>
                    {formatTime(slot.startTime)}
                  </span>
                  <span className="badge-format" style={{ fontSize: '0.65rem' }}>
                    {slot.screenFormat}
                  </span>
                </div>

                <div className="d-flex justify-content-between align-items-center w-100 text-muted small mt-1">
                  <span style={{ fontSize: '0.75rem' }}>{slot.screenName}</span>
                  <span className="fw-bold" style={{ color: 'var(--accent-coral)', fontSize: '0.85rem' }}>
                    {formatINR(slot.basePrice)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShowtimeList;
