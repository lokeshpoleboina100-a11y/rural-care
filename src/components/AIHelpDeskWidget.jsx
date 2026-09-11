import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, PhoneCall, Mic, MicOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AIHelpDeskWidget({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! 🙏 I am your RuralCare 24/7 AI Health Assistant. How can I help you with symptoms, doctor availability, or health schemes today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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

  const quickPills = [
    { label: '🤒 High Fever Triage', query: 'I have high fever and body ache' },
    { label: '🐍 Snakebite First-Aid', query: 'Emergency snakebite advice' },
    { label: '💳 Ayushman Bharat Scheme', query: 'How to apply for Ayushman Bharat PM-JAY card?' },
    { label: '🏥 Nearest Hospital', query: 'Find nearest primary health center' },
    { label: '🤱 Maternal & Child Health', query: 'Nutrition and vaccination schedule for babies' }
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || input;
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
      const response = generateAIResponse(query);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: response.text,
        action: response.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 700);
  };

  const generateAIResponse = (q) => {
    const queryLower = q.toLowerCase();

    if (queryLower.includes('snake') || queryLower.includes('bite') || queryLower.includes('chest pain')) {
      return {
        text: `🚨 EMERGENCY TRIAGE WARNING:\n1. Stay calm and lower the affected area below heart level.\n2. Do NOT cut the wound or try to suck venom.\n3. Call 108 Emergency immediately or visit nearest District Hospital for Anti-Snake Venom (ASV).\n\n⚠️ AI guidance is for informational purposes only and does not replace professional medical advice.`,
        action: { label: 'Call 108 Emergency Ambulance', link: 'tel:108', isCall: true }
      };
    }

    if (queryLower.includes('fever') || queryLower.includes('cough') || queryLower.includes('cold')) {
      return {
        text: `🩺 Fever & Symptom Triage:\n• Rest and drink plenty of clean fluids (ORS, boiled water).\n• Monitor temperature with a thermometer.\n• If fever exceeds 102°F or lasts > 3 days, consult our AI Doctor Slot Allocator.\n\n⚠️ AI guidance is for informational purposes only.`,
        action: { label: 'Run AI Doctor & Slot Allocation', route: '/appointments' }
      };
    }

    if (queryLower.includes('ayushman') || queryLower.includes('scheme') || queryLower.includes('pm-jay')) {
      return {
        text: `💳 Ayushman Bharat (PM-JAY):\n• Coverage up to ₹5 Lakh per family per year.\n• Bring your Aadhaar Card & Ration Card to any empanelled hospital to generate your ABHA Golden Card.`,
        action: { label: 'View Empanelled Hospitals', route: '/emergency' }
      };
    }

    return {
      text: `RuralCare AI Triage Assistant:\nI can assist you with symptom evaluation, doctor availability, appointment allocation, and emergency hotlines.\n\n⚠️ AI guidance is for informational purposes only and is not a replacement for a qualified healthcare professional.`,
      action: { label: 'Book Doctor Appointment', route: '/appointments' }
    };
  };

  return (
    <div className="ai-chat-modal">
      <div className="ai-chat-header">
        <div className="ai-chat-header-title">
          <div className="ai-header-icon">
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div>
            <h4>RuralCare AI Help Desk</h4>
            <p>24/7 Smart Health & Triage Assistant</p>
          </div>
        </div>
        <button className="ai-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="ai-chat-body">
        {messages.map((m, idx) => (
          <div key={idx} className={`msg-bubble ${m.sender === 'user' ? 'msg-user' : 'msg-ai'}`}>
            <p style={{ whiteSpace: 'pre-line' }}>{m.text}</p>
            {m.action && (
              <div style={{ marginTop: '10px' }}>
                {m.action.isCall ? (
                  <a href={m.action.link} className="pill-btn" style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}>
                    <PhoneCall size={12} /> {m.action.label}
                  </a>
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
            AI thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ padding: '8px 14px', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
        <div className="quick-pills">
          {quickPills.map((p, i) => (
            <button key={i} className="pill-btn" onClick={() => handleSend(p.query)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-chat-footer">
        <button onClick={handleVoiceInput} style={{ background: isListening ? '#dc2626' : '#f1f5f9', color: isListening ? '#fff' : '#475569', border: '1px solid var(--border)', width: '38px', height: '38px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Voice Input">
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <input
          type="text"
          className="ai-chat-input"
          placeholder={isListening ? "Listening... Speak now" : "Type or speak symptoms..."}
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
