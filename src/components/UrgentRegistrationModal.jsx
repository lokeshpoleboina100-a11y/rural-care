import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UrgentRegistrationModal({ isOpen, onClose, onRegisterSuccess }) {
  const navigate = useNavigate();
  const [patientName, setPatientName] = useState('');
  const [sex, setSex] = useState('Male');
  const [estimatedAge, setEstimatedAge] = useState('45');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const urgentPatient = {
      id: `URG-${Math.floor(1000 + Math.random() * 9000)}`,
      name: patientName.trim() || 'Anonymous Urgent Patient',
      sex,
      age: Number(estimatedAge) || 45,
      registeredAt: new Date().toLocaleString(),
      isUrgent: true
    };

    // Store urgent registration in session
    sessionStorage.setItem('ruralcare_urgent_patient', JSON.stringify(urgentPatient));

    setTimeout(() => {
      setIsSubmitting(false);
      if (onRegisterSuccess) onRegisterSuccess(urgentPatient);
      onClose();
      navigate('/assessment');
    }, 400);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#ffffff', borderRadius: '20px', maxWidth: '460px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#fef2f2', color: '#dc2626', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Urgent Registration</h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Fast-track triage intake for immediate assessment</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Name (optional)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Full Patient Name or leave blank"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Sex *</label>
              <select className="input-field" value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Select</option>
              </select>
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px', display: 'block' }}>Estimated Age (years) *</label>
              <input
                type="number"
                min="0"
                max="120"
                required
                className="input-field"
                value={estimatedAge}
                onChange={(e) => setEstimatedAge(e.target.value)}
              />
            </div>
          </div>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', marginBottom: '20px', fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <AlertCircle size={16} color="#0d8b72" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>Select to register or record symptoms of this patient for AI Triage Assessment & Doctor Handoff.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="primary-btn"
            style={{ width: '100%', padding: '12px', justifyContent: 'center', background: '#dc2626', color: '#ffffff', fontSize: '14px', borderRadius: '12px', fontWeight: 800 }}
          >
            {isSubmitting ? 'Registering Urgent Record...' : 'Register & Record Symptoms →'}
          </button>
        </form>
      </div>
    </div>
  );
}
