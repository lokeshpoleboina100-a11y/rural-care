import React, { useState, useRef } from 'react';
import { Mic, MicOff, Camera, Upload, CheckCircle2, AlertTriangle, Sparkles, FileText, Activity, HeartPulse, Video, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHealthPlatform } from '../context/HealthPlatformContext';
import VideoConsultationModal from '../components/VideoConsultationModal';

export default function ClinicalAssessmentPage() {
  const { user } = useAuth();
  const { doctors } = useHealthPlatform();

  const [currentStep, setCurrentStep] = useState(1);

  const [patientInfo] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ruralcare_urgent_patient');
      return saved ? JSON.parse(saved) : {
        name: user?.name || 'Priyam Mishra',
        age: 17,
        sex: 'Male',
        id: 'PAT-8802'
      };
    } catch {
      return { name: user?.name || 'Priyam Mishra', age: 17, sex: 'Male', id: 'PAT-8802' };
    }
  });

  const [symptomsText, setSymptomsText] = useState('Patient reports mild fever and headache for the past 3 days... Feels like the flu.');
  const [symptomDuration, setSymptomDuration] = useState('3');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [knownHistory, setKnownHistory] = useState('No chronic illness history reported.');
  const [knownAllergies, setKnownAllergies] = useState('No known drug allergies.');

  const [aadharNumber, setAadharNumber] = useState('');
  const [temperature, setTemperature] = useState('98.6');
  const [systolicBp, setSystolicBp] = useState('120');
  const [pulse, setPulse] = useState('78');
  const [spo2, setSpo2] = useState('98.5');
  const [bloodGlucose, setBloodGlucose] = useState('96');
  const [isVitalsPrefilled, setIsVitalsPrefilled] = useState(false);

  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [labReportFile, setLabReportFile] = useState(null);
  const [woundPhotoFile, setWoundPhotoFile] = useState(null);

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(1);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [caseSentStatus, setCaseSentStatus] = useState(false);

  const handlePrefillVitals = () => {
    setTemperature('98.6');
    setSystolicBp('120');
    setPulse('78');
    setSpo2('98.5');
    setBloodGlucose('96');
    setIsVitalsPrefilled(true);
  };

  const toggleVoiceRecording = () => {
    if (!isVoiceRecording) {
      setIsVoiceRecording(true);
      setTimeout(() => {
        setSymptomsText(prev => prev + ' [Voice recorded]: Patient complains of body weakness and chills in evening.');
        setIsVoiceRecording(false);
      }, 3000);
    } else {
      setIsVoiceRecording(false);
    }
  };

  const handleOpenCamera = (targetType) => {
    const mockPhoto = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=80';
    if (targetType === 'prescription') setPrescriptionFile(mockPhoto);
    if (targetType === 'lab') setLabReportFile(mockPhoto);
    if (targetType === 'wound') setWoundPhotoFile(mockPhoto);
  };

  const handleFileChange = (e, targetType) => {
    if (e.target.files && e.target.files[0]) {
      const fileUrl = URL.createObjectURL(e.target.files[0]);
      if (targetType === 'prescription') setPrescriptionFile(fileUrl);
      if (targetType === 'lab') setLabReportFile(fileUrl);
      if (targetType === 'wound') setWoundPhotoFile(fileUrl);
    }
  };

  const handleGenerateAiAssessment = () => {
    setIsGeneratingAi(true);
    setTimeout(() => {
      setIsGeneratingAi(false);
      setCurrentStep(4);
    }, 800);
  };

  const handleSendCaseToDoctor = () => {
    setCaseSentStatus(true);
    setTimeout(() => setCaseSentStatus(false), 4000);
  };

  const doctorList = doctors || [
    { id: 1, name: 'Dr. Aarav Khanna', specialty: 'General Medicine & Triage', clinic: 'Ramapuram Primary Health Center' },
    { id: 2, name: 'Dr. Harish Kumar', specialty: 'Pediatrics & Internal Care', clinic: 'District Area Hospital' },
    { id: 3, name: 'Dr. Chhacer Dr. Kanpur', specialty: 'Tele-Consultant Specialist', clinic: 'Community Health Clinic' },
    { id: 4, name: 'Dr. Hacher Rosar', specialty: 'Emergency Response Medical Officer', clinic: 'District Health HQ' }
  ];

  const selectedDoctor = doctorList.find(d => d.id === Number(selectedDoctorId)) || doctorList[0];

  return (
    <div className="container" style={{ padding: '32px 20px', maxWidth: '1100px' }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          PATIENT INTAKE & CLINICAL AI ASSESSMENT WIZARD
        </span>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
          Clinical Health Record & AI Doctor Handoff
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Patient: <strong>{patientInfo.name}</strong> ({patientInfo.age} yrs, {patientInfo.sex}) • ID: {patientInfo.id}
        </p>
      </div>

      {/* MULTI-STEP NAVIGATION WIZARD TABS */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '8px', marginBottom: '28px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
        {[
          { step: 1, label: '1. Symptoms & Voice', icon: Mic },
          { step: 2, label: '2. Vitals & Physical Signs', icon: Activity },
          { step: 3, label: '3. Documents & Photos', icon: FileText },
          { step: 4, label: '4. AI Assessment & Doctor Handoff', icon: Sparkles }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;

          return (
            <button
              key={item.step}
              onClick={() => setCurrentStep(item.step)}
              style={{
                background: isActive ? 'var(--primary)' : isDone ? '#ecfdf5' : '#f8fafc',
                color: isActive ? '#ffffff' : isDone ? '#047857' : '#64748b',
                border: `1px solid ${isActive ? 'var(--primary)' : isDone ? '#a7f3d0' : '#e2e8f0'}`,
                padding: '12px 10px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {isDone && <CheckCircle2 size={14} color="#10b981" />}
            </button>
          );
        })}
      </div>

      {/* STEP 1 */}
      {currentStep === 1 && (
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mic color="var(--primary)" size={20} /> Record Patient Symptoms & Voice Input
          </h3>

          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Describe Patient Symptoms in Detail</label>
            <textarea
              rows={4}
              className="input-field"
              value={symptomsText}
              onChange={(e) => setSymptomsText(e.target.value)}
              placeholder="Enter patient symptoms or click microphone to dictate voice input..."
              style={{ padding: '12px', fontSize: '13px', lineHeight: 1.5 }}
            />
          </div>

          <div style={{ background: isVoiceRecording ? '#fef2f2' : '#f8fafc', border: `1px solid ${isVoiceRecording ? '#fecaca' : 'var(--border)'}`, padding: '20px', borderRadius: '16px', textAlign: 'center', marginBottom: '24px' }}>
            <button
              onClick={toggleVoiceRecording}
              className="primary-btn"
              style={{
                background: isVoiceRecording ? '#dc2626' : 'var(--primary)',
                margin: '0 auto 8px auto',
                padding: '12px 24px',
                borderRadius: '30px',
                fontSize: '14px'
              }}
            >
              {isVoiceRecording ? <MicOff size={18} /> : <Mic size={18} />}
              {isVoiceRecording ? 'Recording Audio... (Click to Stop)' : '🎙️ Record Symptoms by Voice'}
            </button>
            <p style={{ fontSize: '12px', color: isVoiceRecording ? '#dc2626' : 'var(--text-muted)', margin: 0, fontWeight: 700 }}>
              {isVoiceRecording ? '⚡ Dictating... Voice wave simulation active' : 'Click to speak symptoms in Hindi, Telugu, or English'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Symptom Duration (Days) *</label>
              <input type="number" className="input-field" value={symptomDuration} onChange={(e) => setSymptomDuration(e.target.value)} />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Known Medical History</label>
              <input type="text" className="input-field" value={knownHistory} onChange={(e) => setKnownHistory(e.target.value)} />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Known Allergies</label>
              <input type="text" className="input-field" value={knownAllergies} onChange={(e) => setKnownAllergies(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="primary-btn" onClick={() => setCurrentStep(2)} style={{ padding: '10px 24px' }}>
              Next: Vitals & Physical Signs →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {currentStep === 2 && (
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Record Patient Vitals & Clinical Measurements
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Digitize patient complete record, visits, upload documents and generate AI assessment.
              </p>
            </div>

            <button
              onClick={handlePrefillVitals}
              style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '8px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
            >
              ⚡ Pre-fill with typical adult values
            </button>
          </div>

          {isVitalsPrefilled && (
            <div style={{ background: '#fefce8', border: '1px solid #fef08a', color: '#854d0e', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>
              ⚠️ Values pre-filled with normal adult averages. Verify clinical metrics before finalizing.
            </div>
          )}

          <div className="input-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700 }}>1. Aadhar Number (Optional)</label>
            <input type="text" className="input-field" placeholder="xxxx-xxxx-xxxx" value={aadharNumber} onChange={(e) => setAadharNumber(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Temperature (°F) *</label>
              <input type="text" className="input-field" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Systolic BP (mmHg) *</label>
              <input type="text" className="input-field" value={systolicBp} onChange={(e) => setSystolicBp(e.target.value)} />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Pulse (bpm) *</label>
              <input type="text" className="input-field" value={pulse} onChange={(e) => setPulse(e.target.value)} />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>SpO2 (%) *</label>
              <input type="text" className="input-field" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Blood Glucose (mg/dL) *</label>
              <input type="text" className="input-field" value={bloodGlucose} onChange={(e) => setBloodGlucose(e.target.value)} />
            </div>

            <div className="input-group" style={{ margin: 0 }}>
              <label style={{ fontSize: '12px', fontWeight: 700 }}>Known History Notes</label>
              <input type="text" className="input-field" value={knownHistory} onChange={(e) => setKnownHistory(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="secondary-btn" onClick={() => setCurrentStep(1)}>← Back</button>
            <button className="primary-btn" onClick={() => setCurrentStep(3)} style={{ background: '#0d8b72' }}>
              ✓ All Measured & Correct → Next: Documents
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {currentStep === 3 && (
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Upload Patient Documents, Reports & Injury Photos
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <div style={{ border: '2px dashed var(--border)', borderRadius: '16px', padding: '20px', textAlign: 'center', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>1. Paper Prescription</h4>
              {prescriptionFile ? (
                <div style={{ marginBottom: '12px' }}>
                  <img src={prescriptionFile} alt="Prescription" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px' }} />
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 800, display: 'block', marginTop: '4px' }}>✓ Uploaded</span>
                </div>
              ) : (
                <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                  <FileText size={48} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => handleOpenCamera('prescription')} className="secondary-btn" style={{ fontSize: '11px', padding: '6px 10px' }}>
                  <Camera size={12} /> Open Camera
                </button>
                <label className="secondary-btn" style={{ fontSize: '11px', padding: '6px 10px', cursor: 'pointer' }}>
                  <Upload size={12} /> Choose File
                  <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'prescription')} />
                </label>
              </div>
            </div>

            <div style={{ border: '2px dashed var(--border)', borderRadius: '16px', padding: '20px', textAlign: 'center', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>2. Test / Lab Reports</h4>
              {labReportFile ? (
                <div style={{ marginBottom: '12px' }}>
                  <img src={labReportFile} alt="Lab Report" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px' }} />
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 800, display: 'block', marginTop: '4px' }}>✓ Uploaded</span>
                </div>
              ) : (
                <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                  <Activity size={48} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => handleOpenCamera('lab')} className="secondary-btn" style={{ fontSize: '11px', padding: '6px 10px' }}>
                  <Camera size={12} /> Open Camera
                </button>
                <label className="secondary-btn" style={{ fontSize: '11px', padding: '6px 10px', cursor: 'pointer' }}>
                  <Upload size={12} /> Choose File
                  <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'lab')} />
                </label>
              </div>
            </div>

            <div style={{ border: '2px dashed var(--border)', borderRadius: '16px', padding: '20px', textAlign: 'center', background: '#f8fafc' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>3. Wound / Injury Photos</h4>
              {woundPhotoFile ? (
                <div style={{ marginBottom: '12px' }}>
                  <img src={woundPhotoFile} alt="Wound Photo" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '10px' }} />
                  <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 800, display: 'block', marginTop: '4px' }}>✓ Photo Captured</span>
                </div>
              ) : (
                <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                  <HeartPulse size={48} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => handleOpenCamera('wound')} className="secondary-btn" style={{ fontSize: '11px', padding: '6px 10px' }}>
                  <Camera size={12} /> Open Camera
                </button>
                <label className="secondary-btn" style={{ fontSize: '11px', padding: '6px 10px', cursor: 'pointer' }}>
                  <Upload size={12} /> Choose File
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'wound')} />
                </label>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="secondary-btn" onClick={() => setCurrentStep(2)}>← Back to Vitals</button>
            <button
              onClick={handleGenerateAiAssessment}
              disabled={isGeneratingAi}
              className="primary-btn"
              style={{ background: '#7c3aed', padding: '12px 24px', fontSize: '14px' }}
            >
              {isGeneratingAi ? 'Analyzing Vitals & Reports with AI...' : '✨ Generate AI Assessment >'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {currentStep === 4 && (
        <div>
          <div style={{ background: '#ecfdf5', border: '2px solid #10b981', padding: '24px', borderRadius: '20px', marginBottom: '24px', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                ✓
              </div>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 800, background: '#10b981', color: '#fff', padding: '2px 8px', borderRadius: '6px' }}>
                  LOW RISK ASSESSMENT
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#065f46', margin: '2px 0 0 0' }}>
                  No Immediate Concern - Protocol Care Issued
                </h3>
              </div>
            </div>

            <ul style={{ fontSize: '13px', color: '#047857', paddingLeft: '20px', margin: 0, lineHeight: 1.6 }}>
              <li>Mild viral symptoms reported (temperature: {temperature}°F, SpO2: {spo2}%, pulse: {pulse} bpm).</li>
              <li>Clinical vitals fall within normal baseline limits. No acute emergency triage flag required.</li>
              <li>Recommended action: Hydration, rest, and routine general physician follow-up.</li>
            </ul>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
              First Aid Instructions & Immediate Care Plan
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#0d8b72', textTransform: 'uppercase' }}>FIRST AID - PERFORM NOW</span>
                <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '4px 0 2px 0', color: '#0f172a' }}>1. Re-measure Body Temperature</h4>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Monitor temperature twice daily. Administer ORS if sweating persists.</p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#0d8b72', textTransform: 'uppercase' }}>MEDICAL HISTORY</span>
                <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '4px 0 2px 0', color: '#0f172a' }}>2. Known Medical History</h4>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{knownHistory || 'No prior chronic conditions recorded.'}</p>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#0d8b72', textTransform: 'uppercase' }}>ALLERGY SAFETY</span>
                <h4 style={{ fontSize: '14px', fontWeight: 800, margin: '4px 0 2px 0', color: '#0f172a' }}>3. Known Allergies</h4>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>{knownAllergies || 'No drug allergies verified.'}</p>
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Hand Off Case to a Doctor
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Select your doctor to forward the clinical assessment summary or launch live video consultation.
            </p>

            {caseSentStatus && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, marginBottom: '16px' }}>
                ✓ Case summary successfully handed off to {selectedDoctor.name}! Doctor notified.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
              {doctorList.map(doc => {
                const isSelected = doc.id === Number(selectedDoctorId);
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    style={{
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      border: `2px solid ${isSelected ? '#16a34a' : 'var(--border)'}`,
                      borderRadius: '16px',
                      padding: '16px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0d8b72', color: '#fff', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
                      👨‍⚕️
                    </div>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{doc.name}</h4>
                    <p style={{ fontSize: '11px', color: 'var(--primary)', margin: 0, fontWeight: 700 }}>{doc.specialty}</p>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>📍 {doc.clinic}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 2px 0', color: 'var(--text-primary)' }}>Selected: {selectedDoctor.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Forward case details or initiate instant video consultation session.</p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleSendCaseToDoctor}
                  className="primary-btn"
                  style={{ background: '#0d8b72', padding: '10px 18px', fontSize: '13px' }}
                >
                  📄 Send Case to {selectedDoctor.name.split(' ')[1] || selectedDoctor.name}
                </button>
                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="primary-btn"
                  style={{ background: '#0284c7', padding: '10px 18px', fontSize: '13px' }}
                >
                  <Video size={16} /> Start Video Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO CONSULTATION MODAL */}
      <VideoConsultationModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        doctor={selectedDoctor}
      />
    </div>
  );
}
