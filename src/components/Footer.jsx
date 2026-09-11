import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, PhoneCall, ShieldAlert, Bot } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <HeartPulse color="#4ade80" size={24} />
            <h3>RuralCare India</h3>
          </div>
          <p>
            Democratizing quality healthcare, emergency triage, government scheme assistance, and AI health advisory for rural and underserved communities across India.
          </p>
        </div>

        <div className="footer-col">
          <h4>Emergency Lines</h4>
          <ul className="footer-links">
            <li><a href="tel:108">🚑 108 Emergency Ambulance</a></li>
            <li><a href="tel:104">📞 104 Health Advisory</a></li>
            <li><a href="tel:1098">👶 1098 Child Helpline</a></li>
            <li><a href="tel:181">👩 181 Women Helpline</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Quick Services</h4>
          <ul className="footer-links">
            <li><Link to="/emergency">Find Nearby Hospitals</Link></li>
            <li><Link to="/appointments">Book Doctor Consult</Link></li>
            <li><Link to="/ai-helpdesk">AI Health Desk</Link></li>
            <li><Link to="/register">Register as ASHA Worker</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Portals & Login</h4>
          <ul className="footer-links">
            <li><Link to="/login">Citizen Login</Link></li>
            <li><Link to="/login">Health Worker Login</Link></li>
            <li><Link to="/admin/login">District Admin Portal</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 RuralCare Health Initiative. All Rights Reserved.</p>
        <p>Built for Rural Healthcare Accessibility & Empowerment.</p>
      </div>
    </footer>
  );
}
