import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Users, AlertTriangle, FileCheck, Plus, Check, Clock } from 'lucide-react';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [patientList, setPatientList] = useState([
    { id: 'PAT-101', name: 'Lakshmi Devi', age: 34, symptom: 'High Fever & Dehydration', priority: 'High', status: 'Pending Referral' },
    { id: 'PAT-102', name: 'Venkatesh K.', age: 52, symptom: 'Chest Pain / BP Check', priority: 'Urgent', status: 'Referred to District Hospital' },
    { id: 'PAT-103', name: 'Anitha B.', age: 24, symptom: 'Maternal 3rd Trimester Check', priority: 'Routine', status: 'Completed' }
  ]);

  const handleResolve = (id) => {
    setPatientList(prev => prev.map(p => p.id === id ? { ...p, status: 'Completed' } : p));
  };

  return (
    <div className="dashboard-container">
      <div className="dash-header">
        <div>
          <h1>ASHA & Community Health Worker Portal</h1>
          <p>Logged in as: <strong>{user?.name || 'Sunita Devi (ASHA)'}</strong> — PHC Ramapuram Sector #4</p>
        </div>
      </div>

      <div className="dash-cards">
        <div className="dash-card">
          <div className="dash-card-icon"><Users size={24} /></div>
          <div>
            <div className="dash-card-val">42</div>
            <div className="dash-card-lbl">Assigned Households</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon"><AlertTriangle size={24} color="#dc2626" /></div>
          <div>
            <div className="dash-card-val">2</div>
            <div className="dash-card-lbl">Urgent Triage Flags</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon"><Stethoscope size={24} /></div>
          <div>
            <div className="dash-card-val">18</div>
            <div className="dash-card-lbl">Hospital Referrals Sent</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon"><FileCheck size={24} /></div>
          <div>
            <div className="dash-card-val">96%</div>
            <div className="dash-card-lbl">Immunization Coverage</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Village Patient Triage Queue</h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
              <th style={{ padding: '12px 8px' }}>Patient ID</th>
              <th style={{ padding: '12px 8px' }}>Name & Age</th>
              <th style={{ padding: '12px 8px' }}>Reported Symptoms</th>
              <th style={{ padding: '12px 8px' }}>Triage Priority</th>
              <th style={{ padding: '12px 8px' }}>Status</th>
              <th style={{ padding: '12px 8px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {patientList.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 8px', fontWeight: 700 }}>{p.id}</td>
                <td style={{ padding: '12px 8px' }}>{p.name} ({p.age} yrs)</td>
                <td style={{ padding: '12px 8px' }}>{p.symptom}</td>
                <td style={{ padding: '12px 8px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 800,
                    background: p.priority === 'Urgent' ? '#fef2f2' : p.priority === 'High' ? '#fff7ed' : '#ecfdf5',
                    color: p.priority === 'Urgent' ? '#dc2626' : p.priority === 'High' ? '#c2410c' : '#16a34a'
                  }}>
                    {p.priority}
                  </span>
                </td>
                <td style={{ padding: '12px 8px', fontSize: '13px', color: '#64748b' }}>{p.status}</td>
                <td style={{ padding: '12px 8px' }}>
                  {p.status !== 'Completed' ? (
                    <button onClick={() => handleResolve(p.id)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} /> Mark Complete
                    </button>
                  ) : (
                    <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '12px' }}>Done</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
