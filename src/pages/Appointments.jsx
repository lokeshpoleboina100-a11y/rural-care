import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, CheckCircle2, AlertCircle, Video, MapPin, Plus, FileText, X, ChevronRight, Phone, Sparkles, ArrowRight, ShieldCheck, Users, Info, Award, Compass, HeartPulse } from 'lucide-react';
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

  // Manual booking states
  const [manualDoctor, setManualDoctor] = useState(1);
  const [manualConsultType, setManualConsultType] = useState('in-person');
  const [manualDate, setManualDate] = useState('2026-09-15');
  const [manualSlot, setManualSlot] = useState('10:00 AM');
  const [patientName, setPatientName] = useState(user?.name || '');
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
          status: 'Waiting',
          queuePosition: 4,
          estWaitMin: 18,
          matchScore: 94,
          noShowRiskScore: 25,
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

  // Run AI Doctor Matching Engine
  const handleRunAiAllocation = (e) => {
    if (e) e.preventDefault();
    if (!patientRequirement.trim()) {
      alert('Please describe your health requirement or select a concern pill.');
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      // 1. AI Triage
      const triage = aiTriageAnalysis(patientRequirement);

      // 2. AI Doctor Matching (Top 3 Recommendations)
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
    }, 600);
  };

  // Confirm Appointment with Chosen Matched Doctor
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

  const handleCancelAppointment = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment? The slot will be automatically reallocated.')) {
      setMyAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
    }
  };

  const quickRequirementPills = [
    { label: '🤒 Fever & Body Pain', query: 'High fever, body ache, and cold' },
    { label: '🩺 Skin Rash / Spot', query: 'Itchy skin rash and redness' },
    { label: '👁️ Eye Redness & Vision', query: 'Eye irritation and blurred vision' },
    { label: '🤱 Maternity / Pregnancy', query: 'Routine prenatal checkup and maternity guidance' },
    { label: '🦴 Joint / Back Pain', query: 'Severe knee pain and joint stiffness' }
  ];

  return (
    <div className="container" style={{ padding: '36px 24px', maxWidth: '1080px' }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '6px', display: 'block' }}>
          LEVEL 1 & LEVEL 2 AI DOCTOR MATCHING & SLOT ALLOCATION
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          AI Doctor Matching Engine
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '680px', margin: '0 auto' }}>
          RuralCare AI evaluates doctor specialty, real-time availability, workload, distance, and waiting times to match you with the optimal doctor without searching through hundreds of listings.
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
        <div className="role-selector" style={{ maxWidth: '520px', width: '100%' }}>
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
            <Plus size={16} /> Manual Select
          </button>
          <button
            type="button"
            className={`role-option ${activeTab === 'my-bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-bookings')}
          >
            <Calendar size={16} /> My Bookings ({myAppointments.length})
          </button>
        </div>
      </div>

      {/* TAB 1: AI DOCTOR MATCHING ENGINE & COMPARISON */}
      {activeTab === 'ai-allocator' && (
        <>
          {bookedToken ? (
            /* SUCCESS APPOINTMENT BOOKED CONFIRMATION CARD */
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '36px 28px', borderRadius: '20px', textAlign: 'center', maxWidth: '680px', margin: '0 auto', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '64px', height: '64px', background: '#10b981', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle2 size={38} />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#065f46', marginBottom: '6px' }}>AI Recommended Appointment Confirmed!</h2>
              <p style={{ fontSize: '13px', color: '#047857', margin: '0 0 20px 0' }}>
                Matched Doctor: <strong>{bookedToken.doctorName}</strong> (Match Score: <strong>{bookedToken.matchScore}%</strong>)
              </p>

              <div style={{ background: '#ffffff', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '20px', margin: '20px 0', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, background: '#0d8b72', color: '#fff', padding: '4px 12px', borderRadius: '12px' }}>
                    YOUR LIVE TOKEN: {bookedToken.token}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981' }}>● STATUS: CONFIRMED</span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{bookedToken.doctorName} ({bookedToken.specialty})</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>📍 {bookedToken.clinic}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>
                  📅 Scheduled Date & Time: <strong>Tomorrow at {bookedToken.timeSlot}</strong> (Queue Position #{bookedToken.queuePosition})
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  ⏱️ Estimated Waiting Time: ~{bookedToken.estWaitMin} mins
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="primary-btn" onClick={() => setActiveTab('my-bookings')}>
                  Track Live Queue & Bookings →
                </button>
                <button className="secondary-btn" style={{ color: '#334155', borderColor: '#cbd5e1' }} onClick={() => setBookedToken(null)}>
                  Run New Doctor Match
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
                  <label>Select Quick Health Requirement Pill:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {quickRequirementPills.map((pill, i) => (
                      <button
                        key={i}
                        type="button"
                        className="pill-btn"
                        style={{ fontSize: '11px', background: '#f8fafc', border: '1px solid var(--border)' }}
                        onClick={() => {
                          setPatientRequirement(pill.query);
                          handleRunAiAllocation();
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
                    placeholder="e.g. I have severe skin rash and itching on my hands..."
                    value={patientRequirement}
                    onChange={(e) => setPatientRequirement(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label>Urgency Level</label>
                    <select className="input-field" value={selectedUrgency} onChange={(e) => setSelectedUrgency(e.target.value)}>
                      <option value="Routine">Routine Visit</option>
                      <option value="High">Urgent Care (Same Day)</option>
                      <option value="Emergency">Emergency Triage</option>
                    </select>
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
                  {isAnalyzing ? 'Running AI Doctor Matcher...' : '⚡ Run AI Doctor Matching Engine'}
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

                  {/* EMERGENCY WARNING OVERRIDE IF TRIGGERED */}
                  {aiAnalysisResult.triage.isEmergencyOverride && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '16px', marginBottom: '16px', color: '#991b1b' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px 0' }}>🚨 EMERGENCY OVERRIDE TRIGGERED</h4>
                      <p style={{ fontSize: '12px', margin: '0 0 10px 0' }}>{aiAnalysisResult.triage.triageNote}</p>
                      <a href="tel:108" className="primary-btn" style={{ background: '#dc2626', color: '#fff', fontSize: '12px', padding: '8px 14px' }}>
                        <Phone size={14} /> Call 108 Emergency Ambulance
                      </a>
                    </div>
                  )}

                  {/* TOP 3 DOCTORS CARDS LIST */}
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
                          {/* TOP 1 BEST MATCH BADGE */}
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

                            {/* MATCH SCORE BADGE */}
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

                          {/* WHY RECOMMENDED EXPLAINABLE AI BREAKDOWN */}
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

                          {/* SLOT & WAITING TIME INFO BAR */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              ⏰ Available Slot: <strong>Tomorrow at {availableSlot}</strong> • ⏱️ Est. Wait: <strong>~{scoring.estWaitMinutes} mins</strong>
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
                              Book Appointment →
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

      {/* TAB 2: MANUAL SELECT APPOINTMENT */}
      {activeTab === 'manual' && (
        <form onSubmit={(e) => { e.preventDefault(); alert('Appointment booked via manual select!'); setActiveTab('my-bookings'); }} style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '28px', borderRadius: '20px', maxWidth: '650px', margin: '0 auto', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Manual Doctor & Slot Selection
          </h3>

          <div className="input-group">
            <label>Select Doctor</label>
            <select className="input-field" value={manualDoctor} onChange={(e) => setManualDoctor(Number(e.target.value))}>
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
              </select>
            </div>
          </div>

          <button type="submit" className="primary-btn" style={{ width: '100%', padding: '12px', justifyContent: 'center' }}>
            Confirm Manual Booking
          </button>
        </form>
      )}

      {/* TAB 3: MY BOOKINGS & LIVE QUEUE TRACKER */}
      {activeTab === 'my-bookings' && (
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            My Active Appointments & Live Token Queue
          </h3>

          {myAppointments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No active appointments found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myAppointments.map((apt) => (
                <div key={apt.id} style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, background: 'var(--primary)', color: '#fff', padding: '3px 10px', borderRadius: '12px' }}>
                      LIVE TOKEN: {apt.token}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: apt.status === 'Cancelled' ? '#dc2626' : '#10b981' }}>
                      ● STATUS: {apt.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{apt.doctorName}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, margin: '0 0 8px 0' }}>{apt.specialty} • {apt.clinic}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
                    📅 Date: {apt.date} at {apt.timeSlot} | Patient: <strong>{apt.patientName} ({apt.familyMember || 'Self'})</strong>
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                    ⏱️ Est. Waiting Time: ~{apt.estWaitMin} mins | Match Score: {apt.matchScore || 92}%
                  </p>

                  {apt.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleCancelAppointment(apt.id)}
                      style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, marginTop: '12px', cursor: 'pointer' }}
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
