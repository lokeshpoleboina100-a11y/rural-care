import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHealthPlatform } from '../context/HealthPlatformContext';
import { Stethoscope, Clock, CheckCircle2, AlertTriangle, Users, Calendar, ShieldCheck, Power, Coffee, UserCheck, Play, Plus, Sliders } from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { doctors, updateDoctorStatus, updateDoctorSchedule, liveQueue, advanceDoctorQueue } = useHealthPlatform();

  // Selected doctor state (defaults to Dr. S. Reddy or user match)
  const currentDoctor = doctors.find(d => d.id === 1) || doctors[0];

  const [statusInput, setStatusInput] = useState(currentDoctor.status);
  const [workingHoursInput, setWorkingHoursInput] = useState(currentDoctor.workingHours);
  const [breakTimeInput, setBreakTimeInput] = useState(currentDoctor.breakTime);
  const [maxPatientsInput, setMaxPatientsInput] = useState(currentDoctor.maxPatientsPerDay);
  const [durationInput, setDurationInput] = useState(currentDoctor.consultationDurationMin);
  const [emergencySlotsInput, setEmergencySlotsInput] = useState(currentDoctor.emergencySlotsReserved);
  const [configSuccess, setConfigSuccess] = useState(false);

  const doctorQueue = liveQueue.filter(q => q.doctorId === currentDoctor.id && q.status !== 'Completed');
  const currentConsulting = liveQueue.find(q => q.doctorId === currentDoctor.id && q.status === 'Consulting');
  const waitingPatients = liveQueue.filter(q => q.doctorId === currentDoctor.id && q.status === 'Waiting');

  const handleStatusToggle = (newStatus) => {
    setStatusInput(newStatus);
    updateDoctorStatus(currentDoctor.id, newStatus);
  };

  const handleSaveSchedule = (e) => {
    e.preventDefault();
    updateDoctorSchedule(currentDoctor.id, {
      status: statusInput,
      workingHours: workingHoursInput,
      breakTime: breakTimeInput,
      maxPatientsPerDay: Number(maxPatientsInput),
      consultationDurationMin: Number(durationInput),
      emergencySlotsReserved: Number(emergencySlotsInput)
    });
    setConfigSuccess(true);
    setTimeout(() => setConfigSuccess(false), 3000);
  };

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* DOCTOR HEADER */}
      <div className="dash-header" style={{ marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '12px' }}>
              DOCTOR AVAILABILITY & QUEUE CONTROL
            </span>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {currentDoctor.name} ({currentDoctor.specialty})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>
            📍 {currentDoctor.clinic} • Department: {currentDoctor.department}
          </p>
        </div>

        {/* QUICK LIVE STATUS TOGGLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: '14px', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>Status:</span>
          <button
            className={`pill-btn ${currentDoctor.status === 'Available' ? 'active' : ''}`}
            onClick={() => handleStatusToggle('Available')}
            style={{ background: currentDoctor.status === 'Available' ? '#10b981' : '#f1f5f9', color: currentDoctor.status === 'Available' ? '#fff' : '#475569', fontWeight: 800 }}
          >
            🟢 Available
          </button>
          <button
            className={`pill-btn ${currentDoctor.status === 'On Break' ? 'active' : ''}`}
            onClick={() => handleStatusToggle('On Break')}
            style={{ background: currentDoctor.status === 'On Break' ? '#f59e0b' : '#f1f5f9', color: currentDoctor.status === 'On Break' ? '#fff' : '#475569', fontWeight: 800 }}
          >
            ☕ On Break
          </button>
          <button
            className={`pill-btn ${currentDoctor.status === 'Unavailable' ? 'active' : ''}`}
            onClick={() => handleStatusToggle('Unavailable')}
            style={{ background: currentDoctor.status === 'Unavailable' ? '#ef4444' : '#f1f5f9', color: currentDoctor.status === 'Unavailable' ? '#fff' : '#475569', fontWeight: 800 }}
          >
            🔴 Unavailable
          </button>
        </div>
      </div>

      {/* WORKLOAD & SYSTEM METRICS CARDS */}
      <div className="dash-cards" style={{ marginBottom: '32px' }}>
        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><UserCheck size={24} /></div>
          <div>
            <div className="dash-card-val">{currentConsulting ? currentConsulting.token : 'None'}</div>
            <div className="dash-card-lbl">Now Consulting Patient</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Users size={24} /></div>
          <div>
            <div className="dash-card-val">{waitingPatients.length}</div>
            <div className="dash-card-lbl">Patients in Waiting Queue</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}><Sliders size={24} /></div>
          <div>
            <div className="dash-card-val">{currentDoctor.currentWorkloadCount} / {currentDoctor.maxPatientsPerDay}</div>
            <div className="dash-card-lbl">Daily Workload ({currentDoctor.workloadLevel} Load)</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><ShieldCheck size={24} /></div>
          <div>
            <div className="dash-card-val">{currentDoctor.emergencySlotsReserved - currentDoctor.emergencySlotsUsed} Rem</div>
            <div className="dash-card-lbl">Emergency Reserved Slots</div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: LIVE QUEUE CONTROL + AVAILABILITY CONFIGURATION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>

        {/* LEFT COLUMN: LIVE PATIENT QUEUE CONTROL */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Live Patient Consultation Queue</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Advance queue or complete patient consultations in real time.</p>
            </div>
            <button
              onClick={() => advanceDoctorQueue(currentDoctor.id)}
              className="primary-btn"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              <Play size={14} /> Call Next Patient
            </button>
          </div>

          {/* CURRENTLY CONSULTING BANNER */}
          {currentConsulting ? (
            <div style={{ background: 'linear-gradient(135deg, #0d8b72, #064e3b)', color: '#ffffff', padding: '20px', borderRadius: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 800 }}>NOW INSIDE CLINIC</span>
                <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0 2px 0' }}>Token {currentConsulting.token}: {currentConsulting.patientName}</h2>
                <p style={{ fontSize: '12px', color: '#a7f3d0', margin: 0 }}>Consultation in progress... (~{currentDoctor.consultationDurationMin} min)</p>
              </div>
              <button
                onClick={() => advanceDoctorQueue(currentDoctor.id)}
                style={{ background: '#ffffff', color: '#0d8b72', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
              >
                Mark Completed ✓
              </button>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', border: '1px border var(--border)', padding: '16px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
              No active consultation. Click <strong>"Call Next Patient"</strong> to begin.
            </div>
          )}

          {/* WAITING QUEUE LIST */}
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Waiting Queue ({waitingPatients.length} Patients)
          </h4>

          {waitingPatients.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No patients currently waiting in queue.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {waitingPatients.map((patient) => (
                <div key={patient.token} style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                      {patient.token}
                    </div>
                    <div>
                      <h5 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>{patient.patientName}</h5>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Position #{patient.position} • Est. Wait: ~{patient.estWaitMin} mins</span>
                    </div>
                  </div>

                  <span style={{ fontSize: '11px', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '8px' }}>
                    Waiting
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DOCTOR AVAILABILITY & CONFIGURATION */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>Manage Working Schedule</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            System automatically prevents new appointments when set to 🔴 Unavailable.
          </p>

          {configSuccess && (
            <div className="error-banner" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857', marginBottom: '16px' }}>
              <CheckCircle2 size={16} /> Schedule updated successfully!
            </div>
          )}

          <form onSubmit={handleSaveSchedule}>
            <div className="input-group">
              <label>Availability Status</label>
              <select className="input-field" value={statusInput} onChange={(e) => handleStatusToggle(e.target.value)}>
                <option value="Available">🟢 Available for Appointments</option>
                <option value="On Break">☕ On Break / Lunch</option>
                <option value="Limited">🟡 Limited Capacity</option>
                <option value="Unavailable">🔴 Unavailable / Off Duty</option>
                <option value="On Leave">⚫ On Vacation / Leave</option>
              </select>
            </div>

            <div className="input-group">
              <label>Working Shift Hours</label>
              <input type="text" className="input-field" value={workingHoursInput} onChange={(e) => setWorkingHoursInput(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>Scheduled Break Time</label>
              <input type="text" className="input-field" value={breakTimeInput} onChange={(e) => setBreakTimeInput(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label>Max Patients / Day</label>
                <input type="number" className="input-field" value={maxPatientsInput} onChange={(e) => setMaxPatientsInput(e.target.value)} required />
              </div>

              <div className="input-group">
                <label>Consult Duration (mins)</label>
                <input type="number" className="input-field" value={durationInput} onChange={(e) => setDurationInput(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label>Emergency Reserved Slots</label>
              <input type="number" className="input-field" value={emergencySlotsInput} onChange={(e) => setEmergencySlotsInput(e.target.value)} required />
            </div>

            <button type="submit" className="primary-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
              Update Schedule & Capacity Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
