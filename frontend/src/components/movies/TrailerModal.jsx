import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const TrailerModal = ({ youtubeId, title, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!youtubeId) return null;

  return (
    <div className="cinema-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="trailer-modal-title">
      <div
        className="cinema-modal-content p-3 shadow-lg"
        style={{ maxWidth: '850px', backgroundColor: '#153C5B', border: '1px solid rgba(255, 255, 255, 0.2)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-3 px-2">
          <h5 id="trailer-modal-title" className="mb-0 text-white fw-bold text-truncate" style={{ maxWidth: '80%' }}>
            Official Trailer: {title}
          </h5>
          <button
            type="button"
            className="btn btn-link text-white-50 p-1"
            onClick={onClose}
            aria-label="Close trailer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
            title={`Trailer for ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
