import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, PhoneCall, Mic, MicOff, Camera, Upload, Trash2, RefreshCw, Eye, CheckCircle2, AlertTriangle, Info, ChevronDown, ChevronUp, Layers, Calendar, Hospital, ShieldCheck, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { analyzeMedicalImage } from '../utils/cnnMedicalModel';
import { useHealthPlatform } from '../context/HealthPlatformContext';
import { recommendDoctorAndSlot } from '../utils/aiAllocationEngine';

export default function AIHelpDeskPage() {
  const navigate = useNavigate();
  const { doctors } = useHealthPlatform();

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! 🙏 Welcome to RuralCare 24/7 AI Health Triage & MobileNetV3 CNN Medical Vision Desk. Describe your symptoms, speak your query, or upload a photo of a visible health issue for screening and smart doctor allocation.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Image Analysis State
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [qualityError, setQualityError] = useState(null);
  const [showGradCam, setShowGradCam] = useState(true);
  const [showAugmentations, setShowAugmentations] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, analysisResult]);

  // Voice Input
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

  // Image Selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a supported image format: JPG, JPEG, PNG, or WEBP.');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setQualityError(null);
    setAnalysisResult(null);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setQualityError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Run CNN Analysis
  const handleRunAnalysis = async () => {
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

      // Connect to smart doctor allocation engine
      const doctorRec = recommendDoctorAndSlot({
        doctorsList: doctors || [],
        department: result.screeningResult.department,
        urgency: result.screeningResult.urgency
      });

      setAnalysisResult({
        ...result,
        doctorRec
      });

      const responseText = `📷 CNN Medical Image Screening Complete:\n• Condition Category: ${result.screeningResult.category}\n• Confidence: ${result.screeningResult.confidence}\n• Recommended Dept: ${result.screeningResult.department}\n\n⚠️ ${result.disclaimer}`;

      setMessages(prev => [
        ...prev,
        {
          sender: 'user',
          text: `[Uploaded Photo for CNN Analysis] ${input ? `Symptoms: "${input}"` : ''}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
          sender: 'ai',
          text: responseText,
          action: {
            label: `Book ${result.screeningResult.department} Doctor`,
            route: '/appointments'
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('CNN Analysis Error:', err);
      setQualityError('An error occurred during analysis. Please upload a clearer image.');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const quickPills = [
    '📷 Analyze Skin Rash Photo',
    '🤒 High Fever & Chills Triage',
    '👁️ Red Eye Visual Screening',
    '🐍 Snakebite Emergency First-Aid',
    '🏥 Nearest Primary Health Center (PHC)'
  ];

  const handleSendText = (textToSend) => {
    const query = textToSend || input;

    if (selectedImage || imagePreview) {
      handleRunAnalysis();
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
      let aiText = '';
      let action = null;

      if (q.includes('snake') || q.includes('bite') || q.includes('chest pain') || q.includes('bleed')) {
        aiText = `🚨 EMERGENCY WARNING (Trauma / Snakebite):\n1. Stay still and keep the affected area below heart level.\n2. Do NOT apply tourniquet or cut the wound.\n3. Call 108 Emergency immediately to dispatch an ambulance with Anti-Snake Venom (ASV).`;
        action = { label: 'Call 108 Ambulance', link: 'tel:108', isCall: true };
      } else if (q.includes('skin') || q.includes('rash') || q.includes('spot') || q.includes('itch')) {
        aiText = `📷 Visible Skin Pattern Detected:\nPlease use the "Upload Health Image" section below to run MobileNetV3 CNN Vision screening on your photo.\n\nRecommended Dept: Dermatology`;
        action = { label: 'Go to Photo Upload', isScrollToUpload: true };
      } else if (q.includes('fever') || q.includes('chills')) {
        aiText = `🩺 Fever Triage Guidance:\n• Rest and drink ORS / clean fluids.\n• If temperature exceeds 102°F or lasts > 48 hours, visit your local Primary Health Center or consult our doctor online.`;
        action = { label: 'Book Doctor Appointment', route: '/appointments' };
      } else {
        aiText = `RuralCare AI Multi-Modal Triage System:\nI can assist you with symptom evaluation, emergency hotline connection, government schemes, and CNN medical photo analysis.`;
        action = { label: 'Book Doctor Appointment', route: '/appointments' };
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: aiText,
        action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #173e37 0%, #0d8b72 100%)', color: '#fff', padding: '28px 32px', borderRadius: '24px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={32} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', letterSpacing: '0.5px' }}>
              CNN VISION & SMART ALLOCATION
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '4px 0 2px 0' }}>AI Health Help Desk & CNN Medical Analysis</h1>
            <p style={{ color: '#a7f3d0', fontSize: '13px', margin: 0 }}>
              Multi-Modal Screening (Text + Voice + MobileNetV3 Image Analysis) connected to Hospital Doctor Allocation
            </p>
          </div>
        </div>

        <a href="tel:108" className="primary-btn" style={{ background: '#dc2626', color: '#fff', boxShadow: 'none', padding: '10px 18px', fontSize: '13px' }}>
          <PhoneCall size={16} /> 108 Emergency
        </a>
      </div>

      {/* Main Grid: Left Chat & Input, Right CNN Image Screening */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* LEFT COLUMN: Multi-Modal Chat & Symptoms */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', height: '620px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '14px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: 800, fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="#0d8b72" /> 24/7 AI Triage Assistant
          </div>

          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map((m, i) => (
              <div key={i} className={`msg-bubble ${m.sender === 'user' ? 'msg-user' : 'msg-ai'}`} style={{ maxWidth: '85%' }}>
                <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{m.text}</p>
                {m.action && (
                  <div style={{ marginTop: '10px' }}>
                    {m.action.isCall ? (
                      <a href={m.action.link} className="pill-btn" style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}>
                        <PhoneCall size={12} /> {m.action.label}
                      </a>
                    ) : (
                      <button className="pill-btn" style={{ background: '#0d8b72', color: '#fff', borderColor: '#0d8b72' }} onClick={() => navigate(m.action.route || '/appointments')}>
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
            {isTyping && <div className="msg-bubble msg-ai" style={{ fontSize: '12px', color: '#64748b' }}>AI Triage engine is processing...</div>}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: '10px 16px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
            <div className="quick-pills">
              {quickPills.map((p, i) => (
                <button key={i} className="pill-btn" onClick={() => handleSendText(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '14px 16px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
            <button
              onClick={handleVoiceInput}
              style={{ background: isListening ? '#dc2626' : '#f1f5f9', color: isListening ? '#fff' : '#475569', border: '1px solid #cbd5e1', width: '42px', height: '42px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Voice Input"
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              type="text"
              className="ai-chat-input"
              style={{ height: '42px' }}
              placeholder={isListening ? "Listening... Speak now" : "Type symptoms or question..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            />

            <button className="primary-btn" style={{ padding: '0 20px', borderRadius: '24px' }} onClick={() => handleSendText()}>
              <Send size={16} /> Send
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: CNN Medical Image Analysis */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={20} color="#9333ea" /> CNN Medical Image Analysis
            </h3>
            <span style={{ fontSize: '10px', fontWeight: 800, background: '#faf5ff', color: '#9333ea', border: '1px solid #e9d5ff', padding: '3px 8px', borderRadius: '12px' }}>
              MobileNetV3 Edge Model
            </span>
          </div>

          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Upload or capture a photo of a visible health issue (skin rash, eye redness, oral lesion, wound). The CNN vision engine screens visual patterns, checks image quality, and identifies the appropriate hospital department and available doctor.
          </p>

          {/* Upload / Camera Buttons */}
          <div style={{ background: '#faf5ff', border: '1px dashed #c084fc', borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
            {!imagePreview ? (
              <div>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                  <Upload size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#4c1d95', margin: '0 0 4px 0' }}>Capture or Upload Health Image</h4>
                <p style={{ fontSize: '11px', color: '#6b21a8', margin: '0 0 16px 0' }}>
                  Ensure good lighting and focus directly on the affected region.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />

                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="primary-btn"
                    style={{ background: '#9333ea', color: '#fff', fontSize: '13px', padding: '10px 18px' }}
                  >
                    📷 Take Photo
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="secondary-btn"
                    style={{ color: '#4c1d95', borderColor: '#c084fc', fontSize: '13px', padding: '10px 18px', background: '#fff' }}
                  >
                    📁 Upload Image
                  </button>
                </div>
                <span style={{ display: 'block', fontSize: '10px', color: '#9333ea', marginTop: '10px' }}>
                  Supported Formats: JPG, JPEG, PNG, WEBP
                </span>
              </div>
            ) : (
              <div>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
                  <img
                    src={imagePreview}
                    alt="Health issue preview"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e9d5ff' }}
                  />
                  <button
                    onClick={handleClearImage}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title="Remove image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzingImage}
                    className="primary-btn"
                    style={{ background: '#9333ea', color: '#ffffff', fontSize: '13px', padding: '10px 20px', flex: 1 }}
                  >
                    {isAnalyzingImage ? 'Analyzing CNN Vision Tensor...' : '⚡ Submit Image for CNN Analysis'}
                  </button>
                  <button
                    onClick={handleClearImage}
                    className="secondary-btn"
                    style={{ fontSize: '13px', padding: '10px 16px', borderColor: '#cbd5e1', color: '#64748b' }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quality Error Notification */}
          {qualityError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px', marginBottom: '16px', color: '#991b1b', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '4px' }}>
                <AlertTriangle size={18} color="#dc2626" /> Image Quality Pre-Check Warning
              </div>
              <p style={{ margin: '0 0 10px 0' }}>"{qualityError}"</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ background: '#dc2626', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                <RefreshCw size={14} style={{ display: 'inline', marginRight: '6px' }} /> Upload Another Image
              </button>
            </div>
          )}

          {/* CNN Analysis Results Card */}
          {analysisResult && analysisResult.success && (
            <div style={{ background: '#ffffff', border: '1px solid #e9d5ff', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 16px rgba(147, 51, 234, 0.08)' }}>
              {/* Emergency Alert Header */}
              {analysisResult.screeningResult.isEmergency ? (
                <div style={{ background: '#dc2626', color: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🚨 Seek Immediate Medical Attention
                  </h3>
                  <p style={{ fontSize: '12px', margin: '0 0 12px 0', opacity: 0.9 }}>
                    Critical trauma or emergency visual pattern detected by CNN screening.
                  </p>
                  <a href="tel:108" className="primary-btn" style={{ background: '#ffffff', color: '#dc2626', width: '100%', justifyContent: 'center', fontSize: '13px' }}>
                    <PhoneCall size={16} /> Call 108 Emergency Ambulance
                  </a>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3e8ff', paddingBottom: '12px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#9333ea', background: '#faf5ff', padding: '4px 10px', borderRadius: '8px' }}>
                    ✓ CNN Vision Screening Complete
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#6b21a8' }}>
                    Confidence: <strong>{analysisResult.screeningResult.confidence} ({Math.round(analysisResult.screeningResult.confidenceScore * 100)}%)</strong>
                  </span>
                </div>
              )}

              {/* Findings */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
                  AI-Detected Condition Category:
                </h4>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#6b21a8', margin: 0 }}>
                  {analysisResult.screeningResult.category}
                </p>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                  {analysisResult.screeningResult.triageNote}
                </p>
              </div>

              {/* Pattern Likelihoods */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Supported Class Likelihood Breakdown:
                </span>
                <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0' }}>
                  {analysisResult.screeningResult.topPatterns.map((pt, i) => (
                    <li key={i} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 2 ? '1px dashed #e2e8f0' : 'none' }}>
                      <span>{i + 1}. {pt.pattern}</span>
                      <span style={{ fontWeight: 700, color: '#9333ea' }}>{pt.likelihood}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Grad-CAM Visual Heatmap */}
              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={() => setShowGradCam(!showGradCam)}
                  style={{ background: '#faf5ff', border: '1px solid #e9d5ff', color: '#6b21a8', width: '100%', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>🎯 Grad-CAM AI Attention Region Heatmap</span>
                  {showGradCam ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showGradCam && (
                  <div style={{ marginTop: '10px', textAlign: 'center', background: '#0f172a', padding: '12px', borderRadius: '12px', color: '#fff' }}>
                    <img
                      src={analysisResult.gradCamDataUrl}
                      alt="Grad-CAM Activation Heatmap"
                      style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', borderRadius: '8px' }}
                    />
                    <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                      <strong>AI Attention Area:</strong> Heatmap overlay displays pixel regions that exerted high gradient activation on the MobileNetV3 CNN predictions. <em>Informational visualization, not a medical diagnosis.</em>
                    </p>
                  </div>
                )}
              </div>

              {/* Training Augmentation Visualizer */}
              <div style={{ marginBottom: '16px' }}>
                <button
                  onClick={() => setShowAugmentations(!showAugmentations)}
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', width: '100%', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span>🔄 AI Image Variations / Training Augmentation (Academic Demo)</span>
                  {showAugmentations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showAugmentations && (
                  <div style={{ marginTop: '10px', background: '#f1f5f9', padding: '12px', borderRadius: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 10px 0', fontWeight: 700 }}>
                      Augmented dataset variations generated for CNN model training robustness:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {analysisResult.augmentations.map((aug, idx) => (
                        <div key={idx} style={{ background: '#fff', padding: '6px', borderRadius: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                          <img src={aug.dataUrl} alt={aug.title} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                          <span style={{ fontSize: '10px', color: '#475569', fontWeight: 700, display: 'block', marginTop: '4px' }}>{aug.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Connected Smart Doctor Allocation */}
              {analysisResult.doctorRec && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '14px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Connected Smart Healthcare Allocation:
                  </span>
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#14532d', lineHeight: 1.6 }}>
                    <strong>Department:</strong> {analysisResult.screeningResult.department}<br />
                    <strong>Matched Doctor:</strong> {analysisResult.doctorRec.recommendedDoctor.name} ({analysisResult.doctorRec.recommendedDoctor.specialty})<br />
                    <strong>Hospital Facility:</strong> {analysisResult.doctorRec.recommendedHospital}<br />
                    <strong>Best Available Slot:</strong> <span style={{ background: '#dcfce7', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>Tomorrow — {analysisResult.doctorRec.bestSlot}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                    <button
                      className="primary-btn"
                      style={{ flex: 1, background: '#16a34a', fontSize: '12px', padding: '10px', justifyContent: 'center' }}
                      onClick={() => navigate('/appointments')}
                    >
                      <Calendar size={14} /> Book Appointment
                    </button>
                    <button
                      className="secondary-btn"
                      style={{ background: '#fff', color: '#166534', borderColor: '#86efac', fontSize: '12px', padding: '10px' }}
                      onClick={() => navigate('/citizen')}
                    >
                      <Hospital size={14} /> Find Hospital
                    </button>
                  </div>
                </div>
              )}

              {/* How CNN Works Accordion */}
              <div>
                <button
                  onClick={() => setShowHowItWorks(!showHowItWorks)}
                  style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'underline', padding: 0 }}
                >
                  <Info size={14} /> Academic Demonstration: How CNN Medical Image Analysis Works
                </button>

                {showHowItWorks && (
                  <div style={{ marginTop: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '12px', fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
                    <h5 style={{ fontSize: '12px', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>MobileNetV3 Pipeline:</h5>
                    1. <strong>Input Image:</strong> User uploads photo.<br />
                    2. <strong>Preprocessing:</strong> Resized to 224x224 RGB tensor with normalized pixel values [0, 1].<br />
                    3. <strong>Convolution:</strong> Filters identify visual patterns (edges, color gradients, texture).<br />
                    4. <strong>Feature Extraction & Pooling:</strong> Reduces spatial dimensions while preserving key features.<br />
                    5. <strong>Classification:</strong> Predicts supported condition category probabilities.<br />
                    6. <strong>Grad-CAM:</strong> Renders attention heatmap over original image.
                  </div>
                )}
              </div>

              {/* Medical Disclaimer */}
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f3e8ff', fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                🔒 <em>Privacy Protection: Images are processed locally in memory. AI image analysis provides informational screening support only. It does not provide a definitive diagnosis or replace examination by a qualified healthcare professional.</em>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
