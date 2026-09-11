import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Hospital, Users, Activity, FileSpreadsheet, Plus, Server } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="dash-header">
        <div>
          <h1>District Healthcare Control Center</h1>
          <p>Admin: <strong>{user?.name || 'Dr. V. Rao (District Officer)'}</strong> — District Health Authority</p>
        </div>
      </div>

      <div className="dash-cards">
        <div className="dash-card">
          <div className="dash-card-icon"><Users size={24} /></div>
          <div>
            <div className="dash-card-val">12,450</div>
            <div className="dash-card-lbl">Registered Citizens</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon"><Hospital size={24} /></div>
          <div>
            <div className="dash-card-val">18</div>
            <div className="dash-card-lbl">Empanelled PHCs & Hospitals</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon"><Activity size={24} /></div>
          <div>
            <div className="dash-card-val">340</div>
            <div className="dash-card-lbl">ASHA Health Workers</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon"><Server size={24} /></div>
          <div>
            <div className="dash-card-val" style={{ color: '#16a34a' }}>99.9%</div>
            <div className="dash-card-lbl">System & AI Desk Status</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>District Hospital Management Registry</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800 }}>District Area Hospital</h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 8px 0' }}>14 Beds Available • 3 ICU Beds</p>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>● 24/7 Trauma Unit Active</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Ramapuram PHC</h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 8px 0' }}>4 Beds Available • 0 ICU Beds</p>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>● ASHA Network Connected</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Sanjivani CHC</h4>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 8px 0' }}>8 Beds Available • 1 ICU Bed</p>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>● Tele-Medicine Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
