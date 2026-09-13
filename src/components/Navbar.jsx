import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, User, LogOut, Bot, Shield, Stethoscope, PhoneCall, Calendar, FileText, Globe, Store, ChevronDown, Users, Compass, Pill, Activity, UserPlus } from 'lucide-react';
import UrgentRegistrationModal from './UrgentRegistrationModal';

export default function Navbar({ onOpenAIHelp }) {
  const { user, role, logout, lang, changeLanguage, t } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isUrgentModalOpen, setIsUrgentModalOpen] = useState(false);

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
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* LEFT: BRAND LOGO + SUBTITLE */}
          <Link to="/" className="brand-logo">
            <div className="brand-icon">
              <HeartPulse size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>RuralCare</span>
                <span className="brand-tag">{t.brandTag}</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', lineHeight: 1 }}>
                Healthcare access, closer to you
              </span>
            </div>
          </Link>

          {/* CENTER: PRIMARY NAVIGATION LINKS */}
          <div className="nav-links">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              {t.home}
            </Link>
            <Link to="/emergency" className={`nav-link ${location.pathname === '/emergency' ? 'active' : ''}`}>
              <Compass size={15} /> Find Care
            </Link>
            <Link to="/appointments" className={`nav-link ${location.pathname === '/appointments' ? 'active' : ''}`}>
              <Calendar size={15} /> {t.appointments}
            </Link>
            <Link to="/assessment" className={`nav-link ${location.pathname === '/assessment' ? 'active' : ''}`} style={{ color: '#0284c7', fontWeight: 800 }}>
              <Activity size={15} /> AI Intake & Assessment
            </Link>

            {/* MORE DROPDOWN MENU FOR SECONDARY LINKS */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMoreMenu(prev => !prev)}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <span>More</span>
                <ChevronDown size={14} />
              </button>

              {showMoreMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '36px',
                    left: '0',
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    boxShadow: 'var(--shadow-md)',
                    width: '230px',
                    padding: '8px',
                    zIndex: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                  onClick={() => setShowMoreMenu(false)}
                >
                  <Link to="/assessment" className="nav-link" style={{ padding: '8px 12px', borderRadius: '6px', color: '#0284c7', fontWeight: 800 }}>
                    <Activity size={15} /> AI Clinical Assessment
                  </Link>
                  <button
                    onClick={() => setIsUrgentModalOpen(true)}
                    className="nav-link"
                    style={{ padding: '8px 12px', borderRadius: '6px', color: '#dc2626', fontWeight: 800, background: '#fef2f2', border: '1px solid #fecaca', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  >
                    <UserPlus size={15} /> 🚨 Urgent Patient Registration
                  </button>
                  <Link to="/medication-reminders" className="nav-link" style={{ padding: '8px 12px', borderRadius: '6px', color: '#047857', fontWeight: 800 }}>
                    <Pill size={15} /> Medication Reminders
                  </Link>
                  <Link to="/records" className="nav-link" style={{ padding: '8px 12px', borderRadius: '6px' }}>
                    <FileText size={15} /> Health Records
                  </Link>
                  <Link to="/pharmacies" className="nav-link" style={{ padding: '8px 12px', borderRadius: '6px' }}>
                    <Store size={15} /> Pharmacies & Camps
                  </Link>
                  <Link to="/ai-helpdesk" className="nav-link" style={{ padding: '8px 12px', borderRadius: '6px' }}>
                    <Bot size={15} /> AI Help Desk
                  </Link>
                  <Link to="/doctor" className="nav-link" style={{ padding: '8px 12px', borderRadius: '6px' }}>
                    <Stethoscope size={15} /> Doctor Portal
                  </Link>
                </div>
              )}
            </div>

            {user && (
              <Link to={getDashboardPath()} className={`nav-link ${location.pathname.startsWith('/citizen') || location.pathname.startsWith('/worker') || location.pathname.startsWith('/admin') ? 'active' : ''}`}>
                {t.dashboard}
              </Link>
            )}
          </div>

          {/* RIGHT ACTIONS: URGENT BTN, LANGUAGE, USER */}
          <div className="nav-actions">
            <button
              onClick={() => setIsUrgentModalOpen(true)}
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <UserPlus size={14} color="#dc2626" /> 🚨 Urgent Reg.
            </button>

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

      {/* URGENT PATIENT REGISTRATION MODAL */}
      <UrgentRegistrationModal
        isOpen={isUrgentModalOpen}
        onClose={() => setIsUrgentModalOpen(false)}
      />
    </>
  );
}
