import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Mail, Lock, User, AlertCircle, LogIn, UserPlus } from 'lucide-react';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, setAuthModalMode, login, register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Clear fields only when the modal opens fresh from closed state
  const prevOpenRef = React.useRef(isAuthModalOpen);
  useEffect(() => {
    if (isAuthModalOpen && !prevOpenRef.current) {
      setError('');
      setName('');
      setEmail('');
      setPassword('');
    }
    prevOpenRef.current = isAuthModalOpen;
  }, [isAuthModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleModeSwitch = (mode) => {
    setAuthModalMode(mode);
    setError('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          throw new Error('Please provide your name.');
        }
        await register(name, email, password);
      }
    } catch (err) {
      // Name and email states are preserved; only error is populated
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cinema-modal-backdrop" onClick={closeAuthModal} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div
        className="cinema-modal-content p-4 p-md-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge rounded-pill px-3 py-2 fw-bold text-white shadow-sm"
              style={{ backgroundColor: 'var(--accent-coral)' }}
            >
              {authModalMode === 'login' ? 'WELCOME BACK' : 'JOIN THE IMOVIES'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link p-0"
            style={{ color: 'var(--text-muted)' }}
            onClick={closeAuthModal}
            aria-label="Close dialog"
          >
            <X size={24} />
          </button>
        </div>

        <h3 id="auth-modal-title" className="fw-black mb-2" style={{ color: 'var(--text-heading)' }}>
          {authModalMode === 'login' ? 'Sign In to Your Account' : 'Create Free Moviegoer Account'}
        </h3>
        <p className="small mb-4" style={{ color: 'var(--text-muted)' }}>
          {authModalMode === 'login'
            ? 'Access your tickets, review past bookings, and reserve seats in seconds.'
            : 'Register to unlock instant seat reservations, digital tickets, and personalized schedules.'}
        </p>

        {/* Tab Switcher */}
        <div
          className="d-flex p-1 rounded-3 mb-4"
          style={{ background: '#F0ECE3', border: '1px solid var(--border-subtle)' }}
          role="tablist"
          aria-label="Authentication Options"
        >
          <button
            type="button"
            role="tab"
            aria-selected={authModalMode === 'login'}
            className={`btn flex-fill py-2 text-center rounded-2 fw-bold small ${
              authModalMode === 'login'
                ? 'btn-cinema-primary text-white shadow-sm'
                : 'border-0 bg-transparent'
            }`}
            style={{ color: authModalMode === 'login' ? '#FFFFFF' : 'var(--text-heading)' }}
            onClick={() => handleModeSwitch('login')}
          >
            <LogIn size={16} className="me-1" aria-hidden="true" /> Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={authModalMode === 'register'}
            className={`btn flex-fill py-2 text-center rounded-2 fw-bold small ${
              authModalMode === 'register'
                ? 'btn-cinema-primary text-white shadow-sm'
                : 'border-0 bg-transparent'
            }`}
            style={{ color: authModalMode === 'register' ? '#FFFFFF' : 'var(--text-heading)' }}
            onClick={() => handleModeSwitch('register')}
          >
            <UserPlus size={16} className="me-1" aria-hidden="true" /> Register
          </button>
        </div>

        {error && (
          <div
            id="auth-error-alert"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className="alert alert-danger py-2 px-3 small d-flex align-items-start gap-2 mb-4 shadow-sm"
            style={{ borderRadius: '8px' }}
          >
            <AlertCircle size={18} className="flex-shrink-0 mt-1" aria-hidden="true" />
            <div className="flex-grow-1">
              <strong>Connection Notice:</strong> {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate={false}>
          {authModalMode === 'register' && (
            <div className="mb-3">
              <label htmlFor="auth-register-name" className="form-label small fw-bold" style={{ color: 'var(--text-heading)' }}>
                Full Name
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <User size={18} aria-hidden="true" />
                </span>
                <input
                  id="auth-register-name"
                  type="text"
                  className="form-control cinema-input border-start-0"
                  placeholder="e.g. Jordan Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "auth-error-alert" : undefined}
                  autoComplete="name"
                  required
                />
              </div>
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="auth-email-input" className="form-label small fw-bold" style={{ color: 'var(--text-heading)' }}>
              Email Address
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                <Mail size={18} aria-hidden="true" />
              </span>
              <input
                id="auth-email-input"
                type="email"
                className="form-control cinema-input border-start-0"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "auth-error-alert" : undefined}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="auth-password-input" className="form-label small fw-bold" style={{ color: 'var(--text-heading)' }}>
              Password
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                <Lock size={18} aria-hidden="true" />
              </span>
              <input
                id="auth-password-input"
                type="password"
                className="form-control cinema-input border-start-0"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "auth-error-alert" : undefined}
                autoComplete={authModalMode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-cinema-primary w-100 py-2 fs-6 fw-bold shadow"
            disabled={submitting}
          >
            {submitting ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            ) : null}
            {authModalMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div
          className="mt-4 pt-3 text-center small"
          style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          {authModalMode === 'login' ? (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                className="btn btn-link p-0 fw-bold text-decoration-none"
                style={{ color: 'var(--accent-coral)' }}
                onClick={() => handleModeSwitch('register')}
              >
                Create one now
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                type="button"
                className="btn btn-link p-0 fw-bold text-decoration-none"
                style={{ color: 'var(--accent-coral)' }}
                onClick={() => handleModeSwitch('login')}
              >
                Sign in here
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

