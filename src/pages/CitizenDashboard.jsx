import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, ShieldCheck, HeartPulse, FileText, PhoneCall, Bot, Plus, Pill } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CitizenDashboard({ onOpenAIHelp }) {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dash-header">
        <div>
          <h1>Citizen Health Portal</h1>
          <p>Welcome back, <strong>{user?.name || 'Citizen'}</strong> ({user?.location || 'Rural District'})</p>
        </div>
        <button onClick={onOpenAIHelp} className="ai-help-btn">
          <Bot size={18} /> Launch AI Triage
        </button>
      </div>

      <div className="dash-cards">
        <div className="dash-card">
          <div className="dash-card-icon"><Calendar size={24} /></div>
          <div>
            <div className="dash-card-val">1</div>
            <div className="dash-card-lbl">Upcoming Consultation</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon"><ShieldCheck size={24} /></div>
          <div>
            <div className="dash-card-val">Active</div>
            <div className="dash-card-lbl">ABHA / Ayushman Status</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon"><HeartPulse size={24} /></div>
          <div>
            <div className="dash-card-val">Normal</div>
            <div className="dash-card-lbl">Last Health Check</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon"><FileText size={24} /></div>
          <div>
            <div className="dash-card-val">3</div>
            <div className="dash-card-lbl">Digital Health Records</div>
          </div>
        </div>

        <Link to="/medication-reminders" className="dash-card" style={{ background: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <div className="dash-card-icon" style={{ background: '#10b981', color: '#fff' }}><Pill size={24} /></div>
          <div>
            <div className="dash-card-val" style={{ color: '#047857' }}>Active</div>
            <div className="dash-card-lbl" style={{ color: '#065f46', fontWeight: 800 }}>💊 Medication Reminder</div>
          </div>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Recent Doctor Appointments</h3>
            <Link to="/appointments" className="primary-btn" style={{ padding: '8px 14px', fontSize: '12px' }}>
              <Plus size={14} /> Book New Slot
            </Link>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Dr. S. Reddy (General Physician)</h4>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Ramapuram PHC • Sep 15, 2026 at 10:00 AM</p>
            </div>
            <span style={{ background: '#ecfdf5', color: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
              CONFIRMED
            </span>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Government Health Schemes</h3>
          
          <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Ayushman Bharat (PM-JAY)</h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 8px 0' }}>Up to ₹5 Lakh free health coverage per family.</p>
            <span style={{ fontSize: '11px', color: '#0d8b72', fontWeight: 700 }}>Eligible • Present Ration Card</span>
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Pradhan Mantri Bhartiya Janaushadhi</h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 8px 0' }}>Quality generic medicines at 50%-90% lower prices.</p>
            <Link to="/emergency" style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700 }}>Find Jan Aushadhi Kendra →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
