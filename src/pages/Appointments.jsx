import React, { useState } from 'react';
import { Calendar, Clock, User, Stethoscope, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Appointments() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState('Dr. S. Reddy - General Physician');
  const [date, setDate] = useState('2026-09-15');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const doctors = [
    'Dr. S. Reddy - General Physician (PHC Ramapuram)',
    'Dr. Kavitha M. - Gynecologist & Maternity Care',
    'Dr. Anjaneyulu - Pediatrics & Child Specialist',
    'Dr. V. Rao - Community Health Officer'
  ];

  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:30 AM - 12:30 PM',
    '02:00 PM - 03:00 PM',
    '03:30 PM - 04:30 PM'
  ];

  const handleBook = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlignment: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>Book Rural Doctor Consultation</h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>Schedule a visit with visiting doctors, PHC physicians, or tele-consultants.</p>
      </div>

      {submitted ? (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '32px', borderRadius: '20px', textAlign: 'center' }}>
          <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#065f46', marginBottom: '8px' }}>Appointment Confirmed!</h2>
          <p style={{ color: '#047857', fontSize: '15px', marginBottom: '24px' }}>
            Your appointment with <strong>{doctor}</strong> is scheduled for <strong>{date}</strong> at <strong>{timeSlot}</strong>.
          </p>
          <button className="primary-btn" onClick={() => setSubmitted(false)}>Book Another Appointment</button>
        </div>
      ) : (
        <form onSubmit={handleBook} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div className="input-group">
            <label>Select Healthcare Doctor / Clinic</label>
            <select className="input-field" value={doctor} onChange={(e) => setDoctor(e.target.value)}>
              {doctors.map((d, i) => <option key={i} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>Preferred Date</label>
              <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="input-group">
              <label>Time Slot</label>
              <select className="input-field" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                {timeSlots.map((t, i) => <option key={i} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Reason for Visit / Symptoms Description</label>
            <textarea
              className="input-field"
              style={{ height: '100px', paddingTop: '12px', resize: 'vertical' }}
              placeholder="e.g. Fever for 2 days, joint pain, blood pressure check..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="primary-btn" style={{ width: '100%', justifyContent: 'center' }}>
            Confirm & Book Appointment Slot
          </button>
        </form>
      )}
    </div>
  );
}
