import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter admin credentials.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(email, password, 'admin');
      if (res.success) navigate('/admin');
    } catch (err) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: '#fff', border: '1px solid #e1ebe8', borderRadius: '22px', padding: '38px', maxWidth: '430px', width: '100%', boxShadow: '0 18px 55px rgba(20,70,58,0.08)' }}>
        <div style={{ width: '58px', height: '58px', background: '#0d8b72', color: '#fff', borderRadius: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <Shield size={30} />
        </div>

        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#173e37', marginBottom: '6px' }}>District Admin Portal</h1>
        <p style={{ fontSize: '13px', color: '#7c8c87', marginBottom: '24px' }}>Manage rural healthcare facilities, ASHA networks, and district analytics.</p>

        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Admin Email</label>
            <input type="email" className="input-field" placeholder="admin@ruralcare.in" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" className="input-field" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={submitting}>
            {submitting ? 'Verifying...' : 'Access Admin Console'} <ArrowRight size={16} />
          </button>
        </form>

        <button onClick={() => { demoLogin('admin'); navigate('/admin'); }} style={{ width: '100%', marginTop: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', color: '#0d8b72' }}>
          ⚡ 1-Click Instant Admin Login
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: '12px', color: '#71807b' }}>← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
