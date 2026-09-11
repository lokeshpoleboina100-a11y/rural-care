import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, User, LogOut, Bot, Shield, Stethoscope, PhoneCall, Calendar, FileText, Globe, Store } from 'lucide-react';

export default function Navbar({ onOpenAIHelp }) {
  const { user, role, logout, lang, changeLanguage, t } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'worker') return '/worker';
    return '/citizen';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="brand-logo">
          <div className="brand-icon">
            <HeartPulse size={22} />
          </div>
          <div>
            <span>RuralCare</span>
            <span className="brand-tag">{t.brandTag}</span>
          </div>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            {t.home}
          </Link>
          <Link to="/emergency" className={`nav-link ${location.pathname === '/emergency' ? 'active' : ''}`}>
            <PhoneCall size={15} /> {t.emergency}
          </Link>
          <Link to="/appointments" className={`nav-link ${location.pathname === '/appointments' ? 'active' : ''}`}>
            <Calendar size={15} /> {t.appointments}
          </Link>
          <Link to="/records" className={`nav-link ${location.pathname === '/records' ? 'active' : ''}`}>
            <FileText size={15} /> {t.healthRecords}
          </Link>
          <Link to="/pharmacies" className={`nav-link ${location.pathname === '/pharmacies' ? 'active' : ''}`}>
            <Store size={15} /> {t.pharmacies}
          </Link>

          {user && (
            <Link to={getDashboardPath()} className={`nav-link ${location.pathname.startsWith('/citizen') || location.pathname.startsWith('/worker') || location.pathname.startsWith('/admin') ? 'active' : ''}`}>
              {t.dashboard}
            </Link>
          )}
        </div>

        <div className="nav-actions">
          {/* LANGUAGE SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <Globe size={14} color="var(--primary)" />
            <select
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              style={{ background: 'transparent', border: 'none', fontSize: '12px', fontWeight: 700, outline: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="te">తెలుగు</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>

          <button className="ai-help-btn" onClick={onOpenAIHelp}>
            <Bot size={16} />
            <span>{t.aiAssistantBtn}</span>
          </button>

          {user ? (
            <div className="user-badge">
              <div className="user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name || user.email}</span>
                <span className="user-role-label">{user.role}</span>
              </div>
              <button className="logout-icon-btn" title="Logout" onClick={handleLogout}>
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                <User size={15} /> {t.signIn}
              </Link>
              <Link to="/register" className="register-btn">
                {t.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
