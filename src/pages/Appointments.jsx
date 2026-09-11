import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, CheckCircle2, AlertCircle, Video, MapPin, Plus, FileText, X, ChevronRight, Phone, Sparkles, ArrowRight, ShieldCheck, Users, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHealthPlatform } from '../context/HealthPlatformContext';
import { aiTriageAnalysis, recommendDoctorAndSlot, predictNoShowRisk } from '../utils/aiAllocationEngine';

export default function Appointments() {
  const { user, activeFamilyMember, setActiveFamilyMember, familyMembers } = useAuth();
  const { doctors, liveQueue } = useHealthPlatform();

  const [activeTab, setActiveTab] = useState('ai-allocator'); // 'ai-allocator' | 'manual' | 'my-bookings'

  // AI Allocation Wizard state
  const [patientRequirement, setPatientRequirement] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('Routine');
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [bookedToken, setBookedToken] = useState(null);

  // Manual booking states
  const [manualDoctor, setManualDoctor] = useState(1);
  const [manualConsultType, setManualConsultType] = useState('in-person');
  const [manualDate, setManualDate] = useState('2026-09-15');
  const [manualSlot, setManualSlot] = useState('10:00 AM');
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');

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
          estWaitMin: 32,
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

  // Run AI Allocation Engine
  const handleRunAiAllocation = (e) => {
    e.preventDefault();
    if (!patientRequirement.trim()) {
      alert('Please describe your health requirement or symptoms.');
      return;
    }

    setIsAnalyzing(true);

    setTimeout(() => {
      // 1. AI Triage
      const triage = aiTriageAnalysis(patientRequirement);

      // 2. Doctor & Slot Matching
      const recommendation = recommendDoctorAndSlot({
        doctorsList: doctors,
        department: triage.department,
        urgency: selectedUrgency,
        requestedDate: '2026-09-15'
      });

      setAiAnalysisResult({
        triage,
        recommendation
      });
      setIsAnalyzing(false);
    }, 600);
  };

  // Confirm AI Allocated Appointment
  const handleConfirmAiBooking = () => {
    if (!aiAnalysisResult) return;

    const { recommendation, triage } = aiAnalysisResult;
    const newToken = `A-${Math.floor(28 + Math.random() * 30)}`;
    const newId = `APT-${Math.floor(100 + Math.random() * 900)}`;

    const noShow = predictNoShowRisk({ consultType: 'in-person', reason: patientRequirement });

    const newApt = {
      id: newId,
      token: newToken,
      doctorName: recommendation.recommendedDoctor.name,
      specialty: recommendation.recommendedDoctor.specialty,
      department: triage.department,
      clinic: recommendation.recommendedHospital,
      date: '2026-09-15',
      timeSlot: recommendation.bestSlot,
      consultType: 'in-person',
      patientName: patientName || user?.name || 'Citizen',
      patientPhone: patientPhone || user?.phone || '9876543210',
      familyMember: activeFamilyMember,
      reason: patientRequirement,
      status: 'Confirmed',
      queuePosition: recommendation.recommendedDoctor.currentWorkloadCount + 1,
      estWaitMin: recommendation.estimatedWaitMinutes,
      noShowRiskScore: noShow.riskPercentage,
      createdAt: new Date().toLocaleDateString()
    };

    setMyAppointments(prev => [newApt, ...prev]);
    setBookedToken(newApt);
    setAiAnalysisResult(null);
    setPatientRequirement('');
  };

  const handleCancelAppointment = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment? The slot will be automatically reallocated.')) {
      setMyAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a));
    }
  };

  return (
    <div className="container" style={{ padding: '36px 24px', maxWidth: '1050px' }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '6px', display: 'block' }}>
          AI DOCTOR AVAILABILITY & SMART ALLOCATION PLATFORM
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Intelligent Doctor & Slot Recommendation Engine
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '650px', margin: '0 auto' }}>
          Input your health requirement ➔ AI analyzes department, doctor workload, availability, and recommends the optimal time slot & live queue token.
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
            <Sparkles size={16} /> AI Smart Allocation
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

      {/* TAB 1: AI SMART ALLOCATION WIZARD */}
      {activeTab === 'ai-allocator' && (
        <>
          {bookedToken ? (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '36px 28px', borderRadius: '20px', textAlign: 'center', maxWidth: '650px', margin: '0 auto', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '64px', height: '64px', background: '#10b981', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle2 size={38} />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#065f46', marginBottom: '6px' }}>AI Recommended Appointment Booked!</h2>
              
              <div style={{ background: '#ffffff', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '20px', margin: '20px 0', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, background: '#0d8b72', color: '#fff', padding: '3px 10px', borderRadius: '12px' }}>
                    YOUR LIVE TOKEN: {bookedToken.token}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981' }}>● STATUS: CONFIRMED</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{bookedToken.doctorName} ({bookedToken.specialty})</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>📍 {bookedToken.clinic}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>
                  📅 Scheduled: {bookedToken.date} at {bookedToken.timeSlot} (Queue Position #{bookedToken.queuePosition})
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
                  New AI Allocation
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: aiAnalysisResult ? '1fr 1.1fr' : '1fr', gap: '24px' }}>
              {/* REQUIREMENT INPUT FORM */}
              <form onSubmit={handleRunAiAllocation} style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '28px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Sparkles color="var(--primary)" size={20} />
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Step 1: Describe Your Health Requirement</h3>
                </div>

                <div className="input-group">
                  <label>Symptoms / Health Concern</label>
                  <textarea
                    className="input-field"
                    style={{ height: '110px', paddingTop: '12px', resize: 'vertical' }}
                    placeholder="e.g. High fever with body ache for 2 days, chest pain, diabetes sugar check, baby vaccination..."
                    value={patientRequirement}
                    onChange={(e) => setPatientRequirement(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Urgency Level</label>
                  <select className="input-field" value={selectedUrgency} onChange={(e) => setSelectedUrgency(e.target.value)}>
                    <option value="Routine">Standard / Routine Visit</option>
                    <option value="High">High Urgency (Fever, Acute Pain)</option>
                    <option value="Emergency">Emergency Case</option>
                  </select>
                </div>

                <button type="submit" className="primary-btn" style={{ width: '100%', height: '46px', justifyContent: 'center', fontSize: '14px' }} disabled={isAnalyzing}>
                  {isAnalyzing ? 'AI Engine Analyzing Doctor Workload...' : '⚡ Run AI Doctor & Slot Match'}
                </button>

                <div className="error-banner" style={{ background: '#f8fafc', border: '1px solid var(--border)', color: 'var(--text-muted)', marginTop: '16px', fontSize: '11px' }}>
                  <Info size={14} /> AI guidance is for informational purposes only and does not replace professional medical advice.
                </div>
              </form>

              {/* STEP 2: AI ALLOCATION RECOMMENDATION RESULT CARD */}
              {aiAnalysisResult && (
                <div style={{ background: '#ffffff', border: '2px solid var(--primary)', padding: '28px', borderRadius: '20px', boxShadow: 'var(--shadow-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, background: 'var(--primary)', color: '#fff', padding: '3px 10px', borderRadius: '12px' }}>
                      BEST AI MATCH FOUND
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>Workload Balanced</span>
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Recommended Department: {aiAnalysisResult.triage.department}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    {aiAnalysisResult.triage.triageNote}
                  </p>

                  <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: '14px', marginBottom: '16px', border: '1px solid #a7f3d0' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#065f46', margin: '0 0 4px 0' }}>
                      Recommended Specialist: {aiAnalysisResult.recommendation.recommendedDoctor.name}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#047857', margin: '0 0 8px 0' }}>
                      {aiAnalysisResult.recommendation.recommendedDoctor.specialty}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 700, margin: '0 0 4px 0' }}>
                      📍 Hospital: {aiAnalysisResult.recommendation.recommendedHospital}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 700, margin: 0 }}>
                      ⏰ Best Available Slot: {aiAnalysisResult.recommendation.bestSlot} (Est. Wait: ~{aiAnalysisResult.recommendation.estimatedWaitMinutes} mins)
                    </p>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <strong>AI Allocation Reason:</strong><br />
                    "{aiAnalysisResult.recommendation.reason}"
                  </div>

                  <button onClick={handleConfirmAiBooking} className="primary-btn" style={{ width: '100%', height: '48px', justifyContent: 'center', fontSize: '15px' }}>
                    Accept & Confirm AI Recommended Booking
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 2: MANUAL SELECT FORM */}
      {activeTab === 'manual' && (
        <form onSubmit={(e) => { e.preventDefault(); alert('Manual booking created!'); }} style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '28px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="input-group">
            <label>Select Healthcare Doctor</label>
            <select className="input-field" value={manualDoctor} onChange={(e) => setManualDoctor(e.target.value)}>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.specialty}) — {d.status}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Consultation Date</label>
              <input type="date" className="input-field" value={manualDate} onChange={(e) => setManualDate(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>Time Slot</label>
              <select className="input-field" value={manualSlot} onChange={(e) => setManualSlot(e.target.value)}>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="02:00 PM">02:00 PM</option>
              </select>
            </div>
          </div>

          <button type="submit" className="primary-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
            Confirm Manual Slot
          </button>
        </form>
      )}

      {/* TAB 3: MY BOOKINGS & TOKEN TRACKER */}
      {activeTab === 'my-bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {myAppointments.length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 24px', textAlign: 'center' }}>
              <Calendar size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>No Appointments Booked Yet</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>You haven't scheduled any doctor visits yet.</p>
              <button className="primary-btn" onClick={() => setActiveTab('ai-allocator')}>
                Run AI Doctor & Slot Matcher →
              </button>
            </div>
          ) : (
            myAppointments.map((apt) => (
              <div key={apt.id} style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, background: '#0d8b72', color: '#fff', padding: '3px 8px', borderRadius: '6px' }}>
                      TOKEN: {apt.token || 'A-27'}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 800, background: apt.status === 'Cancelled' ? '#fef2f2' : '#ecfdf5', color: apt.status === 'Cancelled' ? '#dc2626' : '#047857', padding: '3px 8px', borderRadius: '6px' }}>
                      ● {apt.status}
                    </span>
                    {apt.noShowRiskScore && (
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        No-Show Risk: {apt.noShowRiskScore}%
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {apt.doctorName} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>({apt.specialty})</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    📍 {apt.clinic} • Department: {apt.department || 'General Medicine'}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>
                    📅 Date: {apt.date} at ⏰ {apt.timeSlot} (Patient: {apt.patientName} - {apt.familyMember || 'Self'})
                  </p>
                  {apt.queuePosition && apt.status !== 'Cancelled' && (
                    <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 800, marginTop: '4px' }}>
                      ⏱️ Live Queue Position: #{apt.queuePosition} (Est Wait: ~{apt.estWaitMin || 25} mins)
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => alert(`Appointment Slip for Token ${apt.token}\nPatient: ${apt.patientName}\nDoctor: ${apt.doctorName}\nDate: ${apt.date} at ${apt.timeSlot}\nLocation: ${apt.clinic}`)}
                    className="login-btn"
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                  >
                    <FileText size={14} /> Slip
                  </button>
                  {apt.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleCancelAppointment(apt.id)}
                      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Cancel & Reallocate
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
