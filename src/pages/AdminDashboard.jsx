import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useHealthPlatform } from '../context/HealthPlatformContext';
import { predictPatientDemand } from '../utils/aiAllocationEngine';
import { Shield, Hospital, Users, Activity, Server, AlertCircle, Sparkles, TrendingUp, UserCheck, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { doctors } = useHealthPlatform();

  const demandPredictions = predictPatientDemand();

  const availableDocsCount = doctors.filter(d => d.status === 'Available').length;
  const unavailableDocsCount = doctors.filter(d => d.status === 'Unavailable' || d.status === 'On Leave').length;

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* ADMIN HEADER */}
      <div className="dash-header" style={{ marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '4px', display: 'block' }}>
            DISTRICT HEALTHCARE AI CONTROL CENTER
          </span>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Doctor Utilization & AI Demand Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>
            Officer: <strong>{user?.name || 'Dr. V. Rao (District Health Officer)'}</strong> — District Headquarters
          </p>
        </div>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="dash-cards" style={{ marginBottom: '32px' }}>
        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><UserCheck size={24} /></div>
          <div>
            <div className="dash-card-val">{availableDocsCount} / {doctors.length}</div>
            <div className="dash-card-lbl">Doctors Active & Available</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Calendar size={24} /></div>
          <div>
            <div className="dash-card-val">142</div>
            <div className="dash-card-lbl">Today's Appointments</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}><Activity size={24} /></div>
          <div>
            <div className="dash-card-val">18.4 min</div>
            <div className="dash-card-lbl">Avg Patient Waiting Time</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><Shield size={24} /></div>
          <div>
            <div className="dash-card-val">12</div>
            <div className="dash-card-lbl">Emergency Reserved Capacity</div>
          </div>
        </div>
      </div>

      {/* AI INSIGHTS SPOTLIGHT BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #173e37, #0d8b72)', color: '#ffffff', padding: '24px', borderRadius: '18px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={26} />
          </div>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '8px' }}>AI OPTIMIZATION INSIGHT</span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '4px 0 2px 0' }}>High Patient Demand Predicted Tomorrow (10:00 AM - 12:00 PM)</h3>
            <p style={{ fontSize: '13px', color: '#a7f3d0', margin: 0 }}>
              AI Recommendation: General Medicine & Cardiology demand will peak. Consider allocating 1 additional doctor to PHC Ramapuram.
            </p>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: DOCTOR WORKLOAD MONITORING + AI DEMAND FORECASTING */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* DOCTOR WORKLOAD BALANCING TABLE */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Doctor Workload & Capacity Balancing
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Monitors real-time workload to prevent doctor burnout and re-route patients.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {doctors.map((doc) => (
              <div key={doc.id} style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{doc.name}</h4>
                    <span style={{
                      fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px',
                      background: doc.status === 'Available' ? '#ecfdf5' : '#fef2f2',
                      color: doc.status === 'Available' ? '#047857' : '#dc2626'
                    }}>
                      {doc.status}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{doc.department} • {doc.clinic}</span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '8px',
                    background: doc.workloadLevel === 'High' ? '#fef2f2' : doc.workloadLevel === 'Medium' ? '#fef3c7' : '#ecfdf5',
                    color: doc.workloadLevel === 'High' ? '#dc2626' : doc.workloadLevel === 'Medium' ? '#b45309' : '#047857'
                  }}>
                    {doc.workloadLevel} LOAD ({doc.currentWorkloadCount} pts)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI PATIENT LOAD DEMAND FORECASTING */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            AI Hourly Demand Forecasting
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Predicts peak patient arrival hours for optimal shift planning.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {demandPredictions.map((pred, i) => (
              <div key={i} style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h5 style={{ fontSize: '13px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>⏰ {pred.timeRange}</h5>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Est. Arrival: {pred.predictedPatients} patients</span>
                </div>

                <span style={{
                  fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '10px',
                  background: pred.demand === 'Very High' ? '#fef2f2' : pred.demand === 'High' ? '#fff7ed' : '#ecfdf5',
                  color: pred.demand === 'Very High' ? '#dc2626' : pred.demand === 'High' ? '#c2410c' : '#047857'
                }}>
                  {pred.status} ({pred.demand})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
