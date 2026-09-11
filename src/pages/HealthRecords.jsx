import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useHealthPlatform } from '../context/HealthPlatformContext';
import { FileText, Stethoscope, Users, CheckCircle2, Clock, MapPin, Download, ArrowRight, ShieldCheck } from 'lucide-react';

export default function HealthRecords() {
  const { user, activeFamilyMember, setActiveFamilyMember, familyMembers } = useAuth();
  const { referrals, prescriptions } = useHealthPlatform();

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '6px', display: 'block' }}>
          SECURE DIGITAL HEALTH REPOSITORY
        </span>
        <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Digital Prescriptions & Visual Referral Tracker
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Protected health records, lab reports, and end-to-end referral timeline for rural families.
        </p>
      </div>

      {/* FAMILY MEMBER SELECTOR */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>FAMILY HEALTH PROFILE</span>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Viewing Records for: {activeFamilyMember}</h3>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {familyMembers.map((m) => (
            <button
              key={m}
              onClick={() => setActiveFamilyMember(m.split(' ')[0])}
              className={`pill-btn ${activeFamilyMember === m.split(' ')[0] ? 'active' : ''}`}
              style={{
                background: activeFamilyMember === m.split(' ')[0] ? 'var(--primary)' : '#f1f5f9',
                color: activeFamilyMember === m.split(' ')[0] ? '#ffffff' : '#475569',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: '20px'
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* TWO COLUMN GRID: VISUAL REFERRAL TIMELINE + DIGITAL PRESCRIPTIONS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* LEFT: VISUAL REFERRAL TIMELINE */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Visual Hospital Referral Timeline
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Track specialist hospital referrals from local PHCs.
          </p>

          {referrals.map((ref) => (
            <div key={ref.id} style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px' }}>
                  {ref.id}
                </span>
                <span style={{ fontSize: '11px', fontWeight: 800, background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '6px' }}>
                  ● {ref.status}
                </span>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{ref.specialtyRequired}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>From {ref.referringFacility} ➔ {ref.specialistHospital}</p>

              {/* TIMELINE PROGRESS STEPS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid var(--primary)' }}>
                {ref.timeline.map((step, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-27px', top: '2px', width: '12px', height: '12px', borderRadius: '50%', background: step.completed ? 'var(--primary)' : '#cbd5e1' }} />
                    <h5 style={{ fontSize: '13px', fontWeight: 800, color: step.completed ? 'var(--text-primary)' : 'var(--text-muted)', margin: 0 }}>
                      {step.title}
                    </h5>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{step.date}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: DIGITAL PRESCRIPTIONS */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Verified Digital Prescriptions
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Doctor prescriptions and diagnostic records.
          </p>

          {prescriptions.map((rx) => (
            <div key={rx.id} style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', marginBottom: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, background: '#f3e8ff', color: '#7e22ce', padding: '2px 8px', borderRadius: '6px' }}>
                  {rx.id}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>📅 {rx.date}</span>
              </div>

              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{rx.diagnosis}</h4>
              <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, margin: '0 0 12px 0' }}>Prescribed by: {rx.doctorName}</p>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRESCRIBED MEDICINES</span>
                <ul style={{ listStyle: 'none', marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {rx.medicines.map((m, i) => (
                    <li key={i} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <strong>• {m.name}</strong>
                      <span>{m.dosage} ({m.duration})</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => alert(`Downloading Prescription ${rx.id} for ${rx.patientName}...`)}
                className="login-btn"
                style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
              >
                <Download size={14} /> Download Digital Prescription PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
