import React, { useState, useEffect } from 'react';
import { PhoneCall, Hospital, MapPin, Search, ExternalLink, Navigation, CheckCircle2, AlertCircle, Compass } from 'lucide-react';

export default function Emergency() {
  const [userCoords, setUserCoords] = useState(null); // { lat, lng }
  const [locationName, setLocationName] = useState('Detecting your location...');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Initial hospital database with coordinates
  const initialHospitals = [
    {
      id: 1,
      name: 'District Area Hospital & Trauma Center',
      type: 'Government General Hospital',
      location: 'District Center, Main Road',
      phone: '08572-234567',
      bedsAvailable: 14,
      icuAvailable: 3,
      is24x7: true,
      lat: 13.6288,
      lng: 79.4192
    },
    {
      id: 2,
      name: 'Ramapuram Primary Health Center (PHC)',
      type: 'Primary Health Center',
      location: 'Near Bus Stand, Ramapuram Village',
      phone: '08572-298112',
      bedsAvailable: 4,
      icuAvailable: 0,
      is24x7: true,
      lat: 13.6350,
      lng: 79.4100
    },
    {
      id: 3,
      name: 'Sanjivani Rural Community Hospital',
      type: 'Community Health Center (CHC)',
      location: 'Mandal Road, Ward 5',
      phone: '08572-244890',
      bedsAvailable: 8,
      icuAvailable: 1,
      is24x7: true,
      lat: 13.6450,
      lng: 79.4300
    },
    {
      id: 4,
      name: 'Suraksha Maternity & Child Care Clinic',
      type: 'Specialized Clinic',
      location: 'Station Road, Sector 2',
      phone: '08572-255112',
      bedsAvailable: 6,
      icuAvailable: 0,
      is24x7: false,
      lat: 13.6200,
      lng: 79.4050
    }
  ];

  // Calculate distance in KM using Haversine formula
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Get user's current live location
  const detectLocation = () => {
    setGeoLoading(true);
    setGeoError('');

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setGeoLoading(false);

        // Reverse geocode via OpenStreetMap Nominatim
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
          const data = await res.json();
          const city = data.address?.village || data.address?.town || data.address?.city || data.address?.county || 'Your Location';
          setLocationName(`${city} (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
        } catch {
          setLocationName(`Current Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoLoading(false);
        setGeoError('Location permission denied or unavailable. Showing nearby district health centers.');
        // Default fallback coordinates (e.g. Rural Health District)
        setUserCoords({ lat: 13.6288, lng: 79.4192 });
        setLocationName('Rural Health Center District');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // Process hospital list with distance
  const processedHospitals = initialHospitals.map(h => {
    if (!userCoords) return { ...h, distanceKm: 2.5 };
    const dist = getDistanceKm(userCoords.lat, userCoords.lng, h.lat, h.lng);
    return { ...h, distanceKm: parseFloat(dist) };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const filteredHospitals = processedHospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.location.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === 'All') return matchesSearch;
    return matchesSearch && h.type.includes(filterType);
  });

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      {/* EMERGENCY DISPATCH BANNER */}
      <div style={{ background: 'linear-gradient(135deg, #991b1b, #dc2626)', color: '#fff', padding: '28px 32px', borderRadius: '20px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>24/7 EMERGENCY TRIAGE</span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0 4px 0' }}>Need Urgent Medical Care or Ambulance?</h1>
          <p style={{ color: '#fecaca', fontSize: '14px' }}>Dial national helplines immediately for 24/7 emergency dispatch.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="tel:108" className="primary-btn" style={{ background: '#fff', color: '#991b1b', boxShadow: 'none' }}>
            <PhoneCall size={18} /> Call 108 Ambulance
          </a>
          <a href="tel:104" className="secondary-btn" style={{ background: 'rgba(255,255,255,0.15)', borderColor: '#fff' }}>
            <PhoneCall size={18} /> Call 104 Health Advisory
          </a>
        </div>
      </div>

      {/* LOCATION DETECTION BAR */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>YOUR DETECTED LOCATION</span>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{locationName}</h3>
          </div>
        </div>

        <button onClick={detectLocation} className="login-btn" style={{ height: '40px' }} disabled={geoLoading}>
          <Compass size={16} /> {geoLoading ? 'Detecting Location...' : 'Refresh Location'}
        </button>
      </div>

      {geoError && (
        <div className="error-banner" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <span>{geoError}</span>
        </div>
      )}

      {/* SEARCH AND FILTER TOOLBAR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Hospitals Sorted by Proximity</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Nearest emergency facilities, bed counts, and directions from your location.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select className="input-field" style={{ width: 'auto', height: '42px' }} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="All">All Facility Types</option>
            <option value="Government">Government Hospitals</option>
            <option value="Primary">Primary Health Centers (PHCs)</option>
            <option value="Community">Community Health Centers (CHCs)</option>
          </select>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search hospital name or area..."
              style={{ paddingLeft: '36px', height: '42px', width: '240px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* HOSPITALS CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {filteredHospitals.map((h) => (
          <div key={h.id} style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '12px' }}>
                  {h.type}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Navigation size={12} /> {h.distanceKm} km away
                </span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.3' }}>
                {h.name}
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
                <MapPin size={14} color="var(--primary)" /> {h.location}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>General Beds</span>
                  <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{h.bedsAvailable} Available</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>ICU Beds</span>
                  <strong style={{ fontSize: '15px', color: h.icuAvailable > 0 ? '#16a34a' : '#ef4444' }}>{h.icuAvailable} Available</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <a href={`tel:${h.phone}`} className="primary-btn" style={{ flex: 1, padding: '10px', fontSize: '13px', justifyContent: 'center' }}>
                <PhoneCall size={14} /> Call Hospital
              </a>
              <a
                href={userCoords ? `https://www.google.com/maps/dir/?api=1&origin=${userCoords.lat},${userCoords.lng}&destination=${h.lat},${h.lng}&travelmode=driving` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' ' + h.location)}`}
                target="_blank"
                rel="noreferrer"
                className="secondary-btn"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', padding: '10px', fontSize: '13px', justifyContent: 'center' }}
              >
                <ExternalLink size={14} /> Directions
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
