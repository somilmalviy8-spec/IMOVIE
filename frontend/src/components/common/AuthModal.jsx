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

  // Clear fields and error when modal opens/changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setError('');
      setName('');
      setEmail('');
      setPassword('');
    }
  }, [isAuthModalOpen, authModalMode]);

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
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cinema-modal-backdrop" onClick={closeAuthModal} role="dialog" aria-modal="true">
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

        <h3 className="fw-black mb-2" style={{ color: 'var(--text-heading)' }}>
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
        >
          <button
            type="button"
            className={`btn flex-fill py-2 text-center rounded-2 fw-bold small ${
              authModalMode === 'login'
                ? 'btn-cinema-primary text-white shadow-sm'
                : 'border-0 bg-transparent'
            }`}
            style={{ color: authModalMode === 'login' ? '#FFFFFF' : 'var(--text-heading)' }}
            onClick={() => {
              setAuthModalMode('login');
              setError('');
            }}
          >
            <LogIn size={16} className="me-1" /> Sign In
          </button>
          <button
            type="button"
            className={`btn flex-fill py-2 text-center rounded-2 fw-bold small ${
              authModalMode === 'register'
                ? 'btn-cinema-primary text-white shadow-sm'
                : 'border-0 bg-transparent'
            }`}
            style={{ color: authModalMode === 'register' ? '#FFFFFF' : 'var(--text-heading)' }}
            onClick={() => {
              setAuthModalMode('register');
              setError('');
            }}
          >
            <UserPlus size={16} className="me-1" /> Register
          </button>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4">
            <AlertCircle size={18} className="flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {authModalMode === 'register' && (
            <div className="mb-3">
              <label className="form-label small fw-bold" style={{ color: 'var(--text-heading)' }}>
                Full Name
              </label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </span>
                <input
                  type="text"
                  className="form-control cinema-input border-start-0"
                  placeholder="e.g. Jordan Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label small fw-bold" style={{ color: 'var(--text-heading)' }}>
              Email Address
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                <Mail size={18} />
              </span>
              <input
                type="email"
                className="form-control cinema-input border-start-0"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold" style={{ color: 'var(--text-heading)' }}>
              Password
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                <Lock size={18} />
              </span>
              <input
                type="password"
                className="form-control cinema-input border-start-0"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              <span className="spinner-border spinner-border-sm me-2" role="status" />
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
                onClick={() => setAuthModalMode('register')}
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
                onClick={() => setAuthModalMode('login')}
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
