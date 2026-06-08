import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPage implements the login form aligned with the responsive layout.
 * Connects to AuthContext backend login POST /api/auth/login.
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message || 'Invalid email or password');
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Login page submission error:', err);
      setError('An unexpected network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = authLoading || submitting;

  return (
    <div className="auth-page">
      {/* Left Branding/Hero Section - Desktop Only */}
      <section className="auth-hero-section">
        <div className="auth-logo">
          <span style={{ color: 'var(--accent-primary)' }}>🤝</span> RideSaathi
        </div>
        <div className="auth-hero-content">
          <h2 className="auth-hero-title">Share your journey, divide the cost.</h2>
          <p className="auth-hero-subtitle">
            RideSaathi connects driver-owners offering seats with commuters moving along similar routes. Save fuel, reduce carbon footprints, and meet friendly professionals.
          </p>
        </div>
      </section>

      {/* Right Form Panel - Responsive */}
      <main className="auth-form-panel">
        <div className="auth-form-wrapper">
          <header className="auth-form-header">
            <h3 className="auth-form-title">Welcome back</h3>
            <p className="auth-form-subtitle">Enter your credentials to access your ride dashboard</p>
          </header>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              marginBottom: '20px',
              fontWeight: '500'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
              style={{ width: '100%', padding: '14px', fontSize: '16px', marginTop: '8px', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <footer className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

