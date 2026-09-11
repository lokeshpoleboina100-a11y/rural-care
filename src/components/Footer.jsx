import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <HeartPulse color="#4ade80" size={22} />
            <h3>RuralCare</h3>
          </div>
          <p>Healthcare access, closer to you.</p>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            Democratizing doctor availability, emergency triage, and AI appointment allocation for rural families.
          </p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/emergency">Find Care</Link></li>
            <li><Link to="/appointments">Appointments</Link></li>
            <li><Link to="/ai-helpdesk">AI Health Help</Link></li>
            <li><Link to="/emergency">Emergency 108</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Services</h4>
          <ul className="footer-links">
            <li><Link to="/records">Health Records</Link></li>
            <li><Link to="/pharmacies">Pharmacies & Camps</Link></li>
            <li><Link to="/doctor">Doctor Portal</Link></li>
            <li><Link to="/admin/login">District Admin</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Emergency Lines</h4>
          <ul className="footer-links">
            <li><a href="tel:108">🚑 108 Ambulance</a></li>
            <li><a href="tel:104">📞 104 Health Advisory</a></li>
            <li><a href="tel:1098">👶 1098 Childline</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 RuralCare Health Platform. All Rights Reserved.</p>
        <p>Built for Rural Healthcare Accessibility & Doctor Availability Optimization.</p>
      </div>
    </footer>
  );
}
