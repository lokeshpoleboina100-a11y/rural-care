import React, { useState, useEffect } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MessageSquare, Send, ShieldCheck, UserCheck } from 'lucide-react';

export default function VideoConsultationModal({ isOpen, onClose, doctor }) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'doctor', text: 'Hello! I am reviewing your triage assessment summary and vitals. How are you feeling right now?', time: 'Just now' }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  useEffect(() => {
    let timer;
    if (isOpen) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const doctorName = doctor?.name || 'Dr. Aarav Khanna';
  const doctorSpecialty = doctor?.specialty || doctor?.department || 'General Physician & Tele-Consultant';
  const doctorClinic = doctor?.clinic || 'District Area Hospital';

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = { sender: 'patient', text: inputMsg, time: 'Just now' };
    setChatMessages(prev => [...prev, newMsg]);
    setInputMsg('');

    // Simulate doctor auto reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: 'doctor', text: `Thank you. I have noted: "${inputMsg}". I am generating a digital prescription for you now.`, time: 'Just now' }
      ]);
    }, 1200);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.85)', zIndex: 2500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#0f172a', borderRadius: '24px', maxWidth: '960px', width: '100%', height: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid #334155' }}>
        
        {/* HEADER */}
        <div style={{ background: '#1e293b', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              LIVE TELE-CONSULTATION ({formatTime(callDuration)})
            </div>
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>
              Connected with <strong style={{ color: '#f8fafc' }}>{doctorName}</strong> ({doctorSpecialty})
            </span>
          </div>

          <button onClick={onClose} style={{ background: '#334155', border: 'none', color: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* MAIN VIDEO & CHAT AREA */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>
          
          {/* LEFT: MAIN DOCTOR VIDEO SCREEN */}
          <div style={{ position: 'relative', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* DOCTOR SIMULATED FEED */}
            <div style={{ textAlign: 'center', width: '100%', height: '100%', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: '#0d8b72', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '42px', fontWeight: 800, marginBottom: '16px', border: '4px solid #10b981', boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }}>
                👨‍⚕️
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#f8fafc', margin: '0 0 4px 0' }}>{doctorName}</h2>
              <p style={{ fontSize: '13px', color: '#38bdf8', margin: '0 0 12px 0' }}>{doctorSpecialty} • {doctorClinic}</p>
              
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> End-to-End Encrypted Tele-Consultation Stream
              </div>

              {/* PATIENT PIP SELF CAM (BOTTOM RIGHT) */}
              <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '140px', height: '100px', background: '#1e293b', border: '2px solid #334155', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isVideoOn ? (
                  <div style={{ width: '100%', height: '100%', background: '#334155', color: '#94a3b8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                    <span style={{ fontSize: '24px' }}>👤</span>
                    <span>You (Patient)</span>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#020617', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
                    Camera Off
                  </div>
                )}
              </div>
            </div>

            {/* CALL CONTROL TOOLBAR (FLOATING AT BOTTOM) */}
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(30, 41, 59, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid #475569', borderRadius: '40px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              <button
                onClick={() => setIsMicOn(prev => !prev)}
                style={{ background: isMicOn ? '#334155' : '#ef4444', color: '#fff', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
              >
                {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>

              <button
                onClick={() => setIsVideoOn(prev => !prev)}
                style={{ background: isVideoOn ? '#334155' : '#ef4444', color: '#fff', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title={isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
              >
                {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
              </button>

              <button
                onClick={() => alert('Screen sharing initialized. Presenting clinical assessment details.')}
                style={{ background: '#334155', color: '#fff', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Share Screen"
              >
                <Monitor size={20} />
              </button>

              <button
                onClick={onClose}
                style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0 20px', height: '44px', borderRadius: '24px', cursor: 'pointer', fontWeight: 800, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <PhoneOff size={18} /> End Call
              </button>
            </div>
          </div>

          {/* RIGHT: IN-CALL CONSULTATION CHAT */}
          <div style={{ background: '#1e293b', borderLeft: '1px solid #334155', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>Consultation Notes & Chat</h3>
            </div>

            <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatMessages.map((msg, idx) => {
                const isDoc = msg.sender === 'doctor';
                return (
                  <div key={idx} style={{ alignSelf: isDoc ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                    <div style={{ background: isDoc ? '#334155' : '#0d8b72', color: '#ffffff', padding: '10px 14px', borderRadius: '14px', fontSize: '12px', lineHeight: 1.4 }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', display: 'block', textAlign: isDoc ? 'left' : 'right' }}>
                      {isDoc ? doctorName : 'You'} • {msg.time}
                    </span>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '12px', borderTop: '1px solid #334155', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Type message to doctor..."
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '8px 12px', color: '#f8fafc', fontSize: '12px', outline: 'none' }}
              />
              <button type="submit" style={{ background: '#0d8b72', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer' }}>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
