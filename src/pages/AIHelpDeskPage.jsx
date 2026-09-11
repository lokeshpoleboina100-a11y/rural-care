import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, PhoneCall, HeartPulse, ShieldCheck, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AIHelpDeskPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Namaste! 🙏 Welcome to the RuralCare 24/7 AI Health & Scheme Triage Desk. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const quickPills = [
    '🤒 High Fever & Chills Triage',
    '🐍 Snakebite Emergency First-Aid',
    '💳 Ayushman Bharat (PM-JAY) Card',
    '🏥 Nearest Primary Health Center (PHC)',
    '🤱 Maternal & Vaccination Schedule'
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
      let aiText = `I have received your query regarding "${query}".\n`;
      let action = null;

      const q = query.toLowerCase();
      if (q.includes('snake') || q.includes('bite') || q.includes('emergency')) {
        aiText = `🚨 EMERGENCY WARNING (Snakebite / Acute Trauma):\n1. Stay still and lower the affected area below heart level.\n2. Do NOT apply tourniquet or cut the wound.\n3. Call 108 Emergency immediately to dispatch an ambulance with Anti-Snake Venom (ASV).`;
        action = { label: 'Call 108 Ambulance', link: 'tel:108', isCall: true };
      } else if (q.includes('fever') || q.includes('chills') || q.includes('symptom')) {
        aiText = `🩺 Fever Triage Guidance:\n• Rest and drink ORS / clean fluids.\n• If temperature is > 102°F or lasts more than 48 hours, visit your local Primary Health Center or consult our doctor online.`;
        action = { label: 'Book Doctor Appointment', route: '/appointments' };
      } else if (q.includes('ayushman') || q.includes('scheme') || q.includes('pm-jay')) {
        aiText = `💳 Ayushman Bharat PM-JAY Benefits:\n• Covers up to ₹5,000,000 per family per year for secondary/tertiary hospital treatment.\n• Bring your Ration Card & Aadhaar Card to any government hospital to generate your ABHA ID card.`;
        action = { label: 'Find Nearby Empanelled Hospital', route: '/emergency' };
      } else {
        aiText = `RuralCare AI Triage System:\nI can assist you with symptom evaluation, emergency hotline connection, government schemes, and appointment booking.`;
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: aiText,
        action,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ background: 'linear-gradient(135deg, #173e37, #0d8b72)', color: '#fff', padding: '28px 32px', borderRadius: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={30} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>AI Health & Triage Desk</h1>
            <p style={{ color: '#a7f3d0', fontSize: '13px', margin: 0 }}>Instant AI Medical Guidance & Scheme Support for Rural India</p>
          </div>
        </div>
        <a href="tel:108" className="primary-btn" style={{ background: '#dc2626', color: '#fff', boxShadow: 'none', padding: '10px 18px', fontSize: '13px' }}>
          <PhoneCall size={16} /> 108 Emergency
        </a>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', height: '550px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((m, i) => (
            <div key={i} className={`msg-bubble ${m.sender === 'user' ? 'msg-user' : 'msg-ai'}`} style={{ maxWidth: '75%' }}>
              <p style={{ whiteSpace: 'pre-line' }}>{m.text}</p>
              {m.action && (
                <div style={{ marginTop: '12px' }}>
                  {m.action.isCall ? (
                    <a href={m.action.link} className="pill-btn" style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}>
                      <PhoneCall size={12} /> {m.action.label}
                    </a>
                  ) : (
                    <button className="pill-btn" style={{ background: '#0d8b72', color: '#fff', borderColor: '#0d8b72' }} onClick={() => navigate(m.action.route)}>
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

        <div style={{ padding: '12px 20px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>SUGGESTED TRIAGE TOPICS:</p>
          <div className="quick-pills">
            {quickPills.map((p, i) => (
              <button key={i} className="pill-btn" onClick={() => handleSend(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="ai-chat-input"
            style={{ height: '46px' }}
            placeholder="Type your symptoms, medical question, or health scheme query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="primary-btn" style={{ padding: '0 24px', borderRadius: '30px' }} onClick={() => handleSend()}>
            <Send size={18} /> Ask AI
          </button>
        </div>
      </div>
    </div>
  );
}
