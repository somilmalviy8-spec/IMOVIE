import React from 'react';
import { Film, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      className="mt-5 pt-5 pb-4"
      style={{
        backgroundColor: '#153C5B',
        color: '#EAE6DE',
        borderTop: '2px solid #226192',
      }}
    >
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm"
                style={{ width: 32, height: 32, backgroundColor: 'var(--accent-coral)' }}
              >
                <Film size={18} />
              </div>
              <span className="fw-black fs-5 tracking-tight text-white">
                THE <span style={{ color: 'var(--accent-coral)' }}>IMOVIES</span>
              </span>
            </div>
            <p className="small mb-0" style={{ color: '#BACCDA', lineHeight: '1.6' }}>
              The premier cinema ticket reservation platform. Discover upcoming releases, choose premium auditoriums (IMAX 3D, Dolby Atmos, VIP Recliners), and select your favorite seats with instant digital confirmation.
            </p>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold mb-3 small text-uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
              Explore
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/?status=now_showing" style={{ color: '#BACCDA' }} className="hover-coral">
                  Now Showing
                </Link>
              </li>
              <li>
                <Link to="/?status=coming_soon" style={{ color: '#BACCDA' }} className="hover-coral">
                  Coming Soon
                </Link>
              </li>
              <li>
                <Link to="/#theatres" style={{ color: '#BACCDA' }} className="hover-coral">
                  Cinemas & Formats
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold mb-3 small text-uppercase tracking-wider" style={{ color: '#FFFFFF' }}>
              Account
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li>
                <Link to="/profile" style={{ color: '#BACCDA' }} className="hover-coral">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/profile?tab=bookings" style={{ color: '#BACCDA' }} className="hover-coral">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/admin" style={{ color: '#BACCDA' }} className="hover-coral">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <div
              className="p-3 rounded-3 shadow-sm"
              style={{
                backgroundColor: '#102F48',
                border: '1px solid #226192',
              }}
            >
              <div
                className="d-flex align-items-center gap-2 mb-2 small fw-bold"
                style={{ color: 'var(--accent-coral)' }}
              >
                <Info size={16} /> Payment Notice
              </div>
              <p className="small mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.45', color: '#BACCDA' }}>
                Payment processing is explicitly <strong>out of scope</strong> for this academic demonstration project. No real financial credentials or payment cards are required or collected. Bookings are instantly confirmed directly upon review.
              </p>
            </div>
          </div>
        </div>

        <div
          className="pt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 small"
          style={{ borderTop: '1px solid #226192', color: '#97ADC0' }}
        >
          <div>
            © {new Date().getFullYear()} The IMovies Cinema Project. Built for academic demonstration.
          </div>
          <div className="d-flex align-items-center gap-3">
            <span>React + Node.js + Express + MongoDB</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
