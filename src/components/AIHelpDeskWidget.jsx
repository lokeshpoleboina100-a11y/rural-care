import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, PhoneCall, Mic, MicOff, Camera, Upload, Trash2, RefreshCw, Eye, CheckCircle2, AlertTriangle, Info, ChevronDown, ChevronUp, Layers, Calendar, Hospital } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeMedicalImage } from '../utils/cnnMedicalModel';
import { useHealthPlatform } from '../context/HealthPlatformContext';
import { recommendDoctorAndSlot } from '../utils/aiAllocationEngine';

export default function AIHelpDeskWidget({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { doctors } = useHealthPlatform();

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! 🙏 Welcome to the RuralCare 24/7 AI Health Assistant with MobileNetV3 CNN Medical Image Screening. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Image Upload & Analysis State
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [qualityError, setQualityError] = useState(null);
  const [showGradCam, setShowGradCam] = useState(true);
  const [showAugmentations, setShowAugmentations] = useState(false);
  const [showCnnHowItWorks, setShowCnnHowItWorks] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'image'

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, analysisResult]);

  if (!isOpen) return null;

  // Speech Recognition (Voice Input)
  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser version. Please type your message.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  // Image File Handling
  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      alert('Please upload a valid image format (JPG, JPEG, PNG, or WEBP).');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setQualityError(null);
    setAnalysisResult(null);
    setActiveTab('image');
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setQualityError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Run CNN Image Analysis
  const handleRunCNNAnalysis = async () => {
    if (!selectedImage && !imagePreview) return;

    setIsAnalyzingImage(true);
    setQualityError(null);
    setAnalysisResult(null);

    try {
      const result = await analyzeMedicalImage(selectedImage || imagePreview, input);

      if (!result.success) {
        setQualityError(result.error);
        setIsAnalyzingImage(false);
        return;
      }

      // Recommend Doctor & Slot based on CNN department
      const doctorRec = recommendDoctorAndSlot({
        doctorsList: doctors || [],
        department: result.screeningResult.department,
        urgency: result.screeningResult.urgency
      });

      setAnalysisResult({
        ...result,
        doctorRec
      });

      // Also append to chat transcript
      const aiResponseText = `📷 CNN Medical Image Analysis Complete:\n• Possible Category: ${result.screeningResult.category}\n• Confidence: ${result.screeningResult.confidence}\n• Recommended Dept: ${result.screeningResult.department}\n\n⚠️ ${result.disclaimer}`;

      setMessages(prev => [
        ...prev,
        {
          sender: 'user',
          text: `[Uploaded Health Photo] ${input ? `Symptoms: "${input}"` : ''}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: 'ai',
          text: aiResponseText,
          action: {
            label: `Book ${result.screeningResult.department} Doctor`,
            route: '/appointments'
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

    } catch (err) {
      console.error('CNN Analysis error:', err);
      setQualityError('Failed to analyze image. Please try uploading a clearer image.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const quickPills = [
    { label: '📷 Analyze Skin Rash', query: 'I have an itchy skin rash' },
    { label: '🤒 High Fever Triage', query: 'I have high fever and body ache' },
    { label: '👁️ Red Eye Screening', query: 'Eye redness and irritation' },
    { label: '🐍 Snakebite First-Aid', query: 'Emergency snakebite advice' },
    { label: '🏥 Nearest Hospital', query: 'Find nearest primary health center' }
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || input;

    // If an image is attached, run CNN analysis with the text
    if (selectedImage || imagePreview) {
      handleRunCNNAnalysis();
      return;
    }

    if (!query.trim()) return;

    const userMsg = {
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const q = query.toLowerCase();
      let response;

      if (q.includes('snake') || q.includes('bite') || q.includes('chest pain') || q.includes('bleed')) {
        response = {
          text: `🚨 EMERGENCY TRIAGE WARNING:\n1. Stay calm and lower the affected area below heart level.\n2. Do NOT cut the wound or try to suck venom.\n3. Call 108 Emergency immediately for Anti-Snake Venom (ASV).\n\n⚠️ AI guidance is for informational purposes only.`,
          action: { label: 'Call 108 Emergency Ambulance', link: 'tel:108', isCall: true }
        };
      } else if (q.includes('skin') || q.includes('rash') || q.includes('spot') || q.includes('itch')) {
        response = {
          text: `📷 Visible Skin Condition Detected in query:\nUpload a photo of the affected area using the "📷 Upload Health Image" tab for CNN Image Screening.\n\nRecommended Dept: Dermatology`,
          action: { label: 'Use CNN Image Analysis', switchTab: 'image' }
        };
      } else if (q.includes('fever') || q.includes('cough') || q.includes('cold')) {
        response = {
          text: `🩺 Fever & Symptom Triage:\n• Rest and drink plenty of clean fluids (ORS, boiled water).\n• Monitor temperature with a thermometer.\n• If fever exceeds 102°F or lasts > 3 days, consult our AI Doctor Slot Allocator.\n\n⚠️ AI guidance is for informational purposes only.`,
          action: { label: 'Run AI Doctor & Slot Allocation', route: '/appointments' }
        };
      } else {
        response = {
          text: `RuralCare AI Multi-Modal Triage:\nI can assist you with text symptoms, voice queries, or 📷 CNN photo analysis for skin/eye/oral conditions.\n\n⚠️ AI guidance is for informational screening only.`,
          action: { label: 'Book Doctor Appointment', route: '/appointments' }
        };
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: response.text,
        action: response.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="ai-chat-modal" style={{ width: '420px', height: '620px' }}>
      {/* Header */}
      <div className="ai-chat-header">
        <div className="ai-chat-header-title">
          <div className="ai-header-icon">
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <h4>RuralCare AI Help Desk</h4>
            <p>24/7 Smart Health Assistant & CNN Vision</p>
          </div>
        </div>
        <button className="ai-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* Input Mode Navigation Tabs */}
      <div style={{ display: 'flex', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '4px' }}>
        <button
          onClick={() => setActiveTab('chat')}
          style={{ flex: 1, padding: '6px 12px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: activeTab === 'chat' ? '#ffffff' : 'transparent', color: activeTab === 'chat' ? '#0d8b72' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          💬 Text & Voice Assistant
        </button>
        <button
          onClick={() => setActiveTab('image')}
          style={{ flex: 1, padding: '6px 12px', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, background: activeTab === 'image' ? '#ffffff' : 'transparent', color: activeTab === 'image' ? '#9333ea' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          📷 CNN Image Analysis
        </button>
      </div>

      {/* Main Body Content */}
      <div className="ai-chat-body" style={{ flex: 1, padding: '14px', overflowY: 'auto' }}>
        {activeTab === 'image' ? (
          <div>
            {/* Image Selection / Camera Upload Card */}
            <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '14px', padding: '16px', textAlign: 'center', marginBottom: '14px' }}>
              {!imagePreview ? (
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
                    <Camera size={24} />
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>Analyze a Health Image</h4>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 14px 0' }}>
                    Upload a clear photo of skin rash, eye redness, or visible irritation for AI MobileNetV3 CNN screening.
                  </p>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleImageFileSelect}
                  />

                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    capture="environment"
                    style={{ display: 'none' }}
                    onChange={handleImageFileSelect}
                  />

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="primary-btn"
                      style={{ background: '#9333ea', color: '#ffffff', fontSize: '12px', padding: '8px 14px', borderRadius: '8px' }}
                    >
                      📷 Take Photo
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="secondary-btn"
                      style={{ color: '#475569', fontSize: '12px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      📁 Upload Image
                    </button>
                  </div>

                  <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginTop: '10px' }}>
                    Supported: JPG, JPEG, PNG, WEBP
                  </span>
                </div>
              ) : (
                <div>
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                    <img
                      src={imagePreview}
                      alt="Health issue preview"
                      style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #e2e8f0' }}
                    />
                    <button
                      onClick={handleClearImage}
                      style={{ position: 'absolute', top: '6px', right: '6px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={handleRunCNNAnalysis}
                      disabled={isAnalyzingImage}
                      className="primary-btn"
                      style={{ background: '#9333ea', color: '#ffffff', fontSize: '12px', padding: '8px 16px', borderRadius: '8px', flex: 1 }}
                    >
                      {isAnalyzingImage ? 'Analyzing CNN Vision...' : '⚡ Submit Image for CNN Analysis'}
                    </button>
                    <button
                      onClick={handleClearImage}
                      className="secondary-btn"
                      style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', color: '#64748b' }}
                    >
                      <Trash2 size={14} /> Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quality Check Error Banner */}
            {qualityError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px', marginBottom: '14px', color: '#991b1b', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '4px' }}>
                  <AlertTriangle size={16} color="#dc2626" /> Image Quality Issue Detected
                </div>
                <p style={{ margin: '0 0 10px 0' }}>"{qualityError}"</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                >
                  <RefreshCw size={12} style={{ display: 'inline', marginRight: '4px' }} /> Upload Another Image
                </button>
              </div>
            )}

            {/* CNN Analysis Result Section */}
            {analysisResult && analysisResult.success && (
              <div style={{ background: '#ffffff', border: '1px solid #e9d5ff', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(147, 51, 234, 0.08)' }}>
                {/* Emergency Override Header */}
                {analysisResult.screeningResult.isEmergency ? (
                  <div style={{ background: '#dc2626', color: '#fff', padding: '12px', borderRadius: '10px', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 800, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🚨 Seek Immediate Medical Attention
                    </div>
                    <p style={{ fontSize: '11px', margin: '4px 0 8px 0', opacity: 0.9 }}>
                      Critical trauma or emergency visual pattern detected. Normal booking overridden.
                    </p>
                    <a href="tel:108" className="primary-btn" style={{ background: '#ffffff', color: '#dc2626', width: '100%', justifyContent: 'center', fontSize: '12px' }}>
                      <PhoneCall size={14} /> Call 108 Emergency Ambulance
                    </a>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3e8ff', paddingBottom: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#9333ea', background: '#faf5ff', padding: '3px 8px', borderRadius: '6px' }}>
                      ✓ MobileNetV3 CNN Analysis Complete
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b21a8' }}>
                      Confidence: <strong>{analysisResult.screeningResult.confidence}</strong>
                    </span>
                  </div>
                )}

                {/* Screening Findings */}
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                    Possible Condition Category:
                  </h4>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#6b21a8', margin: 0 }}>
                    {analysisResult.screeningResult.category}
                  </p>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0', italic: 'true' }}>
                    {analysisResult.screeningResult.triageNote}
                  </p>
                </div>

                {/* Pattern Breakdown */}
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                    Supported Pattern Likelihoods:
                  </span>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0 0' }}>
                    {analysisResult.screeningResult.topPatterns.map((pt, i) => (
                      <li key={i} style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: i < 2 ? '1px dashed #e2e8f0' : 'none' }}>
                        <span>{i + 1}. {pt.pattern}</span>
                        <span style={{ fontWeight: 700, color: '#9333ea' }}>{pt.likelihood}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Grad-CAM Attention Heatmap Visualizer */}
                <div style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => setShowGradCam(!showGradCam)}
                    style={{ background: '#faf5ff', border: '1px solid #e9d5ff', color: '#6b21a8', width: '100%', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <span>🎯 Grad-CAM AI Attention Area</span>
                    {showGradCam ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {showGradCam && (
                    <div style={{ marginTop: '8px', textAlign: 'center', background: '#0f172a', padding: '8px', borderRadius: '10px', color: '#fff' }}>
                      <img
                        src={analysisResult.gradCamDataUrl}
                        alt="Grad-CAM Activation Heatmap"
                        style={{ width: '100%', maxHeight: '160px', objectFit: 'contain', borderRadius: '6px' }}
                      />
                      <p style={{ fontSize: '10px', color: '#cbd5e1', margin: '6px 0 0 0', lineHeight: 1.3 }}>
                        <strong>AI Attention Area:</strong> Red/Yellow heatmap overlay highlights visual region influencing CNN prediction. <em>Not a medical diagnosis.</em>
                      </p>
                    </div>
                  )}
                </div>

                {/* Training Augmentation Visualizer (Academic) */}
                <div style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => setShowAugmentations(!showAugmentations)}
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', width: '100%', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <span>🔄 AI Image Variations / Training Augmentations</span>
                    {showAugmentations ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {showAugmentations && (
                    <div style={{ marginTop: '8px', background: '#f1f5f9', padding: '10px', borderRadius: '10px' }}>
                      <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 8px 0', fontWeight: 700 }}>
                        Demonstrating model robustness transformations (Rotation, Zoom, Brightness, Contrast):
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {analysisResult.augmentations.map((aug, idx) => (
                          <div key={idx} style={{ background: '#fff', padding: '4px', borderRadius: '6px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                            <img src={aug.dataUrl} alt={aug.title} style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                            <span style={{ fontSize: '9px', color: '#475569', fontWeight: 700 }}>{aug.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Smart Doctor Recommendation & Allocation Card */}
                {analysisResult.doctorRec && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                      Smart Healthcare Allocation Match:
                    </span>
                    <div style={{ marginTop: '6px', fontSize: '12px', color: '#14532d' }}>
                      <strong>Department:</strong> {analysisResult.screeningResult.department}<br />
                      <strong>Recommended Doctor:</strong> {analysisResult.doctorRec.recommendedDoctor.name} ({analysisResult.doctorRec.recommendedDoctor.specialty})<br />
                      <strong>Facility:</strong> {analysisResult.doctorRec.recommendedHospital}<br />
                      <strong>Best Available Slot:</strong> <span style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>Tomorrow — {analysisResult.doctorRec.bestSlot}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                      <button
                        className="primary-btn"
                        style={{ flex: 1, background: '#16a34a', fontSize: '11px', padding: '8px', justifyContent: 'center' }}
                        onClick={() => { onClose(); navigate('/appointments'); }}
                      >
                        <Calendar size={12} /> Book Appointment
                      </button>
                      <button
                        className="secondary-btn"
                        style={{ background: '#ffffff', color: '#166534', border: '1px solid #86efac', fontSize: '11px', padding: '8px' }}
                        onClick={() => { onClose(); navigate('/citizen'); }}
                      >
                        <Hospital size={12} /> Find Hospital
                      </button>
                    </div>
                  </div>
                )}

                {/* How CNN Works Academic Accordion */}
                <div>
                  <button
                    onClick={() => setShowCnnHowItWorks(!showCnnHowItWorks)}
                    style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline', padding: 0 }}
                  >
                    <Info size={12} /> How CNN Medical Image Analysis Works
                  </button>

                  {showCnnHowItWorks && (
                    <div style={{ marginTop: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', fontSize: '10px', color: '#475569', lineHeight: 1.4 }}>
                      <strong>MobileNetV3 Pipeline:</strong> Input Image ➔ Resized to 224x224 RGB Tensor ➔ Depthwise Separable Convolution (Pattern extraction) ➔ Max Pooling (Dimensionality reduction) ➔ Deep Feature Map ➔ Softmax Classification ➔ Grad-CAM Activation Overlay.
                    </div>
                  )}
                </div>

                {/* Mandatory Medical & Privacy Disclaimer */}
                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f3e8ff', fontSize: '10px', color: '#94a3b8', lineHeight: 1.3 }}>
                  🔒 <em>Privacy Protected: Image processed locally in memory. AI image analysis provides screening support only. It does not provide a definitive diagnosis or replace examination by a qualified physician.</em>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Text & Voice Chat transcript */
          <div>
            {messages.map((m, idx) => (
              <div key={idx} className={`msg-bubble ${m.sender === 'user' ? 'msg-user' : 'msg-ai'}`}>
                <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{m.text}</p>
                {m.action && (
                  <div style={{ marginTop: '10px' }}>
                    {m.action.isCall ? (
                      <a href={m.action.link} className="pill-btn" style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}>
                        <PhoneCall size={12} /> {m.action.label}
                      </a>
                    ) : m.action.switchTab ? (
                      <button className="pill-btn" style={{ background: '#9333ea', color: '#fff', borderColor: '#9333ea' }} onClick={() => setActiveTab(m.action.switchTab)}>
                        {m.action.label} →
                      </button>
                    ) : (
                      <button className="pill-btn" style={{ background: '#0d8b72', color: '#fff', borderColor: '#0d8b72' }} onClick={() => { onClose(); navigate(m.action.route); }}>
                        {m.action.label} →
                      </button>
                    )}
                  </div>
                )}
                <span style={{ display: 'block', fontSize: '9px', opacity: 0.6, marginTop: '4px', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="msg-bubble msg-ai" style={{ fontSize: '11px', color: '#64748b' }}>
                AI thinking & running triage...
              </div>
            )}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Pills */}
      <div style={{ padding: '8px 14px', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
        <div className="quick-pills">
          {quickPills.map((p, i) => (
            <button key={i} className="pill-btn" onClick={() => handleSend(p.query)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="ai-chat-footer">
        <button
          onClick={handleVoiceInput}
          style={{ background: isListening ? '#dc2626' : '#f1f5f9', color: isListening ? '#fff' : '#475569', border: '1px solid var(--border)', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Voice Input"
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <button
          onClick={() => {
            setActiveTab('image');
            fileInputRef.current?.click();
          }}
          style={{ background: selectedImage ? '#f3e8ff' : '#f1f5f9', color: selectedImage ? '#9333ea' : '#475569', border: '1px solid var(--border)', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Upload or Take Photo"
        >
          <Camera size={16} />
        </button>

        <input
          type="text"
          className="ai-chat-input"
          placeholder={isListening ? "Listening... Speak now" : selectedImage ? "Add optional symptoms..." : "Describe problem or upload photo..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />

        <button className="ai-chat-send" onClick={() => handleSend()}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
