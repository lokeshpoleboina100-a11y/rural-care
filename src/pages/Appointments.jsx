import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Stethoscope, CheckCircle2, AlertCircle, Video, MapPin, Plus, FileText, X, ChevronRight, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Appointments() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('book'); // 'book' | 'my-appointments'

  // Form states
  const [selectedDoctor, setSelectedDoctor] = useState(1);
  const [consultType, setConsultType] = useState('in-person'); // 'in-person' | 'telemedicine'
  const [date, setDate] = useState('2026-09-15');
  const [selectedSlot, setSelectedSlot] = useState('10:00 AM');
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [reason, setReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Persistent list of appointments stored in localStorage
  const [myAppointments, setMyAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('ruralcare_user_appointments');
      return saved ? JSON.parse(saved) : [
        {
          id: 'APT-801',
          doctorName: 'Dr. S. Reddy',
          specialty: 'General Physician',
          clinic: 'Ramapuram Primary Health Center (PHC)',
          date: '2026-09-15',
          timeSlot: '10:00 AM',
          consultType: 'in-person',
          patientName: user?.name || 'Ramesh Kumar',
          reason: 'Routine Health Checkup & Blood Pressure Check',
          status: 'Confirmed',
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

  useEffect(() => {
    if (user?.name) setPatientName(user.name);
    if (user?.phone) setPatientPhone(user.phone);
  }, [user]);

  const doctorsList = [
    {
      id: 1,
      name: 'Dr. S. Reddy',
      specialty: 'General Physician & Triage Specialist',
      clinic: 'Ramapuram Primary Health Center (PHC)',
      experience: '12 yrs exp',
      availableDays: 'Mon - Sat',
      avatarColor: '#0d8b72'
    },
    {
      id: 2,
      name: 'Dr. Kavitha M.',
      specialty: 'Gynecologist & Maternal Health',
      clinic: 'District General Hospital & CHC',
      experience: '9 yrs exp',
      availableDays: 'Tue, Thu, Sat',
      avatarColor: '#9333ea'
    },
    {
      id: 3,
      name: 'Dr. Anjaneyulu',
      specialty: 'Pediatrician & Child Specialist',
      clinic: 'Community Health Clinic #4',
      experience: '15 yrs exp',
      availableDays: 'Mon, Wed, Fri',
      avatarColor: '#0284c7'
    },
    {
      id: 4,
      name: 'Dr. V. Rao',
      specialty: 'Community Health Officer & Tele-consultant',
      clinic: 'District Tele-Medicine Center',
      experience: '10 yrs exp',
      availableDays: 'Mon - Sun (24/7)',
      avatarColor: '#16a34a'
    }
  ];

  const timeSlotsList = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:30 AM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      alert('Please enter a brief reason or symptoms for your visit.');
      return;
    }

    const doc = doctorsList.find(d => d.id === Number(selectedDoctor)) || doctorsList[0];

    const newAppointment = {
      id: `APT-${Math.floor(100 + Math.random() * 900)}`,
      doctorName: doc.name,
      specialty: doc.specialty,
      clinic: doc.clinic,
      date,
      timeSlot: selectedSlot,
      consultType,
      patientName: patientName.trim() || 'Citizen',
      patientPhone: patientPhone.trim() || '9876543210',
      reason: reason.trim(),
      status: 'Confirmed',
      createdAt: new Date().toLocaleDateString()
    };

    setMyAppointments(prev => [newAppointment, ...prev]);
    setBookingSuccess(newAppointment);
    setReason('');
  };

  const handleCancelAppointment = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setMyAppointments(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="container" style={{ padding: '36px 24px', maxWidth: '1000px' }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '6px', display: 'block' }}>
          RURALCARE CONSULTATION PORTAL
        </span>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Book & Manage Doctor Appointments
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>
          Schedule in-person clinic visits with visiting PHC doctors or request 24/7 video tele-consultations from your home.
        </p>
      </div>

      {/* TABS SELECTOR */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
        <div className="role-selector" style={{ maxWidth: '400px', width: '100%' }}>
          <button
            type="button"
            className={`role-option ${activeTab === 'book' ? 'active' : ''}`}
            onClick={() => { setActiveTab('book'); setBookingSuccess(null); }}
          >
            <Plus size={16} /> Book Appointment
          </button>
          <button
            type="button"
            className={`role-option ${activeTab === 'my-appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-appointments')}
          >
            <Calendar size={16} /> My Bookings ({myAppointments.length})
          </button>
        </div>
      </div>

      {/* TAB 1: BOOKING FORM */}
      {activeTab === 'book' && (
        <>
          {bookingSuccess ? (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '36px 28px', borderRadius: '20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '60px', height: '60px', background: '#10b981', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#065f46', marginBottom: '8px' }}>Appointment Successfully Booked!</h2>
              <p style={{ color: '#047857', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                Appointment ID: <strong>{bookingSuccess.id}</strong><br />
                Doctor: <strong>{bookingSuccess.doctorName}</strong> ({bookingSuccess.specialty})<br />
                Date & Time: <strong>{bookingSuccess.date} at {bookingSuccess.timeSlot}</strong><br />
                Mode: <strong>{bookingSuccess.consultType === 'in-person' ? '🏥 In-Person Clinic Visit' : '📹 Tele-Medicine Video Call'}</strong>
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="primary-btn" onClick={() => setActiveTab('my-appointments')}>
                  View All My Appointments →
                </button>
                <button className="secondary-btn" style={{ color: '#334155', borderColor: '#cbd5e1' }} onClick={() => setBookingSuccess(null)}>
                  Book Another Slot
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '32px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)' }}>
              
              {/* CONSULTATION TYPE */}
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: 800 }}>1. Select Consultation Mode</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  <div
                    onClick={() => setConsultType('in-person')}
                    style={{
                      border: consultType === 'in-person' ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: consultType === 'in-person' ? 'var(--primary-light)' : '#ffffff',
                      padding: '14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ background: consultType === 'in-person' ? 'var(--primary)' : '#f1f5f9', color: consultType === 'in-person' ? '#fff' : '#64748b', padding: '8px', borderRadius: '8px' }}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>In-Person Clinic Visit</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Visit Doctor at PHC / CHC</p>
                    </div>
                  </div>

                  <div
                    onClick={() => setConsultType('telemedicine')}
                    style={{
                      border: consultType === 'telemedicine' ? '2px solid #0284c7' : '1px solid var(--border)',
                      background: consultType === 'telemedicine' ? '#e0f2fe' : '#ffffff',
                      padding: '14px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ background: consultType === 'telemedicine' ? '#0284c7' : '#f1f5f9', color: consultType === 'telemedicine' ? '#fff' : '#64748b', padding: '8px', borderRadius: '8px' }}>
                      <Video size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 800, margin: 0 }}>Tele-Medicine Video Call</h4>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Consult from Home via Phone</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SELECT DOCTOR */}
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: 800 }}>2. Select Doctor & Specialty</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '8px' }}>
                  {doctorsList.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc.id)}
                      style={{
                        border: selectedDoctor === doc.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: selectedDoctor === doc.id ? 'var(--primary-light)' : '#ffffff',
                        padding: '14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: doc.avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                          {doc.name.charAt(4) || 'D'}
                        </div>
                        <div>
                          <h4 style={{ fontSize: '13px', fontWeight: 800, margin: 0 }}>{doc.name}</h4>
                          <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 700 }}>{doc.experience}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px 0', fontWeight: 600 }}>{doc.specialty}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>📍 {doc.clinic}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DATE & TIME SLOT */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 800 }}>3. Select Consultation Date</label>
                  <input
                    type="date"
                    className="input-field"
                    style={{ marginTop: '8px' }}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label style={{ fontSize: '13px', fontWeight: 800 }}>4. Select Time Slot</label>
                  <select
                    className="input-field"
                    style={{ marginTop: '8px' }}
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                  >
                    {timeSlotsList.map((slot, i) => (
                      <option key={i} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PATIENT DETAILS & REASON */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div className="input-group">
                  <label>Patient Full Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter patient name"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Patient Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="9876543210"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label>Symptoms / Reason for Doctor Visit</label>
                <textarea
                  className="input-field"
                  style={{ height: '90px', paddingTop: '10px', resize: 'vertical' }}
                  placeholder="e.g. High fever for 2 days, chest congestion, BP check, routine checkup..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="primary-btn" style={{ width: '100%', height: '48px', justifyContent: 'center', fontSize: '15px' }}>
                Confirm & Schedule Appointment Slot
              </button>
            </form>
          )}
        </>
      )}

      {/* TAB 2: MY BOOKED APPOINTMENTS */}
      {activeTab === 'my-appointments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {myAppointments.length === 0 ? (
            <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px 24px', textAlign: 'center' }}>
              <Calendar size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>No Appointments Booked Yet</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>You haven't scheduled any doctor visits yet.</p>
              <button className="primary-btn" onClick={() => setActiveTab('book')}>
                Book Your First Appointment Slot →
              </button>
            </div>
          ) : (
            myAppointments.map((apt) => (
              <div key={apt.id} style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '8px' }}>
                      {apt.id}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 800, background: apt.consultType === 'in-person' ? '#ecfdf5' : '#e0f2fe', color: apt.consultType === 'in-person' ? '#047857' : '#0369a1', padding: '3px 8px', borderRadius: '8px' }}>
                      {apt.consultType === 'in-person' ? '🏥 In-Person Clinic Visit' : '📹 Tele-Medicine Video Call'}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '8px' }}>
                      ● {apt.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {apt.doctorName} <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>({apt.specialty})</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    📍 {apt.clinic}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 700 }}>
                    📅 Date: {apt.date} at ⏰ {apt.timeSlot} (Patient: {apt.patientName})
                  </p>
                  {apt.reason && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                      Note: "{apt.reason}"
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => alert(`Appointment Slip for ${apt.id}\nPatient: ${apt.patientName}\nDoctor: ${apt.doctorName}\nDate: ${apt.date} at ${apt.timeSlot}\nLocation: ${apt.clinic}`)}
                    className="login-btn"
                    style={{ fontSize: '12px', padding: '8px 14px' }}
                  >
                    <FileText size={14} /> Download Slip
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(apt.id)}
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
