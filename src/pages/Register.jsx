import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Stethoscope, Mail, Phone, MapPin, Lock, AlertCircle, ArrowRight, CheckSquare, Square } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('Citizen'); // 'Citizen', 'Worker'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!location.trim()) {
      setError('Please enter your village or district location.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setError('Please accept the terms and conditions to proceed.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register({
        fullName,
        email,
        phone,
        location,
        password,
        role
      });

      if (res.success) {
        const r = res.role.toLowerCase();
        if (r === 'worker') navigate('/worker');
        else navigate('/citizen');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-sidebar">
        <div className="auth-sidebar-header">
          <span>RuralCare</span>
        </div>
        <div className="auth-sidebar-body">
          <h2>Create Your Rural Health Account</h2>
          <p>
            Join thousands of rural families, ASHA workers, and healthcare providers accessing digital health records, emergency services, and AI triage.
          </p>
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          Free registration for all rural citizens & health workers.
        </div>
      </div>

      <div className="auth-form-container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <h1 className="auth-title">Register Account</h1>
        <p className="auth-subtitle">Fill in your details to create your RuralCare profile.</p>

        <div className="role-selector">
          <button
            type="button"
            className={`role-option ${role === 'Citizen' ? 'active' : ''}`}
            onClick={() => setRole('Citizen')}
          >
            <User size={16} /> Rural Citizen
          </button>
          <button
            type="button"
            className={`role-option ${role === 'Worker' ? 'active' : ''}`}
            onClick={() => setRole('Worker')}
          >
            <Stethoscope size={16} /> ASHA / Health Worker
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
            <label>Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Ramesh Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="ramesh@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                className="input-field"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Village / Mandal / Location</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Ramapuram Village, Chittoor"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Min 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0', fontSize: '13px', cursor: 'pointer' }} onClick={() => setTermsAccepted(!termsAccepted)}>
            {termsAccepted ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="#94a3b8" />}
            <span>I accept the <strong style={{ color: 'var(--primary)' }}>Terms of Service & Privacy Policy</strong></span>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Create Account & Log In'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
