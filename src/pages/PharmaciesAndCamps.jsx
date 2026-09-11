import React, { useState } from 'react';
import { useHealthPlatform } from '../context/HealthPlatformContext';
import { MapPin, PhoneCall, ExternalLink, Calendar, HeartPulse, Search, Info } from 'lucide-react';

export default function PharmaciesAndCamps() {
  const { pharmacies, healthCamps } = useHealthPlatform();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchMedicine, setSearchMedicine] = useState('');

  const filteredCamps = healthCamps.filter(camp => {
    if (selectedCategory === 'All') return true;
    return camp.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '6px', display: 'block' }}>
          COMMUNITY HEALTHCARE RESOURCES
        </span>
        <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          Nearby Pharmacy Finder & Health Camps
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Locate empanelled pharmacies, Jan Aushadhi Kendras, and free upcoming rural health screening camps.
        </p>
      </div>

      {/* SECTION 1: PHARMACY FINDER */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '40px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Nearby Pharmacies & Medicine Outlets</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Empanelled outlets providing generic and essential medicines.</p>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search medicine (e.g. Paracetamol)..."
              style={{ paddingLeft: '36px', width: '260px', height: '40px' }}
              value={searchMedicine}
              onChange={(e) => setSearchMedicine(e.target.value)}
            />
          </div>
        </div>

        {searchMedicine && (
          <div className="error-banner" style={{ background: '#e0f2fe', borderColor: '#bae6fd', color: '#0369a1', marginBottom: '20px' }}>
            <Info size={16} /> Medicine availability depends on connected pharmacy data. Please contact pharmacy directly below.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {pharmacies.map((pharm, idx) => (
            <div key={idx} style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, background: pharm.isGovernment ? '#ecfdf5' : '#f1f5f9', color: pharm.isGovernment ? '#047857' : '#475569', padding: '2px 8px', borderRadius: '6px' }}>
                    {pharm.isGovernment ? '🏛️ Government Kendra' : '🏬 Retail Pharmacy'}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>📍 {pharm.distance}</span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>{pharm.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{pharm.location}</p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a href={`tel:${pharm.phone}`} className="primary-btn" style={{ flex: 1, padding: '8px', fontSize: '12px', justifyContent: 'center' }}>
                  <PhoneCall size={12} /> Call Pharmacy
                </a>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pharm.name + ' ' + pharm.location)}`} target="_blank" rel="noreferrer" className="secondary-btn" style={{ padding: '8px', fontSize: '12px', color: '#475569', borderColor: '#cbd5e1' }}>
                  <ExternalLink size={12} /> Map
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: HEALTH CAMPS NEAR YOU */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Free Health Screening Camps Near You</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Community wellness, eye care, and vaccination drives.</p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'Eye Care', 'Children', 'General'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                style={{
                  background: selectedCategory === cat ? 'var(--primary)' : '#f1f5f9',
                  color: selectedCategory === cat ? '#ffffff' : '#475569',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '16px'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredCamps.map((camp) => (
            <div key={camp.id} style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px' }}>
                    {camp.category}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>📍 {camp.distance} away</span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>{camp.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}><strong>Organized by:</strong> {camp.org}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>📍 {camp.location}</p>

                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                  📅 {camp.date} • ⏰ {camp.time}
                </div>
              </div>

              <button
                onClick={() => alert(`Free Registration Confirmed for ${camp.title} on ${camp.date} at ${camp.location}.`)}
                className="primary-btn"
                style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
              >
                Register for Free Health Camp
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
