import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, CheckCircle2, AlertCircle, Video, MapPin, Plus, FileText, X, ChevronRight, Phone, Sparkles, ArrowRight, ShieldCheck, Users, Info, Award, Compass, HeartPulse, Printer, Download, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHealthPlatform } from '../context/HealthPlatformContext';
import { aiTriageAnalysis, getTopDoctorMatches, predictNoShowRisk } from '../utils/aiAllocationEngine';

export default function Appointments() {
  const { user, activeFamilyMember, setActiveFamilyMember, familyMembers } = useAuth();
  const { doctors } = useHealthPlatform();

  const [activeTab, setActiveTab] = useState('ai-allocator'); // 'ai-allocator' | 'manual' | 'my-bookings'

  // AI Allocation Wizard state
  const [patientRequirement, setPatientRequirement] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('Routine');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('11:30 AM');
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bookedToken, setBookedToken] = useState(null);
  const [activeSlipModal, setActiveSlipModal] = useState(null); // Printable Token Slip Modal

  // Manual booking states
  const [manualDoctorId, setManualDoctorId] = useState(1);
  const [manualConsultType, setManualConsultType] = useState('in-person');
  const [manualDate, setManualDate] = useState('2026-09-15');
  const [manualSlot, setManualSlot] = useState('10:00 AM');
  const [patientName, setPatientName] = useState(user?.name || 'Ramesh Kumar');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '9876543210');

  // Appointments stored in localStorage
  const [myAppointments, setMyAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('ruralcare_user_appointments');
      return saved ? JSON.parse(saved) : [
        {
          id: 'APT-801',
          token: 'A-27',
          doctorName: 'Dr. S. Reddy',
          specialty: 'General Medicine',
          department: 'General Medicine',
          clinic: 'Ramapuram Primary Health Center (PHC)',
          date: '2026-09-15',
          timeSlot: '10:00 AM',
          consultType: 'in-person',
          patientName: user?.name || 'Ramesh Kumar',
          familyMember: 'Self',
          reason: 'Fever for 2 days & Routine Checkup',
          status: 'Confirmed',
          queuePosition: 4,
          estWaitMin: 18,
          matchScore: 94,
          noShowRiskScore: 25,
          createdAt: new Date().toLocaleDateString()
        },
        {
          id: 'APT-802',
          token: 'A-45',
          doctorName: 'Dr. Kavitha M.',
          specialty: 'Obstetrics & Gynecology',
          department: 'Obstetrics & Gynecology',
          clinic: 'District General Hospital & CHC',
          date: '2026-09-16',
          timeSlot: '11:30 AM',
          consultType: 'in-person',
          patientName: 'Priya Sharma',
          familyMember: 'Spouse',
          reason: 'Routine Prenatal Consultation',
          status: 'Confirmed',
          queuePosition: 2,
          estWaitMin: 12,
          matchScore: 91,
          noShowRiskScore: 15,
          createdAt: new Date().toLocaleDateString()
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ruralcare_user_appointments', JSON.stringify(myAppointments));
  }, [myAppointments]);

  // Run AI Doctor Matching Engine (Instant 0ms latency)
  const handleRunAiAllocation = (e, overrideQuery) => {
    if (e && e.preventDefault) e.preventDefault();
    const query = (overrideQuery || patientRequirement || '').trim();

    if (!query) {
      alert('Please describe your health requirement or select a concern pill.');
      return;
    }

    setIsAnalyzing(true);

    // Synchronous instant calculation (0ms)
    const triage = aiTriageAnalysis(query);

    const topMatches = getTopDoctorMatches({
      doctorsList: doctors || [],
      department: triage.department,
      requestedTime: preferredTimeSlot,
      userDistanceKm: 3.2
    });

    setAiAnalysisResult({
      triage,
      topMatches,
      bestMatch: topMatches[0]
    });
    setIsAnalyzing(false);
  };

  // Confirm Appointment with Chosen Matched Doctor (REAL BOOKING)
  const handleConfirmMatchedDoctorBooking = (matchOption) => {
    if (!matchOption) return;

    const { doctor, scoring, availableSlot } = matchOption;
    const newToken = `A-${Math.floor(28 + Math.random() * 30)}`;
    const newId = `APT-${Math.floor(100 + Math.random() * 900)}`;
    const noShow = predictNoShowRisk({ consultType: 'in-person', reason: patientRequirement });

    const newApt = {
      id: newId,
      token: newToken,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      department: aiAnalysisResult?.triage?.department || doctor.department,
      clinic: doctor.clinic,
      date: '2026-09-15',
      timeSlot: availableSlot || '11:30 AM',
      consultType: 'in-person',
      patientName: patientName || user?.name || 'Citizen',
      patientPhone: patientPhone || user?.phone || '9876543210',
      familyMember: activeFamilyMember,
      reason: patientRequirement || 'AI Doctor Matching Appointment',
      status: 'Confirmed',
      queuePosition: (doctor.currentWorkloadCount || 3) + 1,
      estWaitMin: scoring.estWaitMinutes,
      matchScore: scoring.matchScore,
      noShowRiskScore: noShow.riskPercentage,
      createdAt: new Date().toLocaleDateString()
    };

    setMyAppointments(prev => [newApt, ...prev]);
    setBookedToken(newApt);
    setAiAnalysisResult(null);
  };

  // REAL MANUAL BOOKING HANDLER
  const handleConfirmManualBooking = (e) => {
    e.preventDefault();

    const doc = doctors.find(d => d.id === Number(manualDoctorId)) || doctors[0];
    const newToken = `A-${Math.floor(30 + Math.random() * 40)}`;
    const newId = `APT-${Math.floor(100 + Math.random() * 900)}`;

    const newApt = {
      id: newId,
      token: newToken,
      doctorName: doc.name,
      specialty: doc.specialty,
      department: doc.department,
      clinic: doc.clinic,
      date: manualDate,
      timeSlot: manualSlot,
      consultType: manualConsultType,
      patientName: patientName || user?.name || 'Citizen',
      patientPhone: patientPhone || '9876543210',
      familyMember: activeFamilyMember,
      reason: 'Manual Direct Selection Appointment',
      status: 'Confirmed',
      queuePosition: (doc.currentWorkloadCount || 4) + 1,
      estWaitMin: 15,
      matchScore: 88,
      noShowRiskScore: 20,
      createdAt: new Date().toLocaleDateString()
    };

    setMyAppointments(prev => [newApt, ...prev]);
    setBookedToken(newApt);
    setActiveTab('ai-allocator');
  };

  const handleCancelAppointment = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment? The slot will be automatically reallocated to waiting patients.')) {
      setMyAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const quickRequirementPills = [
    { label: '🤒 Fever & Body Pain', query: 'High fever, body ache, and cold' },
    { label: '🩺 Skin Rash / Spot', query: 'Itchy skin rash and redness' },
    { label: '👁️ Red Eye & Vision', query: 'Eye irritation and blurred vision' },
    { label: '🤱 Maternity / Pregnancy', query: 'Routine prenatal checkup and maternity guidance' },
    { label: '🦴 Joint / Back Pain', query: 'Severe knee pain and joint stiffness' }
  ];

  return (
    <div className="container" style={{ padding: '36px 24px', maxWidth: '1080px' }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '6px', display: 'block' }}>
          REAL-TIME AI DOCTOR APPOINTMENT BOOKING & TOKEN QUEUE PLATFORM
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Smart Appointment Allocation & Token System
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '680px', margin: '0 auto' }}>
          Select your health concern, match with available doctors, get instant live queue token (e.g. Token A-27), and download your official appointment slip.
        </p>
      </div>

      {/* FAMILY MEMBER SELECTOR BAR */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="var(--primary)" />
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>Patient Profile:</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>{activeFamilyMember}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {familyMembers.map((m) => (
            <button
              key={m}
              onClick={() => setActiveFamilyMember(m.split(' ')[0])}
              className={`pill-btn ${activeFamilyMember === m.split(' ')[0] ? 'active' : ''}`}
              style={{
                background: activeFamilyMember === m.split(' ')[0] ? 'var(--primary)' : '#f1f5f9',
                color: activeFamilyMember === m.split(' ')[0] ? '#ffffff' : '#475569',
                fontWeight: 700
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
        <div className="role-selector" style={{ maxWidth: '540px', width: '100%' }}>
          <button
            type="button"
            className={`role-option ${activeTab === 'ai-allocator' ? 'active' : ''}`}
            onClick={() => { setActiveTab('ai-allocator'); setBookedToken(null); }}
          >
            <Sparkles size={16} /> AI Doctor Matcher
          </button>
          <button
            type="button"
            className={`role-option ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => { setActiveTab('manual'); setBookedToken(null); }}
          >
            <Plus size={16} /> Manual Booking
          </button>
          <button
            type="button"
            className={`role-option ${activeTab === 'my-bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-bookings')}
          >
            <Calendar size={16} /> My Active Bookings ({myAppointments.filter(a => a.status !== 'Cancelled').length})
          </button>
        </div>
      </div>

      {/* TAB 1: AI DOCTOR MATCHING ENGINE & COMPARISON */}
      {activeTab === 'ai-allocator' && (
        <>
          {bookedToken ? (
            /* SUCCESS APPOINTMENT BOOKED CONFIRMATION CARD */
            <div style={{ background: '#ecfdf5', border: '2px solid #a7f3d0', padding: '36px 28px', borderRadius: '20px', textAlign: 'center', maxWidth: '680px', margin: '0 auto', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ width: '64px', height: '64px', background: '#10b981', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle2 size={38} />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#065f46', marginBottom: '6px' }}>Appointment Successfully Booked!</h2>
              <p style={{ fontSize: '13px', color: '#047857', margin: '0 0 20px 0' }}>
                Matched Doctor: <strong>{bookedToken.doctorName}</strong> (Match Score: <strong>{bookedToken.matchScore}%</strong>)
              </p>

              <div style={{ background: '#ffffff', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '20px', margin: '20px 0', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, background: '#0d8b72', color: '#fff', padding: '4px 12px', borderRadius: '12px' }}>
                    YOUR LIVE QUEUE TOKEN: {bookedToken.token}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '8px' }}>
                    ● STATUS: CONFIRMED
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{bookedToken.doctorName} ({bookedToken.specialty})</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>📍 {bookedToken.clinic}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>
                  📅 Scheduled Date & Time: <strong>{bookedToken.date} at {bookedToken.timeSlot}</strong> (Queue Position #{bookedToken.queuePosition})
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  ⏱️ Estimated Waiting Time: ~{bookedToken.estWaitMin} mins | Patient: <strong>{bookedToken.patientName} ({bookedToken.familyMember})</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="primary-btn" onClick={() => setActiveSlipModal(bookedToken)} style={{ background: '#0d8b72' }}>
                  <Printer size={16} /> Download Official Token Slip
                </button>
                <button className="secondary-btn" onClick={() => setActiveTab('my-bookings')} style={{ color: '#334155', borderColor: '#cbd5e1' }}>
                  View All Active Bookings →
                </button>
                <button className="secondary-btn" style={{ color: '#334155', borderColor: '#cbd5e1' }} onClick={() => setBookedToken(null)}>
                  + Book Another Appointment
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: aiAnalysisResult ? '0.9fr 1.1fr' : '1fr', gap: '24px' }}>
              {/* REQUIREMENT INPUT FORM */}
              <form onSubmit={handleRunAiAllocation} style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '28px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Sparkles color="var(--primary)" size={20} />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Step 1: Describe Healthcare Need</h3>
                </div>

                <div className="input-group">
                  <label>Select Quick Health Concern Pill:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {quickRequirementPills.map((pill, i) => (
                      <button
                        key={i}
                        type="button"
                        className="pill-btn"
                        style={{ fontSize: '11px', background: '#f8fafc', border: '1px solid var(--border)' }}
                        onClick={() => {
                          setPatientRequirement(pill.query);
                          handleRunAiAllocation(null, pill.query);
                        }}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label>Or Describe Symptoms / Specialty Needed</label>
                  <textarea
                    rows={3}
                    className="input-field"
                    style={{ height: '80px', padding: '10px' }}
                    placeholder="e.g. High fever for 2 days with severe cough..."
                    value={patientRequirement}
                    onChange={(e) => setPatientRequirement(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label>Patient Name</label>
                    <input type="text" className="input-field" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Full Name" />
                  </div>

                  <div className="input-group" style={{ margin: 0 }}>
                    <label>Preferred Time Slot</label>
                    <select className="input-field" value={preferredTimeSlot} onChange={(e) => setPreferredTimeSlot(e.target.value)}>
                      <option value="09:30 AM">09:30 AM (Morning)</option>
                      <option value="11:30 AM">11:30 AM (Mid-day)</option>
                      <option value="02:30 PM">02:30 PM (Afternoon)</option>
                      <option value="04:30 PM">04:30 PM (Evening)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="primary-btn"
                  style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '14px' }}
                >
                  {isAnalyzing ? 'Matching Doctor & Generating Token...' : '⚡ Find Best Doctor & Book Appointment'}
                </button>
              </form>

              {/* TOP 3 DOCTOR COMPARISON & MATCH SCORE RESULTS */}
              {aiAnalysisResult && (
                <div>
                  <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', padding: '14px 18px', borderRadius: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '10px', fontWeight: 800, background: '#9333ea', color: '#fff', padding: '2px 8px', borderRadius: '6px' }}>
                        AI TRIAGE MATCH: {aiAnalysisResult.triage.department}
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#4c1d95', margin: '4px 0 0 0' }}>Top 3 AI Recommended Doctors</h3>
                    </div>
                    <span style={{ fontSize: '11px', color: '#6b21a8', fontWeight: 700 }}>
                      Evaluated {doctors.length} Doctors
                    </span>
                  </div>

                  {/* EMERGENCY OVERRIDE IF APPLICABLE */}
                  {aiAnalysisResult.triage.isEmergencyOverride && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '16px', marginBottom: '16px', color: '#991b1b' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px 0' }}>🚨 EMERGENCY OVERRIDE TRIGGERED</h4>
                      <p style={{ fontSize: '12px', margin: '0 0 10px 0' }}>{aiAnalysisResult.triage.triageNote}</p>
                      <a href="tel:108" className="primary-btn" style={{ background: '#dc2626', color: '#fff', fontSize: '12px', padding: '8px 14px' }}>
                        <Phone size={14} /> Call 108 Emergency Ambulance
                      </a>
                    </div>
                  )}

                  {/* TOP 3 DOCTORS LIST */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {aiAnalysisResult.topMatches.map((matchItem, idx) => {
                      const isTopChoice = idx === 0;
                      const { doctor, scoring, availableSlot } = matchItem;

                      return (
                        <div
                          key={doctor.id || idx}
                          style={{
                            background: isTopChoice ? '#ffffff' : '#f8fafc',
                            border: isTopChoice ? '2px solid #16a34a' : '1px solid var(--border)',
                            borderRadius: '18px',
                            padding: '18px',
                            boxShadow: isTopChoice ? '0 8px 24px rgba(22, 163, 74, 0.12)' : 'none',
                            position: 'relative'
                          }}
                        >
                          {isTopChoice && (
                            <div style={{ position: 'absolute', top: '-12px', left: '16px', background: '#16a34a', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Award size={12} /> 🏆 1st Choice / Best Match ({scoring.matchScore}% Excellent Match)
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: isTopChoice ? '6px' : '0' }}>
                            <div>
                              <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                                {idx + 1}. {doctor.name}
                              </h4>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                                {doctor.specialty || doctor.department}
                              </span>
                              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                                📍 {doctor.clinic} ({scoring.distanceKm} km away)
                              </p>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                              <div style={{
                                fontSize: '15px', fontWeight: 800,
                                color: isTopChoice ? '#15803d' : '#0369a1',
                                background: isTopChoice ? '#f0fdf4' : '#f0f9ff',
                                border: `1px solid ${isTopChoice ? '#bbf7d0' : '#bae6fd'}`,
                                padding: '4px 10px', borderRadius: '10px'
                              }}>
                                {scoring.scoreLabel}
                              </div>
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                Scheduling Match Score
                              </span>
                            </div>
                          </div>

                          {/* WHY RECOMMENDED */}
                          <div style={{ background: isTopChoice ? '#f0fdf4' : '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 12px', margin: '12px 0' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Why Recommended?
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                              {scoring.matchReasons.map((reason, rIdx) => (
                                <span key={rIdx} style={{ fontSize: '11px', fontWeight: 700, color: isTopChoice ? '#166534' : '#475569', background: isTopChoice ? '#dcfce7' : '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              ⏰ Slot: <strong>Tomorrow at {availableSlot}</strong> • ⏱️ Wait: <strong>~{scoring.estWaitMinutes} mins</strong>
                            </div>

                            <button
                              onClick={() => handleConfirmMatchedDoctorBooking(matchItem)}
                              className="primary-btn"
                              style={{
                                background: isTopChoice ? '#16a34a' : 'var(--primary)',
                                fontSize: '12px',
                                padding: '8px 16px',
                                borderRadius: '8px'
                              }}
                            >
                              Confirm & Book Appointment →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 2: MANUAL SELECT APPOINTMENT FORM */}
      {activeTab === 'manual' && (
        <form onSubmit={handleConfirmManualBooking} style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '28px', borderRadius: '20px', maxWidth: '650px', margin: '0 auto', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Manual Doctor & Slot Selection (Direct Booking)
          </h3>

          <div className="input-group">
            <label>Patient Name *</label>
            <input type="text" required className="input-field" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Full Name" />
          </div>

          <div className="input-group">
            <label>Select Doctor & Hospital Facility *</label>
            <select className="input-field" value={manualDoctorId} onChange={(e) => setManualDoctorId(Number(e.target.value))}>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} — {d.specialty} ({d.clinic})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label>Consultation Date</label>
              <input type="date" className="input-field" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label>Select Time Slot</label>
              <select className="input-field" value={manualSlot} onChange={(e) => setManualSlot(e.target.value)}>
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="04:30 PM">04:30 PM</option>
              </select>
            </div>
          </div>

          <button type="submit" className="primary-btn" style={{ width: '100%', padding: '12px', justifyContent: 'center', background: '#0d8b72' }}>
            Confirm & Create Real Appointment Token
          </button>
        </form>
      )}

      {/* TAB 3: MY ACTIVE BOOKINGS & LIVE QUEUE TRACKER */}
      {activeTab === 'my-bookings' && (
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              My Active Appointments & Live Token Queue
            </h3>
            <button
              onClick={() => { setActiveTab('ai-allocator'); setBookedToken(null); }}
              className="primary-btn"
              style={{ fontSize: '12px', padding: '8px 14px', background: '#0d8b72' }}
            >
              <Plus size={14} /> Book New Appointment
            </button>
          </div>

          {myAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '16px' }}>
              <Calendar size={32} color="#cbd5e1" style={{ margin: '0 auto 8px auto' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No appointments booked yet.</p>
              <button onClick={() => setActiveTab('ai-allocator')} className="primary-btn" style={{ fontSize: '12px', marginTop: '10px' }}>
                Find Best Doctor & Book Now →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myAppointments.map((apt) => {
                const isCancelled = apt.status === 'Cancelled';

                return (
                  <div
                    key={apt.id}
                    style={{
                      background: isCancelled ? '#fff5f5' : '#ffffff',
                      border: `1px solid ${isCancelled ? '#fecaca' : 'var(--border)'}`,
                      borderRadius: '16px',
                      padding: '18px',
                      boxShadow: isCancelled ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
                      opacity: isCancelled ? 0.8 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, background: isCancelled ? '#dc2626' : '#0d8b72', color: '#fff', padding: '4px 12px', borderRadius: '12px' }}>
                        TOKEN: {apt.token}
                      </span>
                      <span style={{
                        fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px',
                        background: isCancelled ? '#fef2f2' : '#ecfdf5',
                        color: isCancelled ? '#dc2626' : '#047857',
                        border: `1px solid ${isCancelled ? '#fecaca' : '#a7f3d0'}`
                      }}>
                        ● {isCancelled ? 'Cancelled' : 'Confirmed (Active)'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{apt.doctorName}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, margin: '0 0 8px 0' }}>{apt.specialty} • {apt.clinic}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                          📅 Date: <strong>{apt.date} at {apt.timeSlot}</strong> (Patient: <strong>{apt.patientName} — {apt.familyMember || 'Self'}</strong>)
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                          ⏱️ Queue Position: #{apt.queuePosition || 3} | Est. Waiting: ~{apt.estWaitMin || 15} mins | Match Score: {apt.matchScore || 94}%
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setActiveSlipModal(apt)}
                          className="secondary-btn"
                          style={{ fontSize: '11px', padding: '6px 12px', borderColor: '#cbd5e1', color: '#334155' }}
                        >
                          <Printer size={12} /> Slip
                        </button>
                        {!isCancelled && (
                          <button
                            onClick={() => handleCancelAppointment(apt.id)}
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PRINTABLE / DOWNLOADABLE OFFICIAL TOKEN SLIP MODAL */}
      {activeSlipModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartPulse size={22} color="#0d8b72" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>RuralCare Official Token Slip</h3>
              </div>
              <button onClick={() => setActiveSlipModal(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ border: '2px dashed #0d8b72', background: '#ecfdf5', borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>APPOINTMENT TOKEN</span>
              <h1 style={{ fontSize: '38px', fontWeight: 800, color: '#065f46', margin: '4px 0 8px 0' }}>{activeSlipModal.token}</h1>
              <span style={{ fontSize: '11px', fontWeight: 800, background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '6px' }}>
                STATUS: {activeSlipModal.status.toUpperCase()}
              </span>
            </div>

            <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, marginBottom: '20px' }}>
              <strong>Patient Name:</strong> {activeSlipModal.patientName} ({activeSlipModal.familyMember || 'Self'})<br />
              <strong>Doctor:</strong> {activeSlipModal.doctorName} ({activeSlipModal.specialty})<br />
              <strong>Department:</strong> {activeSlipModal.department}<br />
              <strong>Facility:</strong> {activeSlipModal.clinic}<br />
              <strong>Scheduled Date:</strong> {activeSlipModal.date} at {activeSlipModal.timeSlot}<br />
              <strong>Est. Queue Waiting:</strong> ~{activeSlipModal.estWaitMin} mins (Queue #{activeSlipModal.queuePosition})
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handlePrintSlip} className="primary-btn" style={{ flex: 1, justifyContent: 'center', background: '#0d8b72' }}>
                <Printer size={16} /> Print / Save PDF
              </button>
              <button onClick={() => setActiveSlipModal(null)} className="secondary-btn" style={{ flex: 1, justifyContent: 'center' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
