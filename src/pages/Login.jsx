import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Stethoscope, AlertCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();

  const [roleTab, setRoleTab] = useState('Citizen'); // 'Citizen', 'Worker', 'Admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password, roleTab);
      if (res.success) {
        const r = res.role.toLowerCase();
        if (r === 'admin') navigate('/admin');
        else if (r === 'worker') navigate('/worker');
        else navigate('/citizen');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = (targetRole) => {
    const res = demoLogin(targetRole);
    if (res.success) {
      const r = res.role.toLowerCase();
      if (r === 'admin') navigate('/admin');
      else if (r === 'worker') navigate('/worker');
      else navigate('/citizen');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-sidebar">
        <div className="auth-sidebar-header">
          <span>RuralCare</span>
        </div>
        <div className="auth-sidebar-body">
          <h2>Welcome Back to Rural Care</h2>
          <p>
            Sign in to access your digital health records, ASHA triage requests, tele-consultations, and government health scheme benefits.
          </p>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          Need assistance? Click the AI Help Desk icon anytime.
        </div>
      </div>

      <div className="auth-form-container">
        <h1 className="auth-title">Sign In</h1>
        <p className="auth-subtitle">Choose your role and enter your login credentials.</p>

        <div className="role-selector">
          <button
            type="button"
            className={`role-option ${roleTab === 'Citizen' ? 'active' : ''}`}
            onClick={() => { setRoleTab('Citizen'); setError(''); }}
          >
            <User size={16} /> Citizen
          </button>
          <button
            type="button"
            className={`role-option ${roleTab === 'Worker' ? 'active' : ''}`}
            onClick={() => { setRoleTab('Worker'); setError(''); }}
          >
            <Stethoscope size={16} /> Healthcare Worker
          </button>
          <button
            type="button"
            className={`role-option ${roleTab === 'Admin' ? 'active' : ''}`}
            onClick={() => { setRoleTab('Admin'); setError(''); }}
          >
            <ShieldCheck size={16} /> Admin
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="e.g. Ramesh@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? 'Signing in...' : `Sign In as ${roleTab}`} <ArrowRight size={16} />
          </button>
        </form>

        <div className="demo-login-box">
          <p className="demo-login-title">⚡ 1-Click Instant Demo Login</p>
          <div className="demo-btns">
            <button className="demo-btn" onClick={() => handleDemoLogin('citizen')}>
              <User size={14} /> Demo Citizen
            </button>
            <button className="demo-btn" onClick={() => handleDemoLogin('worker')}>
              <Stethoscope size={14} /> Demo ASHA Worker
            </button>
            <button className="demo-btn" onClick={() => handleDemoLogin('admin')}>
              <ShieldCheck size={14} /> Demo Admin
            </button>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Register now</Link>
        </div>
      </div>
    </div>
  );
}
