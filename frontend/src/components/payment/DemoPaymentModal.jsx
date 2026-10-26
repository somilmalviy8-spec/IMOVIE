import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '../../utils/currency';

/**
 * Educational Demo Payment Gateway Simulator
 * Provides a realistic, step-by-step educational payment processing simulation
 * (Handshake -> 3D-Secure OTP -> Authorization -> Confirmation)
 */
const DemoPaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  selectedMethod,
  methodData,
  movieTitle,
  seatCount,
}) => {
  const [stage, setStage] = useState('handshake'); // 'handshake' | 'otp' | 'processing' | 'success' | 'failed'
  const [demoOtp, setDemoOtp] = useState('894562');
  const [enteredOtp, setEnteredOtp] = useState('894562');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [transactionId] = useState(
    () => `TXN_DEMO_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`
  );

  useEffect(() => {
    if (!isOpen) {
      setStage('handshake');
      setEnteredOtp('894562');
      setErrorMessage('');
      return;
    }

    // Step 1: Simulate connection & gateway handshake (1.2 seconds)
    setStage('handshake');
    const timer1 = setTimeout(() => {
      setStage('otp');
    }, 1300);

    return () => clearTimeout(timer1);
  }, [isOpen]);

  // Countdown timer for demo OTP
  useEffect(() => {
    if (stage !== 'otp') return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  if (!isOpen) return null;

  const handleAuthorize = () => {
    if (!enteredOtp || enteredOtp.trim().length < 4) {
      setErrorMessage('Please enter a valid demo 6-digit OTP code.');
      return;
    }

    setErrorMessage('');
    setStage('processing');

    setTimeout(() => {
      setStage('success');
      setTimeout(() => {
        onSuccess({
          transactionId,
          method: selectedMethod,
          maskedCardOrVpa: methodData.masked,
          bankOrProvider: methodData.provider,
          paidAt: new Date().toISOString(),
          status: 'completed',
        });
      }, 1200);
    }, 1500);
  };

  const handleSimulateDecline = () => {
    setStage('failed');
    setErrorMessage('Simulated Card Decline: The issuing bank rejected the demo authorization request.');
  };

  const getMethodIcon = () => {
    switch (selectedMethod) {
      case 'upi':
        return <Smartphone size={20} className="text-primary" />;
      case 'netbanking':
        return <Building2 size={20} className="text-info" />;
      case 'wallet':
        return <Wallet size={20} className="text-warning" />;
      case 'card':
      default:
        return <CreditCard size={20} className="text-success" />;
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(6px)',
        zIndex: 1060,
      }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
        <div
          className="modal-content shadow-lg rounded-4 overflow-hidden"
          style={{
            border: '2px solid var(--accent-coral)',
            backgroundColor: '#FFFFFF',
            color: '#153C5B',
          }}
        >
          {/* Header */}
          <div
            className="p-3 d-flex justify-content-between align-items-center text-white"
            style={{ backgroundColor: '#153C5B' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle p-1 d-flex align-items-center justify-content-center"
                style={{ backgroundColor: 'var(--accent-coral)' }}
              >
                <ShieldCheck size={18} className="text-white" />
              </div>
              <div>
                <div className="fw-bold small lh-1">The IMovies Payment Gateway</div>
                <div className="text-warning font-monospace" style={{ fontSize: '0.68rem' }}>
                  🧪 Educational Sandbox Mode (Simulation)
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-sm btn-link text-white-50 p-0 text-decoration-none"
              onClick={onClose}
              disabled={stage === 'processing' || stage === 'success'}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Amount Subheader */}
          <div
            className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center"
            style={{ backgroundColor: '#F8FAFC' }}
          >
            <div>
              <div className="small text-muted mb-0">{movieTitle} ({seatCount} {seatCount === 1 ? 'seat' : 'seats'})</div>
              <div className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                Ref: {transactionId}
              </div>
            </div>
            <div className="text-end">
              <span className="small text-muted d-block" style={{ fontSize: '0.72rem' }}>Amount Due</span>
              <span className="fs-4 fw-black text-dark">{formatINR(amount)}</span>
            </div>
          </div>

          {/* Body Content by Stage */}
          <div className="p-4">
            {stage === 'handshake' && (
              <div className="py-4 text-center">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                  <span className="visually-hidden">Connecting...</span>
                </div>
                <h6 className="fw-bold mb-1">Connecting to Demo Payment Switch</h6>
                <p className="text-muted small mb-0">
                  Establishing secure TLS handshake with simulated banking server...
                </p>
                <div className="mt-3 badge bg-light text-secondary border small">
                  Target Gateway: {methodData.provider || 'Demo Bank Node'}
                </div>
              </div>
            )}

            {stage === 'otp' && (
              <div>
                <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <Sparkles size={16} className="flex-shrink-0 text-primary" />
                  <div>
                    <strong>Demo 3D-Secure 2.0 Simulation:</strong> Test code{' '}
                    <span className="badge bg-primary font-monospace">{demoOtp}</span> has been auto-filled.
                  </div>
                </div>

                <div className="p-3 rounded-3 mb-3 border bg-light">
                  <div className="d-flex align-items-center gap-2 small fw-semibold mb-2">
                    {getMethodIcon()}
                    <span>Payment Channel: {methodData.provider}</span>
                  </div>
                  <div className="small text-muted font-monospace mb-1">
                    Identifier: <strong>{methodData.masked}</strong>
                  </div>
                  <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                    A one-time simulation verification PIN has been issued.
                  </div>
                </div>

                {errorMessage && (
                  <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-bold mb-1 d-flex justify-content-between">
                    <span>Enter 6-Digit Demo OTP</span>
                    <span className="text-muted small">Expires in {countdown}s</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    className="form-control form-control-lg text-center font-monospace fw-bold fs-4 tracking-widest"
                    placeholder="894562"
                    style={{ letterSpacing: '6px' }}
                  />
                  <div className="form-text small text-muted text-center mt-1">
                    Demo bypass: You can submit any 6 digits to simulate approval.
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-success py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                    onClick={handleAuthorize}
                  >
                    <CheckCircle2 size={18} /> Authorize & Pay {formatINR(amount)}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm py-1"
                    onClick={handleSimulateDecline}
                  >
                    Simulate Bank Decline (Test Error)
                  </button>
                </div>
              </div>
            )}

            {stage === 'processing' && (
              <div className="py-4 text-center">
                <div
                  className="spinner-grow text-success mb-3"
                  style={{ width: '3rem', height: '3rem' }}
                  role="status"
                >
                  <span className="visually-hidden">Authorizing...</span>
                </div>
                <h6 className="fw-bold mb-1">Authorizing Payment of {formatINR(amount)}</h6>
                <p className="text-muted small mb-0">
                  Verifying demo transaction credentials and recording ledger settlement...
                </p>
                <div className="progress mt-3" style={{ height: '6px' }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-success w-75"
                    role="progressbar"
                  />
                </div>
              </div>
            )}

            {stage === 'success' && (
              <div className="py-4 text-center">
                <div
                  className="rounded-circle bg-success text-white mx-auto mb-3 d-flex align-items-center justify-content-center shadow"
                  style={{ width: '64px', height: '64px' }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h5 className="fw-bold text-success mb-1">Payment Authorized!</h5>
                <p className="text-muted small mb-2">
                  Demo transaction completed successfully.
                </p>
                <div className="badge bg-light text-dark border font-monospace py-2 px-3 small">
                  TXN: {transactionId}
                </div>
                <p className="text-muted small mt-3 mb-0">
                  Finalizing digital ticket issuance...
                </p>
              </div>
            )}

            {stage === 'failed' && (
              <div className="py-3 text-center">
                <div
                  className="rounded-circle bg-danger text-white mx-auto mb-3 d-flex align-items-center justify-content-center shadow"
                  style={{ width: '64px', height: '64px' }}
                >
                  <AlertCircle size={36} />
                </div>
                <h5 className="fw-bold text-danger mb-1">Payment Simulation Failed</h5>
                <p className="text-muted small mb-3">
                  {errorMessage || 'The demo bank transaction could not be authorized.'}
                </p>
                <div className="d-grid gap-2">
                  <button
                    type="button"
                    className="btn btn-cinema-primary py-2 fw-bold"
                    onClick={() => {
                      setStage('otp');
                      setEnteredOtp('894562');
                      setErrorMessage('');
                    }}
                  >
                    Retry Authorization
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary py-1 small"
                    onClick={onClose}
                  >
                    Cancel & Return to Order
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div
            className="p-2 text-center text-muted border-top"
            style={{ backgroundColor: '#F8FAFC', fontSize: '0.72rem' }}
          >
            <Lock size={12} className="me-1 inline" />
            256-Bit SSL Demo Sandbox • Academic Simulation Only
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPaymentModal;
