import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HealthPlatformProvider, useHealthPlatform } from './context/HealthPlatformContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIHelpDeskWidget from './components/AIHelpDeskWidget';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Emergency from './pages/Emergency';
import Appointments from './pages/Appointments';
import CitizenDashboard from './pages/CitizenDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AIHelpDeskPage from './pages/AIHelpDeskPage';
import HealthRecords from './pages/HealthRecords';
import PharmaciesAndCamps from './pages/PharmaciesAndCamps';
import MedicationRemindersPage from './pages/MedicationRemindersPage';
import ClinicalAssessmentPage from './pages/ClinicalAssessmentPage';
import { AlertCircle } from 'lucide-react';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '15px', color: '#64748b' }}>Loading RuralCare AI Platform...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'worker') return <Navigate to="/worker" replace />;
    return <Navigate to="/citizen" replace />;
  }

  return children;
}

function MainApp() {
  const [isAIHelpOpen, setIsAIHelpOpen] = useState(false);
  const { isOffline } = useHealthPlatform();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* OFFLINE / LOW NETWORK BANNER */}
      {isOffline && (
        <div style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#991b1b', padding: '8px 16px', fontSize: '12px', fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <AlertCircle size={16} /> ⚡ Limited Network Connection — Serving Cached Emergency Numbers & Offline Hospital Data
        </div>
      )}

      <Navbar onOpenAIHelp={() => setIsAIHelpOpen(true)} />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home onOpenAIHelp={() => setIsAIHelpOpen(true)} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/assessment" element={<ClinicalAssessmentPage />} />
          <Route path="/records" element={<HealthRecords />} />
          <Route path="/pharmacies" element={<PharmaciesAndCamps />} />
          <Route path="/medication-reminders" element={<MedicationRemindersPage />} />
          <Route path="/ai-helpdesk" element={<AIHelpDeskPage />} />

          <Route
            path="/citizen"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard onOpenAIHelp={() => setIsAIHelpOpen(true)} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/worker"
            element={
              <ProtectedRoute allowedRoles={['worker', 'admin']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={['worker', 'admin']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Floating AI Chat Widget Trigger */}
      <button className="ai-widget-trigger" onClick={() => setIsAIHelpOpen(prev => !prev)}>
        <span className="ai-widget-badge">24/7 AI</span>
        <span>AI Health Desk</span>
      </button>

      {/* AI Help Desk Modal Drawer */}
      <AIHelpDeskWidget isOpen={isAIHelpOpen} onClose={() => setIsAIHelpOpen(false)} />

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <HealthPlatformProvider>
          <MainApp />
        </HealthPlatformProvider>
      </AuthProvider>
    </Router>
  );
}
