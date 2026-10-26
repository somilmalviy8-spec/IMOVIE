import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Film, User, Ticket, Shield, LogOut, Menu, X, ChevronDown, History } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top cinema-glass py-3" style={{ zIndex: 1000 }}>
      <div className="container">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 fw-black fs-4" onClick={closeMenus}>
          <div
            className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm"
            style={{ width: 38, height: 38, backgroundColor: 'var(--accent-coral)' }}
          >
            <Film size={22} />
          </div>
          <span className="fw-black tracking-tight" style={{ color: 'var(--text-heading)' }}>
            THE <span style={{ color: 'var(--accent-coral)' }}>IMOVIES</span>
          </span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="navbar-toggler p-2 d-lg-none"
          type="button"
          style={{ borderColor: 'var(--text-heading)', color: 'var(--text-heading)' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Nav Links & Actions */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show mt-3 p-3 cinema-card' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-3">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `nav-link px-2 fw-bold ${
                    isActive ? 'border-bottom border-2' : ''
                  }`
                }
                style={({ isActive }) => ({
                  color: isActive ? 'var(--accent-coral)' : 'var(--text-heading)',
                  borderColor: 'var(--accent-coral)',
                })}
                onClick={closeMenus}
              >
                Discover Movies
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/?status=now_showing"
                className="nav-link px-2 fw-semibold"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => {
                  closeMenus();
                  navigate('/?status=now_showing');
                }}
              >
                Now Showing
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/?status=coming_soon"
                className="nav-link px-2 fw-semibold"
                style={{ color: 'var(--text-muted)' }}
                onClick={() => {
                  closeMenus();
                  navigate('/?status=coming_soon');
                }}
              >
                Coming Soon
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `nav-link px-2 fw-semibold d-flex align-items-center gap-1 ${
                    isActive ? 'fw-bold text-decoration-underline' : ''
                  }`
                }
                style={{ color: 'var(--text-muted)' }}
                onClick={closeMenus}
              >
                <History size={16} style={{ color: 'var(--accent-coral)' }} />
                <span>History</span>
              </NavLink>
            </li>

            {isAdmin && (
              <li className="nav-item">
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `nav-link px-2 d-flex align-items-center gap-1 fw-bold ${
                      isActive ? 'text-decoration-underline' : ''
                    }`
                  }
                  style={{ color: 'var(--text-heading)' }}
                  onClick={closeMenus}
                >
                  <Shield size={16} className="text-primary" /> Admin Portal
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right Auth / Profile Controls */}
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <div className="position-relative">
                <button
                  type="button"
                  className="btn btn-cinema-outline py-2 px-3 d-flex align-items-center gap-2 rounded-pill"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                >
                  <div
                    className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                    style={{
                      width: 28,
                      height: 28,
                      fontSize: '0.8rem',
                      backgroundColor: 'var(--accent-blue)',
                    }}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span
                    className="small fw-bold text-truncate d-none d-sm-inline"
                    style={{ maxWidth: 120, color: 'var(--text-heading)' }}
                  >
                    {user?.name}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--text-heading)' }} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="position-absolute end-0 mt-2 p-2 cinema-card rounded-3 shadow-lg"
                    style={{ minWidth: 220, zIndex: 1100, background: '#FFFFFF' }}
                  >
                    <div className="px-3 py-2 border-bottom border-light-subtle mb-1">
                      <div className="fw-bold small text-truncate" style={{ color: 'var(--text-heading)' }}>
                        {user?.name}
                      </div>
                      <div className="text-muted small text-truncate">{user?.email}</div>
                      {isAdmin && (
                        <span
                          className="badge text-uppercase mt-1"
                          style={{
                            fontSize: '0.65rem',
                            backgroundColor: 'var(--accent-coral)',
                            color: '#FFFFFF',
                          }}
                        >
                          ADMINISTRATOR
                        </span>
                      )}
                    </div>

                    <Link
                      to="/profile"
                      className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded hover-bg"
                      style={{ color: 'var(--text-heading)', fontWeight: 600 }}
                      onClick={closeMenus}
                    >
                      <User size={16} style={{ color: 'var(--accent-coral)' }} /> My Profile
                    </Link>

                    <Link
                      to="/profile?tab=bookings"
                      className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded hover-bg"
                      style={{ color: 'var(--text-heading)', fontWeight: 600 }}
                      onClick={closeMenus}
                    >
                      <Ticket size={16} style={{ color: 'var(--accent-coral)' }} /> My Bookings
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded hover-bg"
                        style={{ color: 'var(--text-heading)', fontWeight: 600 }}
                        onClick={closeMenus}
                      >
                        <Shield size={16} style={{ color: 'var(--accent-blue)' }} /> Admin Dashboard
                      </Link>
                    )}

                    <div className="dropdown-divider my-1" />

                    <button
                      type="button"
                      className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 text-danger rounded hover-bg w-100 border-0 bg-transparent fw-semibold"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-cinema-outline py-2 px-3"
                  onClick={() => {
                    closeMenus();
                    openAuthModal('login');
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="btn btn-cinema-primary py-2 px-3"
                  onClick={() => {
                    closeMenus();
                    openAuthModal('register');
                  }}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
