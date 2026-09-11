import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, Calendar, Bot, Shield, Stethoscope, HeartPulse, Hospital, Users, CheckCircle, ArrowRight, ShieldAlert } from 'lucide-react';

export default function Home({ onOpenAIHelp }) {
  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-container">
          <div>
            <div className="hero-badge">
              <HeartPulse size={16} /> Empowering Rural Healthcare Access
            </div>
            <h1>Smart Care & Triage for Every <span>Rural Family</span></h1>
            <p>
              RuralCare connects citizens, ASHA workers, and hospitals through AI symptom triage, 24/7 emergency dispatches, and seamless health record management.
            </p>
            <div className="hero-cta">
              <Link to="/emergency" className="primary-btn">
                <PhoneCall size={18} /> Emergency 108 Support
              </Link>
              <button onClick={onOpenAIHelp} className="secondary-btn">
                <Bot size={18} /> Ask AI Health Desk
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <h3>150+</h3>
                <p>Empanelled Hospitals</p>
              </div>
              <div className="stat-item">
                <h3>24/7</h3>
                <p>AI Triage & Emergency</p>
              </div>
              <div className="stat-item">
                <h3>100%</h3>
                <p>Free Government Scheme Guidance</p>
              </div>
            </div>
          </div>

          <div className="hero-card-preview">
            <div className="preview-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield color="#0d8b72" size={20} />
                <span style={{ fontWeight: 800, fontSize: '15px' }}>Instant Health Triage</span>
              </div>
              <span className="preview-pill">24/7 ACTIVE</span>
            </div>

            <div className="emergency-quick-box">
              <div className="quick-box-title">
                <PhoneCall size={20} /> 108 Emergency Helpline
              </div>
              <p className="quick-box-desc">
                Instant ambulance dispatch & immediate medical guidance for cardiac, trauma, maternal, and snakebite emergencies.
              </p>
              <a href="tel:108" className="call-now-btn">
                Call 108 Emergency Now
              </a>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '12px', color: '#0d8b72', fontWeight: 700, marginBottom: '4px' }}>💡 AI HELP DESK TIP</p>
              <p style={{ fontSize: '13px', color: '#475569' }}>"Not sure if you need a hospital? Click 'Ask AI Health Desk' to get immediate symptom classification in your language."</p>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE-ONLY HORIZONTAL QUICK-ACTION SLIDER */}
      <div className="mobile-quick-slider-container">
        <div className="mobile-slider-header">
          <span>⚡ Quick Actions</span>
          <span className="swipe-hint">Swipe left/right 👉</span>
        </div>
        <div className="mobile-quick-slider">
          <Link to="/appointments" className="slider-card card-appointments">
            <div className="slider-icon"><Calendar size={22} /></div>
            <div className="slider-info">
              <h4>Appointments</h4>
              <p>Book Doctor Slot</p>
            </div>
          </Link>

          <Link to="/emergency" className="slider-card card-emergency">
            <div className="slider-icon"><ShieldAlert size={22} /></div>
            <div className="slider-info">
              <h4>Emergency</h4>
              <p>108 Ambulance</p>
            </div>
            <span className="emergency-badge">ALERT</span>
          </Link>

          <Link to="/emergency" className="slider-card card-findcare">
            <div className="slider-icon"><Hospital size={22} /></div>
            <div className="slider-info">
              <h4>Find Care</h4>
              <p>PHCs & Beds</p>
            </div>
          </Link>

          <div className="slider-card card-ai" onClick={onOpenAIHelp}>
            <div className="slider-icon"><Bot size={22} /></div>
            <div className="slider-info">
              <h4>AI Health Help</h4>
              <p>24/7 Smart Triage</p>
            </div>
          </div>
        </div>
        <div className="slider-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>

      {/* CORE SERVICES */}
      <section className="section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-kicker">Healthcare Services</span>
            <h2 className="section-title">Designed for Rural Accessibility</h2>
            <p className="section-desc">
              Comprehensive medical support built specifically for rural communities, local health workers, and district administrators.
            </p>
          </div>

          <div className="grid-3">
            <div className="feature-card">
              <div className="feature-icon">
                <Bot size={28} />
              </div>
              <h3>AI Health Triage Desk</h3>
              <p>
                Get instant 24/7 symptom analysis, first-aid instructions, and guidance on Ayushman Bharat government health schemes in simple language.
              </p>
              <button onClick={onOpenAIHelp} className="feature-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Open AI Help Desk <ArrowRight size={16} />
              </button>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Hospital size={28} />
              </div>
              <h3>Emergency & Hospital Finder</h3>
              <p>
                Locate nearest Primary Health Centers (PHCs), Community Health Centers (CHCs), and hospitals with real-time bed & emergency facility status.
              </p>
              <Link to="/emergency" className="feature-link">
                View Emergency Map <ArrowRight size={16} />
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Calendar size={28} />
              </div>
              <h3>Doctor Appointments</h3>
              <p>
                Schedule consultations with visiting specialists, tele-medicine doctors, and community health officers without long queue waits.
              </p>
              <Link to="/appointments" className="feature-link">
                Book Consultation <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
