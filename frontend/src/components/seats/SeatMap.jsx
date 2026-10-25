import React from 'react';
import { formatINR } from '../../utils/currency';

const SeatMap = ({
  seats,
  selectedSeats,
  onToggleSeat,
  tierPricing,
}) => {
  // Group seats by row letter
  const rowsMap = {};
  seats.forEach((seat) => {
    if (!rowsMap[seat.row]) {
      rowsMap[seat.row] = [];
    }
    rowsMap[seat.row].push(seat);
  });

  // Sort rows alphabetically (A down to H)
  const sortedRowKeys = Object.keys(rowsMap).sort();
  sortedRowKeys.forEach((rowKey) => {
    rowsMap[rowKey].sort((a, b) => a.number - b.number);
  });

  const isSeatSelected = (row, number) => {
    return selectedSeats.some((s) => s.row === row && s.number === number);
  };

  return (
    <div className="w-100">
      {/* Curved Screen Graphic */}
      <div className="cinema-screen-container">
        <div className="cinema-screen-curve" />
        <div className="cinema-screen-label">Auditorium Screen • All Eyes Front</div>
      </div>

      {/* Seat Tier & Status Legend on Clean White Surface */}
      <div
        className="d-flex flex-wrap justify-content-center align-items-center gap-3 gap-md-4 py-3 mb-4 rounded-3 shadow-sm"
        style={{ background: '#FFFFFF', border: '1px solid var(--border-subtle)' }}
      >
        <div className="d-flex align-items-center gap-2 small">
          <div className="seat-node available" style={{ width: 20, height: 20, cursor: 'default' }} />
          <span style={{ color: 'var(--text-muted)' }}>Available</span>
        </div>

        <div className="d-flex align-items-center gap-2 small">
          <div className="seat-node selected" style={{ width: 20, height: 20, cursor: 'default' }} />
          <span className="fw-bold" style={{ color: 'var(--accent-coral)' }}>Selected</span>
        </div>

        <div className="d-flex align-items-center gap-2 small">
          <div className="seat-node held" style={{ width: 20, height: 20, cursor: 'default' }} />
          <span style={{ color: 'var(--text-muted)' }}>In Another Hold</span>
        </div>

        <div className="d-flex align-items-center gap-2 small">
          <div className="seat-node booked" style={{ width: 20, height: 20, cursor: 'default' }} />
          <span style={{ color: 'var(--text-dim)' }}>Booked</span>
        </div>

        <div
          className="ps-3 d-none d-md-flex align-items-center gap-3"
          style={{ borderLeft: '1px solid var(--border-subtle)' }}
        >
          <span className="small" style={{ color: 'var(--text-muted)' }}>
            Standard: <strong style={{ color: 'var(--text-heading)' }}>{formatINR(tierPricing?.standard || 250)}</strong>
          </span>
          <span className="small" style={{ color: 'var(--text-heading)' }}>
            Premium: <strong>{formatINR(tierPricing?.premium || 340)}</strong>
          </span>
          <span className="small" style={{ color: 'var(--accent-coral)' }}>
            VIP Recliner: <strong>{formatINR(tierPricing?.vip || 450)}</strong>
          </span>
        </div>
      </div>

      {/* Scrollable Container for Narrow Screen Protection */}
      <div
        className="w-100 overflow-x-auto pb-4 text-center"
        style={{ scrollbarWidth: 'thin' }}
      >
        <div className="d-inline-flex flex-column gap-2" style={{ minWidth: '580px' }}>
          {sortedRowKeys.map((rowKey) => {
            const rowSeats = rowsMap[rowKey];
            const sampleSeat = rowSeats[0];

            return (
              <div key={rowKey} className="d-flex align-items-center justify-content-center gap-2">
                {/* Left Row Label */}
                <div
                  className="fw-bold small text-center"
                  style={{ width: 24, fontSize: '0.8rem', color: 'var(--text-heading)' }}
                >
                  {rowKey}
                </div>

                {/* Seat Nodes with Aisle Gaps */}
                <div className="d-flex align-items-center gap-1 gap-sm-2">
                  {rowSeats.map((seat, seatIdx) => {
                    const selected = isSeatSelected(seat.row, seat.number);
                    const isBooked = seat.status === 'booked';
                    const isHeld = seat.status === 'held' && !seat.isMyHold;

                    // Insert an aisle gap in the middle
                    const isAisleGap = seatIdx === Math.floor(rowSeats.length / 2) - 1;

                    let nodeClass = 'seat-node available';
                    if (isBooked) nodeClass = 'seat-node booked';
                    else if (isHeld) nodeClass = 'seat-node held';
                    else if (selected) nodeClass = 'seat-node selected';

                    if (seat.tier === 'vip') nodeClass += ' seat-tier-vip';
                    else if (seat.tier === 'premium') nodeClass += ' seat-tier-premium';

                    return (
                      <React.Fragment key={`${seat.row}-${seat.number}`}>
                        <button
                          type="button"
                          className={nodeClass}
                          disabled={isBooked || isHeld}
                          onClick={() => onToggleSeat(seat)}
                          title={`Row ${seat.row}, Seat ${seat.number} (${seat.tier.toUpperCase()}) - ${formatINR(seat.price)}`}
                          aria-label={`Seat ${seat.row}${seat.number}`}
                        >
                          {seat.number}
                        </button>

                        {isAisleGap && (
                          <div style={{ width: '24px' }} aria-hidden="true" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Row Label */}
                <div
                  className="fw-bold small text-center"
                  style={{ width: 24, fontSize: '0.8rem', color: 'var(--text-heading)' }}
                >
                  {rowKey}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
