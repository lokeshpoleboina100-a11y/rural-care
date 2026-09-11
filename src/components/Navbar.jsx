import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, User, LogOut, Bot, Shield, Stethoscope, PhoneCall, Calendar } from 'lucide-react';

export default function Navbar({ onOpenAIHelp }) {
  const { user, role, logout } = useAuth();
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
            <HeartPulse size={24} />
          </div>
          <div>
            <span>RuralCare</span>
            <span className="brand-tag">HEALTH + AI</span>
          </div>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/emergency" className={`nav-link ${location.pathname === '/emergency' ? 'active' : ''}`}>
            <PhoneCall size={16} /> Emergency
          </Link>
          <Link to="/appointments" className={`nav-link ${location.pathname === '/appointments' ? 'active' : ''}`}>
            <Calendar size={16} /> Appointments
          </Link>
          <Link to="/ai-helpdesk" className={`nav-link ${location.pathname === '/ai-helpdesk' ? 'active' : ''}`}>
            <Bot size={16} /> AI Desk
          </Link>
          {user && (
            <Link to={getDashboardPath()} className={`nav-link ${location.pathname.startsWith('/citizen') || location.pathname.startsWith('/worker') || location.pathname.startsWith('/admin') ? 'active' : ''}`}>
              Dashboard
            </Link>
          )}
        </div>

        <div className="nav-actions">
          <button className="ai-help-btn" onClick={onOpenAIHelp}>
            <Bot size={18} />
            <span>AI Health Assistant</span>
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
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                <User size={16} /> Sign In
              </Link>
              <Link to="/register" className="register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
