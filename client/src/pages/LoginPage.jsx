/**
 * Login/Register Page
 * Handles both login and account creation in a single togglable form.
 * On success, stores JWT + user profile in localStorage and notifies parent.
 */

import { useState } from 'react';
import axios from 'axios';
import './LoginPage.css';

export default function LoginPage({ onLogin }) {
  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload  = mode === 'login'
        ? { email, password }
        : { name, email, password };

      const res = await axios.post(endpoint, payload);
      const { token, user } = res.data;

      // Persist token so it survives page refresh
      localStorage.setItem('skillmatch_token', token);
      localStorage.setItem('skillmatch_user',  JSON.stringify(user));

      onLogin(user, token);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">⚡</div>
        <h1 className="login-title">SkillMatch</h1>
        <p className="login-subtitle">
          Find internships & hackathons matched to your exact skills
        </p>

        {/* Toggle */}
        <div className="login-toggle">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Log In
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="field-group">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="e.g. Rishi Kumar"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="field-group">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@college.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="field-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading
              ? '⏳ Please wait...'
              : mode === 'login' ? '🔑 Log In' : '🚀 Create Account'}
          </button>
        </form>

        <p className="login-hint">
          {mode === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <button
            className="switch-link"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          >
            {mode === 'login' ? 'Register free' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
