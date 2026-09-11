import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, PhoneCall, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AIHelpDeskWidget({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! 🙏 I am your RuralCare AI Assistant. How can I support your health or answer your questions today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState('English');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

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
      const response = generateAIResponse(query, language);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: response.text,
        action: response.action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 800);
  };

  const generateAIResponse = (q, lang) => {
    const queryLower = q.toLowerCase();

    if (queryLower.includes('snake') || queryLower.includes('bite') || queryLower.includes('poison')) {
      return {
        text: `🚨 EMERGENCY ADVICE (Snakebite):\n1. Stay calm and keep the bitten limb still below heart level.\n2. Do NOT cut the wound or try to suck venom.\n3. Call 108 Emergency immediately or visit nearest District Hospital for Anti-Snake Venom (ASV).\n4. Remove tight jewellery or clothing near the bite area.`,
        action: { label: 'Call 108 Emergency Ambulance', link: 'tel:108', isCall: true }
      };
    }

    if (queryLower.includes('fever') || queryLower.includes('cough') || queryLower.includes('cold') || queryLower.includes('headache')) {
      return {
        text: `🩺 Fever & Symptom Guidance:\n• Rest and drink plenty of clean fluids (ORS, boiled water).\n• Monitor temperature with a thermometer.\n• If fever exceeds 102°F or lasts > 3 days, or if accompanied by chills or vomiting, consult your local ASHA worker or doctor.`,
        action: { label: 'Book Doctor Consultation', route: '/appointments' }
      };
    }

    if (queryLower.includes('ayushman') || queryLower.includes('scheme') || queryLower.includes('card') || queryLower.includes('pm-jay')) {
      return {
        text: `💳 Ayushman Bharat (PM-JAY):\n• Provides coverage up to ₹5 Lakh per family per year for secondary and tertiary hospitalization.\n• Eligibility: Rural households identified under SECC data, BPL card holders, or Ration Card holders.\n• Bring your Aadhaar Card & Ration Card to any empanelled hospital or Common Service Center (CSC) to get your ABHA ID & Golden Card generated.`,
        action: { label: 'Find Empanelled Hospitals', route: '/emergency' }
      };
    }

    if (queryLower.includes('hospital') || queryLower.includes('doctor') || queryLower.includes('center') || queryLower.includes('clinic')) {
      return {
        text: `🏥 Nearby Healthcare Centers:\nRuralCare connects you with 24/7 Primary Health Centers (PHCs), Community Health Centers (CHCs), and District General Hospitals.\nClick below to view interactive maps and emergency contact numbers.`,
        action: { label: 'View Hospitals & Emergency Numbers', route: '/emergency' }
      };
    }

    if (queryLower.includes('register') || queryLower.includes('login') || queryLower.includes('sign in') || queryLower.includes('account')) {
      return {
        text: `🔑 Account & Registration Help:\n• Citizen Account: Allows booking appointments, storing medical records, and tracking referrals.\n• Health Worker (ASHA/ANM) Account: Enables field patient triage, referral dispatch, and community health logs.\n• Admin Account: District health management.`,
        action: { label: 'Go to Registration Page', route: '/register' }
      };
    }

    return {
      text: `Thank you for reaching out to RuralCare AI Help Desk! 🌿\nI can assist you with:\n1. Triage for symptoms (fever, injuries, snakebites)\n2. Government Schemes (Ayushman Bharat, Jan Aushadhi, ABHA Card)\n3. Connecting with local ASHA workers & booking appointments.\n4. Locating 24/7 emergency hospitals.`
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
          <div className="msg-bubble msg-ai" style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '80px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>AI thinking...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={{ padding: '8px 16px', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>QUICK HELP PROMPTS:</p>
        <div className="quick-pills">
          {quickPills.map((p, i) => (
            <button key={i} className="pill-btn" onClick={() => handleSend(p.query)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-chat-footer">
        <input
          type="text"
          className="ai-chat-input"
          placeholder="Ask AI about symptoms, schemes, or hospitals..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="ai-chat-send" onClick={() => handleSend()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
