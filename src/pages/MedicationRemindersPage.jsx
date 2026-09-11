import React, { useState, useEffect } from 'react';
import { Pill, Bell, Plus, CheckCircle2, Clock, XCircle, AlertTriangle, RefreshCw, Calendar, FileText, Settings, Volume2, ShieldCheck, Users, ChevronRight, X, Sparkles, Check, HeartPulse, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getMedications,
  saveMedication,
  updateMedicationStatus,
  refillMedication,
  getDoctorPrescriptions,
  convertPrescriptionToReminder,
  getMedicationHistory,
  calculateAdherenceScore,
  getReminderSettings,
  saveReminderSettings,
  triggerSystemNotification,
  requestNotificationPermission
} from '../utils/medicationService';

export default function MedicationRemindersPage() {
  const { user, activeFamilyMember, setActiveFamilyMember, familyMembers } = useAuth();

  // State
  const [medications, setMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState('Today');
  const [settings, setSettings] = useState(getReminderSettings());

  // Modals & UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeAlertMed, setActiveAlertMed] = useState(null);

  // New Medicine Form State
  const [newMedForm, setNewMedForm] = useState({
    name: '',
    dosage: '',
    type: 'Tablet',
    quantityPerDose: '1 Tablet',
    frequency: 'Once daily',
    reminderTime: '08:00 AM',
    instructions: 'After Food',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-10-15',
    totalQuantity: 30,
    notes: ''
  });

  // Load Data
  useEffect(() => {
    loadData();
    requestNotificationPermission();
  }, [activeFamilyMember]);

  const loadData = () => {
    const meds = getMedications(activeFamilyMember);
    const rx = getDoctorPrescriptions();
    const hist = getMedicationHistory(historyFilter);
    setMedications(meds);
    setPrescriptions(rx);
    setHistory(hist);

    // Set first upcoming med as active floating alert preview
    const upcoming = meds.find(m => m.status === 'Upcoming' || m.status === 'Snoozed');
    if (upcoming) {
      setActiveAlertMed(upcoming);
    } else if (meds.length > 0) {
      setActiveAlertMed(meds[0]);
    }
  };

  // Action handlers
  const handleMedAction = (medId, action) => {
    const updated = updateMedicationStatus(medId, action, settings.snoozeMinutes);
    setMedications(getMedications(activeFamilyMember));
    setHistory(getMedicationHistory(historyFilter));

    if (action === 'Taken') {
      triggerSystemNotification('✅ Medicine Recorded', { body: 'Medication status updated to Taken.' });
    } else if (action === 'Snoozed') {
      alert(`Reminder snoozed for ${settings.snoozeMinutes} minutes.`);
    }

    // Refresh active alert
    const remainingUpcoming = updated.find(m => m.status === 'Upcoming');
    setActiveAlertMed(remainingUpcoming || null);
  };

  const handleRefill = (medId) => {
    refillMedication(medId, 30);
    setMedications(getMedications(activeFamilyMember));
    alert('Refill recorded! Added +30 doses to your medicine inventory.');
  };

  const handleAddFromPrescription = (rx) => {
    convertPrescriptionToReminder(rx);
    loadData();
    alert(`Prescription "${rx.medicineName}" added to your daily Medication Reminders!`);
  };

  const handleSaveNewMed = (e) => {
    e.preventDefault();
    if (!newMedForm.name.trim()) {
      alert('Please enter medicine name.');
      return;
    }

    saveMedication(newMedForm, activeFamilyMember);
    loadData();
    setIsAddModalOpen(false);

    // Reset form
    setNewMedForm({
      name: '',
      dosage: '',
      type: 'Tablet',
      quantityPerDose: '1 Tablet',
      frequency: 'Once daily',
      reminderTime: '08:00 AM',
      instructions: 'After Food',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-10-15',
      totalQuantity: 30,
      notes: ''
    });

    triggerSystemNotification('💊 New Medicine Added', { body: `Schedule created for ${newMedForm.name}.` });
  };

  const handleSaveSettingsSubmit = (e) => {
    e.preventDefault();
    saveReminderSettings(settings);
    setIsSettingsOpen(false);
    alert('Medication Reminder settings saved successfully!');
  };

  // Stats calculation
  const totalToday = medications.length;
  const takenToday = medications.filter(m => m.status === 'Taken').length;
  const upcomingToday = medications.filter(m => m.status === 'Upcoming' || m.status === 'Snoozed').length;
  const missedToday = medications.filter(m => m.status === 'Missed' || m.status === 'Skipped').length;
  const adherence = calculateAdherenceScore(history);

  const lowStockMeds = medications.filter(m => m.remainingQuantity <= m.lowStockThreshold);

  return (
    <div className="container" style={{ padding: '36px 24px', maxWidth: '1150px' }}>
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '3px 10px', borderRadius: '12px', letterSpacing: '0.5px' }}>
              PATIENT HEALTH SERVICES
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              🔒 Patient Data Protected
            </span>
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Pill size={32} color="#0d8b72" /> Medication Reminder
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>
            Never miss your prescribed medicines. Smart daily schedule, refill alerts, and doctor prescription sync.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="secondary-btn"
            style={{ fontSize: '13px', padding: '10px 14px', borderColor: 'var(--border)', color: '#475569' }}
          >
            <Settings size={16} /> Settings
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="primary-btn"
            style={{ fontSize: '13px', padding: '10px 18px', background: '#0d8b72' }}
          >
            <Plus size={18} /> Add Medicine
          </button>
        </div>
      </div>

      {/* FAMILY MEMBER SWITCHER BAR */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="var(--primary)" />
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>Managing Reminders For:</span>
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

      {/* SUMMARY STATS CARDS (TOP) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#f0f9ff', color: '#0284c7', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{totalToday}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Today's Medicines</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#ecfdf5', color: '#10b981', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#047857' }}>{takenToday}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Doses Taken</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#eff6ff', color: '#2563eb', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#1e40af' }}>{upcomingToday}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Upcoming Doses</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ background: '#fef2f2', color: '#dc2626', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626' }}>{missedToday}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Missed / Skipped</div>
          </div>
        </div>
      </div>

      {/* REAL-TIME MEDICINE REMINDER NOTIFICATION BANNER */}
      {activeAlertMed && (
        <div style={{ background: 'linear-gradient(135deg, #0d8b72 0%, #064e3b 100%)', color: '#ffffff', borderRadius: '20px', padding: '20px 24px', marginBottom: '28px', boxShadow: '0 8px 24px rgba(13, 139, 114, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={26} color="#ffffff" className="bell-animate" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, background: '#4ade80', color: '#064e3b', padding: '2px 8px', borderRadius: '6px' }}>
                  🔔 MEDICINE REMINDER
                </span>
                <span style={{ fontSize: '12px', color: '#a7f3d0', fontWeight: 700 }}>
                  Scheduled: {activeAlertMed.nextDoseTime || activeAlertMed.timeSlots[0]}
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '4px 0 2px 0' }}>
                It's time to take {activeAlertMed.name} ({activeAlertMed.dosage})
              </h3>
              <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0 }}>
                Dose: <strong>{activeAlertMed.quantityPerDose}</strong> • Timing: <strong>{activeAlertMed.instructions}</strong> ({activeAlertMed.notes})
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleMedAction(activeAlertMed.id, 'Taken')}
              className="primary-btn"
              style={{ background: '#4ade80', color: '#064e3b', fontWeight: 800, fontSize: '13px', padding: '10px 18px' }}
            >
              ✅ Mark Taken
            </button>
            <button
              onClick={() => handleMedAction(activeAlertMed.id, 'Snoozed')}
              className="secondary-btn"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)', fontSize: '13px', padding: '10px 14px' }}
            >
              ⏰ Snooze {settings.snoozeMinutes}m
            </button>
            <button
              onClick={() => handleMedAction(activeAlertMed.id, 'Skipped')}
              style={{ background: 'transparent', color: '#fca5a5', border: 'none', fontSize: '13px', cursor: 'pointer', padding: '10px 8px' }}
            >
              ❌ Skip
            </button>
          </div>
        </div>
      )}

      {/* LOW STOCK REFILL REMINDER ALERT */}
      {lowStockMeds.length > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '16px', padding: '16px 20px', marginBottom: '28px', color: '#9a3412' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle size={22} color="#ea580c" />
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 2px 0' }}>⚠️ Refill Reminder Notice</h4>
                <p style={{ fontSize: '12px', margin: 0 }}>
                  The following medicine is running low: <strong>{lowStockMeds.map(m => `${m.name} (${m.remainingQuantity} left)`).join(', ')}</strong>.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {lowStockMeds.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleRefill(m.id)}
                  style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                >
                  <RefreshCw size={12} style={{ display: 'inline', marginRight: '4px' }} /> Mark {m.name} as Refilled (+30 Doses)
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT GRID: LEFT TODAY SCHEDULE, RIGHT PRESCRIPTIONS & ADHERENCE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '36px' }}>

        {/* LEFT COLUMN: TODAY'S MEDICINE SCHEDULE TIMELINE */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--primary)" /> Today's Medicine Schedule
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {medications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed var(--border)' }}>
              <Pill size={36} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#475569', margin: '0 0 4px 0' }}>No Active Medicine Reminders</h4>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 16px 0' }}>Add a new medicine or select from your doctor prescriptions below.</p>
              <button className="primary-btn" onClick={() => setIsAddModalOpen(true)} style={{ fontSize: '12px' }}>
                <Plus size={14} /> Add First Medicine
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {medications.map((med) => {
                const isTaken = med.status === 'Taken';
                const isSnoozed = med.status === 'Snoozed';
                const isSkipped = med.status === 'Skipped';
                const isLowStock = med.remainingQuantity <= med.lowStockThreshold;

                let statusBadgeBg = '#eff6ff';
                let statusBadgeColor = '#2563eb';
                let statusText = 'Upcoming';

                if (isTaken) {
                  statusBadgeBg = '#ecfdf5';
                  statusBadgeColor = '#047857';
                  statusText = '✅ Taken';
                } else if (isSnoozed) {
                  statusBadgeBg = '#fef3c7';
                  statusBadgeColor = '#b45309';
                  statusText = '⏰ Snoozed';
                } else if (isSkipped) {
                  statusBadgeBg = '#fef2f2';
                  statusBadgeColor = '#dc2626';
                  statusText = '❌ Skipped';
                }

                return (
                  <div
                    key={med.id}
                    style={{
                      background: isTaken ? '#f8fafc' : '#ffffff',
                      border: `1px solid ${isTaken ? '#e2e8f0' : isLowStock ? '#fed7aa' : 'var(--border)'}`,
                      borderRadius: '16px',
                      padding: '18px',
                      boxShadow: isTaken ? 'none' : '0 3px 10px rgba(0,0,0,0.03)',
                      opacity: isTaken ? 0.85 : 1
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, background: '#f1f5f9', color: '#1e293b', padding: '4px 10px', borderRadius: '8px' }}>
                          ⏰ {med.timeSlots[0]}
                        </span>
                        <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                          {med.name} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>({med.dosage})</span>
                        </h4>
                      </div>

                      <span style={{ fontSize: '11px', fontWeight: 800, background: statusBadgeBg, color: statusBadgeColor, padding: '3px 10px', borderRadius: '10px' }}>
                        {statusText}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)', margin: '8px 0 12px 0' }}>
                      <span>Dose: <strong>{med.quantityPerDose} ({med.type})</strong></span>
                      <span>Timing: <strong>{med.instructions}</strong></span>
                      <span>Frequency: <strong>{med.frequency}</strong></span>
                      <span>Remaining: <strong style={{ color: isLowStock ? '#dc2626' : 'var(--text-primary)' }}>{med.remainingQuantity} / {med.totalQuantity}</strong></span>
                    </div>

                    {med.notes && (
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 12px 0', italic: 'true' }}>
                        💡 Note: {med.notes}
                      </p>
                    )}

                    {/* ACTION BUTTONS */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      {isTaken ? (
                        <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>
                          ✓ Taken at {med.takenAt || 'Today'}
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleMedAction(med.id, 'Taken')}
                            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, cursor: 'pointer' }}
                          >
                            ✅ Taken
                          </button>
                          <button
                            onClick={() => handleMedAction(med.id, 'Snoozed')}
                            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            ⏰ Snooze
                          </button>
                          <button
                            onClick={() => handleMedAction(med.id, 'Skipped')}
                            style={{ background: 'none', color: '#94a3b8', border: 'none', fontSize: '12px', cursor: 'pointer', padding: '6px 8px' }}
                          >
                            ❌ Skip
                          </button>
                        </div>
                      )}

                      {isLowStock && (
                        <button
                          onClick={() => handleRefill(med.id)}
                          style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
                        >
                          + Refill Doses
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DOCTOR PRESCRIPTIONS & ADHERENCE TRACKER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* DOCTOR PRESCRIPTIONS INTEGRATION CARD */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="var(--primary)" /> Doctor Prescriptions
              </h3>
              <span style={{ fontSize: '10px', fontWeight: 800, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '6px' }}>
                RuralCare Sync
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
              Prescriptions issued by your RuralCare doctors can be converted into active medication reminders with one click.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {prescriptions.map((rx) => (
                <div key={rx.id} style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{rx.medicineName}</h4>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{rx.prescriptionDate}</span>
                  </div>

                  <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 700, margin: '0 0 6px 0' }}>
                    👨‍⚕️ {rx.doctorName} • {rx.hospital}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                    Dosage: {rx.dosage} • {rx.timing} ({rx.duration})
                  </p>

                  {rx.alreadyAdded ? (
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ✓ Added to Reminders
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddFromPrescription(rx)}
                      className="primary-btn"
                      style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '6px', width: '100%', justifyContent: 'center' }}
                    >
                      + Add to Reminders
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* MEDICATION ADHERENCE TRACKER */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeartPulse size={18} color="#10b981" /> Adherence Tracker
              </h3>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#047857', background: '#ecfdf5', padding: '2px 8px', borderRadius: '8px' }}>
                {adherence.pct}% Score
              </span>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
              You took <strong>{adherence.taken}</strong> of <strong>{adherence.total}</strong> scheduled doses.
            </p>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ width: `${adherence.pct}%`, height: '100%', background: '#10b981', borderRadius: '4px' }} />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              {['Today', 'This Week', 'This Month'].map(f => (
                <button
                  key={f}
                  onClick={() => setHistoryFilter(f)}
                  style={{
                    fontSize: '10px', fontWeight: 700, padding: '4px 10px', borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: historyFilter === f ? 'var(--primary)' : '#f8fafc',
                    color: historyFilter === f ? '#fff' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* History Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {history.slice(0, 4).map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                  <div>
                    <strong style={{ color: '#1e293b' }}>{h.medicine}</strong>
                    <span style={{ color: '#94a3b8', display: 'block' }}>{h.date} at {h.time}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: h.status === 'Taken' ? '#10b981' : h.status === 'Skipped' ? '#dc2626' : '#f59e0b' }}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* SAFETY DISCLAIMER FOOTER */}
      <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 20px', fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
        🔒 <strong>Medical Safety Note:</strong> Medication reminders help you follow your prescribed schedule. Do not change your medicine, dosage, or stop treatment without consulting your qualified healthcare professional.
      </div>

      {/* MODAL 1: ADD MEDICINE MODAL */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>+ Add New Medication Reminder</h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNewMed}>
              <div className="input-group">
                <label>Medicine Name *</label>
                <input type="text" required className="input-field" placeholder="e.g. Paracetamol" value={newMedForm.name} onChange={(e) => setNewMedForm({ ...newMedForm, name: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Dosage (mg/ml)</label>
                  <input type="text" className="input-field" placeholder="e.g. 500 mg" value={newMedForm.dosage} onChange={(e) => setNewMedForm({ ...newMedForm, dosage: e.target.value })} />
                </div>

                <div className="input-group">
                  <label>Medicine Type</label>
                  <select className="input-field" value={newMedForm.type} onChange={(e) => setNewMedForm({ ...newMedForm, type: e.target.value })}>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Frequency</label>
                  <select className="input-field" value={newMedForm.frequency} onChange={(e) => setNewMedForm({ ...newMedForm, frequency: e.target.value })}>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Reminder Time</label>
                  <select className="input-field" value={newMedForm.reminderTime} onChange={(e) => setNewMedForm({ ...newMedForm, reminderTime: e.target.value, timeSlots: [e.target.value] })}>
                    <option value="08:00 AM">08:00 AM (Morning)</option>
                    <option value="01:30 PM">01:30 PM (Afternoon)</option>
                    <option value="08:00 PM">08:00 PM (Night)</option>
                    <option value="09:00 PM">09:00 PM (Bedtime)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Timing Instructions</label>
                  <select className="input-field" value={newMedForm.instructions} onChange={(e) => setNewMedForm({ ...newMedForm, instructions: e.target.value })}>
                    <option value="After Food">After Food</option>
                    <option value="Before Food">Before Food</option>
                    <option value="With Food">With Food</option>
                    <option value="Any Time">Any Time</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Total Quantity (Tablets/Units)</label>
                  <input type="number" className="input-field" value={newMedForm.totalQuantity} onChange={(e) => setNewMedForm({ ...newMedForm, totalQuantity: e.target.value })} />
                </div>
              </div>

              <div className="input-group">
                <label>Special Instructions / Notes</label>
                <input type="text" className="input-field" placeholder="e.g. Take with warm water" value={newMedForm.notes} onChange={(e) => setNewMedForm({ ...newMedForm, notes: e.target.value })} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="secondary-btn" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" style={{ flex: 1, justifyContent: 'center', background: '#0d8b72' }}>
                  Save Medication Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REMINDER SETTINGS MODAL */}
      {isSettingsOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>⚙️ Medication Reminder Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSettingsSubmit}>
              <div className="input-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ margin: 0 }}>Enable Browser & In-App Notifications</label>
                <input type="checkbox" checked={settings.notificationsEnabled} onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })} />
              </div>

              <div className="input-group">
                <label>Default Snooze Duration</label>
                <select className="input-field" value={settings.snoozeMinutes} onChange={(e) => setSettings({ ...settings, snoozeMinutes: Number(e.target.value) })}>
                  <option value={5}>5 Minutes</option>
                  <option value={10}>10 Minutes (Default)</option>
                  <option value={15}>15 Minutes</option>
                </select>
              </div>

              <div className="input-group">
                <label>Reminder Lead Time (Before Scheduled Time)</label>
                <select className="input-field" value={settings.reminderBeforeMinutes} onChange={(e) => setSettings({ ...settings, reminderBeforeMinutes: Number(e.target.value) })}>
                  <option value={0}>At Scheduled Time</option>
                  <option value={5}>5 Minutes Before</option>
                  <option value={10}>10 Minutes Before</option>
                  <option value={15}>15 Minutes Before</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="secondary-btn" onClick={() => setIsSettingsOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn" style={{ flex: 1, justifyContent: 'center', background: '#0d8b72' }}>
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
