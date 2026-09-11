import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AIHelpDeskPage from './pages/AIHelpDeskPage';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '16px', color: '#64748b' }}>Loading RuralCare...</div>;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar onOpenAIHelp={() => setIsAIHelpOpen(true)} />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home onOpenAIHelp={() => setIsAIHelpOpen(true)} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/appointments" element={<Appointments />} />
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
              <ProtectedRoute allowedRoles={['worker']}>
                <WorkerDashboard />
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
        <MainApp />
      </AuthProvider>
    </Router>
  );
}
