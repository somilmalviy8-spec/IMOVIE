import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAuthenticated, isAdmin, openAuthModal } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      openAuthModal('login');
    }
  }, [loading, isAuthenticated, openAuthModal]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="cinema-card p-5 d-inline-block mx-auto text-center" style={{ maxWidth: 500 }}>
          <ShieldAlert size={48} className="text-danger mb-3" />
          <h3 className="fw-bold text-white mb-2">Access Restricted</h3>
          <p className="text-muted">
            You need administrator privileges to view this portal.
          </p>
          <a href="/" className="btn btn-cinema-primary mt-3">
            Return to Cinema Home
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
