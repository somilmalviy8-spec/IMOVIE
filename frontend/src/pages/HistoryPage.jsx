import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Ticket, History } from 'lucide-react';
import BookingHistorySection from '../components/bookings/BookingHistorySection';

const HistoryPage = () => {
  return (
    <div className="container py-4">
      <div className="mb-3">
        <Link
          to="/"
          className="btn btn-sm btn-cinema-outline mb-3 d-inline-flex align-items-center gap-1"
        >
          <ChevronLeft size={16} /> Back to Movies
        </Link>
        <div className="d-flex align-items-center gap-2 mb-1">
          <History size={24} style={{ color: 'var(--accent-coral)' }} />
          <h2 className="fw-black mb-0" style={{ color: 'var(--text-heading)' }}>
            Ticket Booking History
          </h2>
        </div>
        <p className="text-muted small">
          Review all your confirmed movie tickets, digital auditorium entry passes, and demo payment receipts.
        </p>
      </div>

      <BookingHistorySection isFullPage={false} />
    </div>
  );
};

export default HistoryPage;
