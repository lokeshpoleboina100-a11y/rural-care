import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PhoneCall, Calendar, Bot, Shield, Stethoscope, HeartPulse, Hospital, Users, CheckCircle2, ArrowRight, ShieldAlert, MapPin, Store, FileText, Compass, Sparkles, Navigation, ChevronRight, Mic, Info } from 'lucide-react';
import { useHealthPlatform } from '../context/HealthPlatformContext';
import { useAuth } from '../context/AuthContext';

export default function Home({ onOpenAIHelp }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pharmacies, healthCamps, doctors } = useHealthPlatform();

  // GPS Geolocation state for Healthcare Near You section
  const [userCoords, setUserCoords] = useState(null);
  const [locationName, setLocationName] = useState('Detecting your GPS location...');
  const [nearbyHospitals, setNearbyHospitals] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserCoords({ lat, lng });

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const city = data.address?.village || data.address?.town || data.address?.city || 'Your Area';
            setLocationName(`${city} (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`);
          } catch {
            setLocationName(`GPS Location (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`);
          }

          // Compute neighborhood hospital coordinates
          setNearbyHospitals([
            { id: 1, name: 'Ramapuram Primary Health Center (PHC)', type: 'Primary Health Center', dist: '1.2 km', beds: 4, icu: 0, lat: lat + 0.01, lng: lng + 0.01 },
            { id: 2, name: 'District Area Hospital & Trauma Unit', type: 'General Hospital', dist: '3.4 km', beds: 14, icu: 3, lat: lat - 0.015, lng: lng - 0.012 },
            { id: 3, name: 'Sanjivani Community Health Center', type: 'Community Health Center', dist: '5.1 km', beds: 8, icu: 1, lat: lat + 0.025, lng: lng - 0.02 }
          ]);
        },
        () => {
          setLocationName('Rural Health District');
          setNearbyHospitals([
            { id: 1, name: 'Ramapuram Primary Health Center (PHC)', type: 'Primary Health Center', dist: '1.2 km', beds: 4, icu: 0 },
            { id: 2, name: 'District Area Hospital & Trauma Unit', type: 'General Hospital', dist: '3.4 km', beds: 14, icu: 3 },
            { id: 3, name: 'Sanjivani Community Health Center', type: 'Community Health Center', dist: '5.1 km', beds: 8, icu: 1 }
          ]);
        }
      );
    }
  }, []);

  return (
    <div>
      {/* 1. HERO SECTION */}
      <section className="hero">
        <div className="hero-container">
          <div>
            <div className="hero-badge">
              <HeartPulse size={16} /> Rural Health Access Platform
            </div>
            <h1>Healthcare Access, <span>Closer to You</span></h1>
            <p>
              Find nearby healthcare, book appointments, get AI-powered guidance, and access emergency support — all in one place.
            </p>
            <div className="hero-cta">
              <Link to="/emergency" className="primary-btn">
                <Compass size={18} /> Find Care
              </Link>
              <Link to="/appointments" className="secondary-btn">
                <Calendar size={18} /> Book Appointment
              </Link>
            </div>
          </div>

          <div className="hero-card-preview">
            <div className="preview-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield color="var(--primary)" size={20} />
                <span style={{ fontWeight: 800, fontSize: '15px' }}>Instant Emergency Access</span>
              </div>
              <span className="preview-pill">24/7 ACTIVE</span>
            </div>

            <div className="emergency-quick-box">
              <div className="quick-box-title">
                <PhoneCall size={20} /> Dial 108 Emergency Helpline
              </div>
              <p className="quick-box-desc">
                24/7 free ambulance dispatch & emergency medical guidance for rural families.
              </p>
              <a href="tel:108" className="call-now-btn">
                Call 108 Emergency Now
              </a>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800, marginBottom: '2px' }}>💡 AI HEALTH TIP</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>"Not sure which doctor you need? Click 'AI Health Help' to match your requirement with available specialists."</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK ACCESS CARDS SECTION (Grid on Desktop / Swipeable Slider on Mobile) */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
        <div className="container">
          <div className="quick-access-header">
            <span>⚡ Quick Access Services</span>
            <span className="swipe-hint-text">Swipe left/right 👉</span>
          </div>

          <div className="quick-access-wrapper">
            <Link to="/appointments" className="quick-card q-appointments">
              <div className="q-icon"><Calendar size={22} /></div>
              <h4>Appointments</h4>
              <p>Book & Manage Slots</p>
            </Link>

            <Link to="/emergency" className="quick-card q-emergency">
              <div className="q-icon"><ShieldAlert size={22} /></div>
              <h4>Emergency</h4>
              <p>108 Ambulance Dispatch</p>
              <span className="q-badge">24/7</span>
            </Link>

            <Link to="/emergency" className="quick-card q-findcare">
              <div className="q-icon"><MapPin size={22} /></div>
              <h4>Find Care</h4>
              <p>Hospitals & PHCs</p>
            </Link>

            <div className="quick-card q-ai" onClick={onOpenAIHelp}>
              <div className="q-icon"><Bot size={22} /></div>
              <h4>AI Health Help</h4>
              <p>24/7 Smart Triage</p>
            </div>

            <Link to="/pharmacies" className="quick-card q-pharmacy">
              <div className="q-icon"><Store size={22} /></div>
              <h4>Pharmacy</h4>
              <p>Medicines & Supplies</p>
            </Link>

            <Link to="/records" className="quick-card q-records">
              <div className="q-icon"><FileText size={22} /></div>
              <h4>Health Records</h4>
              <p>Prescriptions & History</p>
            </Link>

            <Link to="/pharmacies" className="quick-card q-camps">
              <div className="q-icon"><HeartPulse size={22} /></div>
              <h4>Health Camps</h4>
              <p>Free Screening Drives</p>
            </Link>

            <Link to="/doctor" className="quick-card q-workers">
              <div className="q-icon"><Stethoscope size={22} /></div>
              <h4>Healthcare Workers</h4>
              <p>ASHA Workers & Doctors</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. HEALTHCARE SERVICES SECTION (Category Colored Cards) */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">Healthcare Services</span>
            <h2 className="section-title">Everything You Need in One Place</h2>
            <p className="section-desc">Comprehensive medical services designed for simplicity and accessibility.</p>
          </div>

          <div className="grid-3">
            <div className="feature-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="feature-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><MapPin size={26} /></div>
              <h3>Find Nearby Care</h3>
              <p>Locate 24/7 Primary Health Centers (PHCs), Community Health Centers (CHCs), and hospitals with live bed counts.</p>
              <Link to="/emergency" className="feature-link" style={{ color: '#047857' }}>Find Hospitals & PHCs <ArrowRight size={14} /></Link>
            </div>

            <div className="feature-card" style={{ borderLeft: '4px solid #9333ea' }}>
              <div className="feature-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}><Calendar size={26} /></div>
              <h3>Book Appointment</h3>
              <p>Schedule doctor consultations, track live queue position tokens, and receive appointment reminders.</p>
              <Link to="/appointments" className="feature-link" style={{ color: '#7e22ce' }}>Book Consultation Slot <ArrowRight size={14} /></Link>
            </div>

            <div className="feature-card" style={{ borderLeft: '4px solid #0284c7' }}>
              <div className="feature-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Bot size={26} /></div>
              <h3>AI Health Help Desk</h3>
              <p>Describe your symptoms in simple words or use voice input to receive instant triage recommendations.</p>
              <button onClick={onOpenAIHelp} className="feature-link" style={{ color: '#0369a1', background: 'none', border: 'none', cursor: 'pointer' }}>Start AI Triage <ArrowRight size={14} /></button>
            </div>

            <div className="feature-card" style={{ borderLeft: '4px solid #dc2626' }}>
              <div className="feature-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><ShieldAlert size={26} /></div>
              <h3>Emergency Support</h3>
              <p>Immediate 108 ambulance dispatch and guidance for trauma, cardiac, maternal, and snakebite emergencies.</p>
              <Link to="/emergency" className="feature-link" style={{ color: '#b91c1c' }}>Emergency Services <ArrowRight size={14} /></Link>
            </div>

            <div className="feature-card" style={{ borderLeft: '4px solid #0d8b72' }}>
              <div className="feature-icon" style={{ background: '#e6f4f1', color: '#0d8b72' }}><FileText size={26} /></div>
              <h3>Digital Health Records</h3>
              <p>Protected health repository for prescriptions, diagnostic reports, and visual referral timelines.</p>
              <Link to="/records" className="feature-link" style={{ color: '#097560' }}>View Health Records <ArrowRight size={14} /></Link>
            </div>

            <div className="feature-card" style={{ borderLeft: '4px solid #b45309' }}>
              <div className="feature-icon" style={{ background: '#fef3c7', color: '#b45309' }}><HeartPulse size={26} /></div>
              <h3>Health Camps</h3>
              <p>Discover free community eye screening camps, maternal immunization drives, and NCD health checkups.</p>
              <Link to="/pharmacies" className="feature-link" style={{ color: '#b45309' }}>View Upcoming Camps <ArrowRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SMART APPOINTMENT BOOKING (Project Topic Spotlight) */}
      <section className="section" style={{ background: '#f1f5f9' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">AI PROJECT INNOVATION</span>
            <h2 className="section-title">Smart Appointment Allocation</h2>
            <p className="section-desc">
              RuralCare helps you find a suitable doctor and available time slot instead of making you search through unavailable doctors.
            </p>
          </div>

          {/* VISUAL 5-STEP FLOW */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', textAlignment: 'center', marginBottom: '28px' }} className="flow-grid">
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>STEP 1</span>
                <h4 style={{ fontSize: '13px', fontWeight: 800, margin: '4px 0' }}>Your Health Need</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Describe symptoms</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>STEP 2</span>
                <h4 style={{ fontSize: '13px', fontWeight: 800, margin: '4px 0' }}>AI Department Match</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Required specialty</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>STEP 3</span>
                <h4 style={{ fontSize: '13px', fontWeight: 800, margin: '4px 0' }}>Doctor Availability</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Check active schedule</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>STEP 4</span>
                <h4 style={{ fontSize: '13px', fontWeight: 800, margin: '4px 0' }}>Best Doctor & Slot</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Workload balanced</p>
              </div>

              <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#047857' }}>STEP 5</span>
                <h4 style={{ fontSize: '13px', fontWeight: 800, margin: '4px 0', color: '#065f46' }}>Confirmed + Token</h4>
                <p style={{ fontSize: '11px', color: '#047857', margin: 0 }}>Live Queue Position</p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link to="/appointments" className="primary-btn" style={{ padding: '12px 28px', fontSize: '15px' }}>
                <Sparkles size={16} /> Book Smart Appointment Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HEALTHCARE NEAR YOU (GPS Geolocation + Leaflet OSM Map) */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">LIVE GPS GEOLOCATION</span>
            <h2 className="section-title">Healthcare Near You</h2>
            <p className="section-desc">Detected location: <strong>{locationName}</strong></p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {nearbyHospitals.map((h) => (
              <div key={h.id} style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '6px' }}>{h.type}</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7' }}>📍 {h.dist} away</span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>{h.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>Beds Available: {h.beds} • ICU: {h.icu}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href="tel:108" className="primary-btn" style={{ flex: 1, padding: '8px', fontSize: '12px', justifyContent: 'center' }}>
                    <PhoneCall size={12} /> Call
                  </a>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name)}`} target="_blank" rel="noreferrer" className="secondary-btn" style={{ color: '#475569', borderColor: '#cbd5e1', padding: '8px', fontSize: '12px' }}>
                    Directions
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/emergency" className="secondary-btn" style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
              Find More Facilities & Full Map →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. SMART HOSPITAL RECOMMENDATION */}
      <section className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <div style={{ background: 'linear-gradient(135deg, #0d8b72, #064e3b)', color: '#ffffff', borderRadius: '20px', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 800 }}>AI RECOMMENDED MATCH</span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '8px 0 4px 0' }}>Ramapuram Primary Health Center</h2>
              <p style={{ fontSize: '13px', color: '#a7f3d0', margin: 0 }}>
                Matched Doctor: <strong>Dr. S. Reddy</strong> (General Medicine) • Distance: <strong>1.2 km</strong> • Available Slot: <strong>10:00 AM</strong> (Est. Wait: 12 min)
              </p>
            </div>
            <Link to="/appointments" className="primary-btn" style={{ background: '#ffffff', color: '#064e3b', boxShadow: 'none' }}>
              Find My Best Match →
            </Link>
          </div>
        </div>
      </section>

      {/* 7. AI HEALTH HELP DESK SPOTLIGHT */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-kicker">24/7 AI TRIAGE</span>
            <h2 className="section-title">AI Health Help Desk</h2>
            <p className="section-desc">Describe your symptoms or health concern and get simple health guidance and healthcare recommendations.</p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', maxWidth: '700px', margin: '0 auto', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '56px', height: '56px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Bot size={30} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Ask Questions in Simple Language</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Supported in English, Hindi, Telugu, and Tamil. Voice & text available.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="primary-btn" onClick={onOpenAIHelp}>
                <Sparkles size={16} /> Start AI Help
              </button>
              <button className="secondary-btn" onClick={onOpenAIHelp} style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}>
                <Mic size={16} /> Use Voice Assistant
              </button>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '20px', fontStyle: 'italic' }}>
              "AI guidance is for informational purposes only and does not replace professional medical advice."
            </p>
          </div>
        </div>
      </section>

      {/* 8. HEALTH CAMPS & PHARMACIES PREVIEW */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* HEALTH CAMPS */}
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Health Camps Near You</h3>
                <Link to="/pharmacies" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>View All →</Link>
              </div>

              {healthCamps.slice(0, 2).map(camp => (
                <div key={camp.id} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '6px' }}>{camp.category}</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 2px 0' }}>{camp.title}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>📅 {camp.date} • 📍 {camp.location} ({camp.distance})</p>
                </div>
              ))}
            </div>

            {/* NEARBY PHARMACIES */}
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Nearby Pharmacies</h3>
                <Link to="/pharmacies" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>Find Outlets →</Link>
              </div>

              {pharmacies.slice(0, 2).map((pharm, i) => (
                <div key={i} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, background: pharm.isGovernment ? '#ecfdf5' : '#f1f5f9', color: pharm.isGovernment ? '#047857' : '#475569', padding: '2px 6px', borderRadius: '6px' }}>
                    {pharm.isGovernment ? 'Government Kendra' : 'Retail Store'}
                  </span>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 2px 0' }}>{pharm.name}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>📍 {pharm.location} ({pharm.distance})</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 9. HEALTH RECORDS, REFERRAL TRACKER & FAMILY MANAGEMENT */}
      <section className="section" style={{ background: '#f1f5f9' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <FileText color="var(--primary)" size={24} style={{ marginBottom: '10px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Your Health Records</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>Prescriptions, lab reports, and doctor history.</p>
              <Link to="/records" className="feature-link">View Health Records →</Link>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <Compass color="#0284c7" size={24} style={{ marginBottom: '10px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Track Your Referral</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>Visual timeline from PHC to Specialist Hospital.</p>
              <Link to="/records" className="feature-link" style={{ color: '#0284c7' }}>Track Referral Status →</Link>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
              <Users color="#9333ea" size={24} style={{ marginBottom: '10px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>Manage Family Health</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>Father, Mother, Children & Elderly members.</p>
              <Link to="/records" className="feature-link" style={{ color: '#9333ea' }}>Manage Family Profiles →</Link>
            </div>

          </div>
        </div>
      </section>

      {/* 10. PROMINENT EMERGENCY SECTION */}
      <section className="section" style={{ background: '#fef2f2', borderTop: '1px solid #fecaca', borderBottom: '1px solid #fecaca' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '700px' }}>
          <ShieldAlert color="#dc2626" size={40} style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#991b1b', marginBottom: '6px' }}>Need Emergency Help?</h2>
          <p style={{ color: '#7f1d1d', fontSize: '14px', marginBottom: '24px' }}>
            For serious or life-threatening situations, get emergency help immediately. 24/7 ambulance dispatch available.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:108" className="primary-btn" style={{ background: '#dc2626', color: '#fff', fontSize: '15px', padding: '12px 24px' }}>
              🚨 Call 108 Emergency
            </a>
            <Link to="/emergency" className="secondary-btn" style={{ color: '#991b1b', borderColor: '#fecaca', background: '#fff' }}>
              Find Nearest Emergency Hospital
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
