import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHealthPlatform } from '../context/HealthPlatformContext';
import {
  predictPatientDemand,
  predictDepartmentDemand,
  generateStaffingOptimizationAlerts,
  classifyDoctorUtilization
} from '../utils/aiAllocationEngine';
import { Shield, Hospital, Users, Activity, Server, AlertTriangle, Sparkles, TrendingUp, UserCheck, Calendar, CheckCircle2, XCircle, ArrowRightLeft, Clock, BarChart3, PieChart, Layers } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { doctors, setDoctors } = useHealthPlatform();

  // Interactive Staffing Recommendations state
  const [staffingAlerts, setStaffingAlerts] = useState(() => generateStaffingOptimizationAlerts(doctors));
  const [acceptedAlerts, setAcceptedAlerts] = useState({});

  // Workload Balancer state
  const [isWorkloadOptimized, setIsWorkloadOptimized] = useState(false);

  const demandPredictions = predictPatientDemand();
  const departmentDemands = predictDepartmentDemand();
  const doctorUtilizations = classifyDoctorUtilization(doctors);

  const availableDocsCount = doctors.filter(d => d.status === 'Available').length;
  const overloadedDocsCount = doctorUtilizations.filter(d => d.statusLabel === 'Overloaded').length;
  const underutilizedDocsCount = doctorUtilizations.filter(d => d.statusLabel === 'Underutilized').length;

  const handleAcceptStaffingAlert = (alertId) => {
    setAcceptedAlerts(prev => ({ ...prev, [alertId]: true }));
    alert(`Staffing Recommendation Accepted! Capacity block updated. Doctor schedule adjusted upon admin confirmation.`);
  };

  const handleRejectStaffingAlert = (alertId) => {
    setAcceptedAlerts(prev => ({ ...prev, [alertId]: 'rejected' }));
  };

  const handleOptimizeWorkload = () => {
    setIsWorkloadOptimized(true);
    alert('AI Workload Balancer Executed! Compatible non-urgent general appointments redistributed to available doctors with matching specialization.');
  };

  return (
    <div className="container" style={{ padding: '36px 24px', maxWidth: '1200px' }}>
      {/* ADMIN CONTROL CENTER HEADER */}
      <div className="dash-header" style={{ marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              LEVEL 3 HOSPITAL OPTIMIZATION CENTER
            </span>
            <span style={{ fontSize: '10px', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '6px' }}>
              Demo / Illustrative Data (ML Predictive Engine Ready)
            </span>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Predictive Patient Load & Hospital Staffing Intelligence
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0 0' }}>
            Officer: <strong>{user?.name || 'Dr. V. Rao (District Health Officer)'}</strong> — District Headquarters AI Control Center
          </p>
        </div>
      </div>

      {/* OVERVIEW METRIC CARDS */}
      <div className="dash-cards" style={{ marginBottom: '32px' }}>
        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><UserCheck size={24} /></div>
          <div>
            <div className="dash-card-val">{availableDocsCount} / {doctors.length}</div>
            <div className="dash-card-lbl">Doctors Active & Available</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}><Calendar size={24} /></div>
          <div>
            <div className="dash-card-val">142 / 176</div>
            <div className="dash-card-lbl">Appointments / Est. Patients</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: '#fef3c7', color: '#b45309' }}><Clock size={24} /></div>
          <div>
            <div className="dash-card-val">14.2 min</div>
            <div className="dash-card-lbl">Avg Patient Waiting Time</div>
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: overloadedDocsCount > 0 ? '#fef2f2' : '#ecfdf5', color: overloadedDocsCount > 0 ? '#dc2626' : '#10b981' }}><Activity size={24} /></div>
          <div>
            <div className="dash-card-val">{overloadedDocsCount} Overloaded | {underutilizedDocsCount} Underutilized</div>
            <div className="dash-card-lbl">Doctor Workload Status</div>
          </div>
        </div>
      </div>

      {/* SECTION 1: AI STAFFING & CAPACITY RECOMMENDATIONS (INTERACTIVE ALERTS) */}
      <div style={{ background: 'linear-gradient(135deg, #173e37 0%, #0d8b72 100%)', color: '#ffffff', padding: '24px', borderRadius: '20px', marginBottom: '32px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>AI Staffing & Capacity Recommendations</h3>
              <p style={{ fontSize: '12px', color: '#a7f3d0', margin: 0 }}>
                Real-time recommendations to prevent peak hospital overcrowding (Requires Admin Approval)
              </p>
            </div>
          </div>

          <span style={{ fontSize: '11px', fontWeight: 800, background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '8px' }}>
            AI Optimization Alert Active
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {staffingAlerts.map(alert => {
            const status = acceptedAlerts[alert.id];

            return (
              <div key={alert.id} style={{ background: '#ffffff', color: 'var(--text-primary)', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>{alert.title}</h4>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                      Department: {alert.department} • Time Window: {alert.timeWindow}
                    </span>
                  </div>

                  <span style={{ fontSize: '11px', fontWeight: 800, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px' }}>
                    Est. Demand: {alert.expectedPatients} Patients (Capacity: {alert.currentCapacity})
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                  <strong>Why Recommended?</strong> {alert.whyText}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a' }}>
                    Action: {alert.recommendedAction}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {status === true ? (
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={16} /> Recommendation Accepted by Admin
                      </span>
                    ) : status === 'rejected' ? (
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <XCircle size={16} /> Recommendation Rejected
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAcceptStaffingAlert(alert.id)}
                          className="primary-btn"
                          style={{ background: '#16a34a', fontSize: '12px', padding: '6px 14px', borderRadius: '8px' }}
                        >
                          ✓ Accept Recommendation
                        </button>
                        <button
                          onClick={() => handleRejectStaffingAlert(alert.id)}
                          className="secondary-btn"
                          style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', color: '#dc2626', borderColor: '#fecaca' }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TWO COLUMN GRID: HOURLY DEMAND FORECAST & DEPARTMENT DEMAND PREDICTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>

        {/* HOURLY PATIENT LOAD FORECAST */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="var(--primary)" /> Predictive Patient Load Forecast
            </h3>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)' }}>Today & Tomorrow</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {demandPredictions.map((pred, i) => (
              <div key={i} style={{ background: '#f8fafc', border: '1px solid var(--border)', padding: '14px', borderRadius: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>⏰ {pred.timeRange}</span>
                  <span style={{
                    fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
                    background: pred.demand === 'Very High' ? '#fef2f2' : pred.demand === 'High' ? '#fff7ed' : '#ecfdf5',
                    color: pred.demand === 'Very High' ? '#dc2626' : pred.demand === 'High' ? '#c2410c' : '#047857'
                  }}>
                    {pred.status} ({pred.predictedPatients} / {pred.capacity} patients)
                  </span>
                </div>

                {/* Progress bar visualizer */}
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pred.barPercent}%`,
                    height: '100%',
                    background: pred.demand === 'Very High' ? '#dc2626' : pred.demand === 'High' ? '#ea580c' : '#10b981',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DEPARTMENT DEMAND PREDICTION TABLE */}
        <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} color="var(--primary)" /> Department Demand & Shortage Prediction
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Predicted patient demand vs available capacity across departments.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {departmentDemands.map((dept, i) => (
              <div key={i} style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '12px 14px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{dept.department}</h4>
                  <span style={{
                    fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '6px',
                    background: dept.demandLevel === 'HIGH' ? '#fef2f2' : dept.demandLevel === 'MEDIUM' ? '#fef3c7' : '#ecfdf5',
                    color: dept.demandLevel === 'HIGH' ? '#dc2626' : dept.demandLevel === 'MEDIUM' ? '#b45309' : '#047857'
                  }}>
                    {dept.demandLevel} DEMAND
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Expected: <strong>{dept.expectedPatients}</strong> • Capacity: <strong>{dept.availableCapacity}</strong> • Shortage: <strong style={{ color: dept.potentialShortage > 0 ? '#dc2626' : '#10b981' }}>{dept.potentialShortage > 0 ? `+${dept.potentialShortage}` : 'None (0)'}</strong>
                </div>

                <span style={{ fontSize: '10px', color: 'var(--text-muted)', italic: 'true' }}>
                  💡 {dept.recommendation}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: DOCTOR UTILIZATION & AI WORKLOAD BALANCER */}
      <div style={{ background: '#ffffff', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowRightLeft size={20} color="var(--primary)" /> Doctor Utilization & AI Workload Balancer
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Identifies overloaded and underutilized doctors and rebalances appointment distribution.
            </p>
          </div>

          <button
            onClick={handleOptimizeWorkload}
            className="primary-btn"
            style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '10px' }}
          >
            {isWorkloadOptimized ? '✓ Workload Balanced' : '⚡ Run AI Workload Balancer'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {doctorUtilizations.map(doc => (
            <div key={doc.id} style={{ background: doc.bg, border: '1px solid var(--border)', borderRadius: '14px', padding: '14px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: doc.statusColor, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                {doc.statusLabel} ({doc.utilizationPct}% Utilization)
              </span>

              <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{doc.name}</h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>{doc.department}</p>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Patients in Queue: <strong>{isWorkloadOptimized ? Math.min(doc.currentWorkloadCount, 10) : doc.currentWorkloadCount}</strong> / {doc.maxPatientsPerDay}
              </div>
            </div>
          ))}
        </div>

        {isWorkloadOptimized && (
          <div style={{ marginTop: '16px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '12px', borderRadius: '10px', fontSize: '12px', color: '#065f46' }}>
            ✓ <strong>AI Optimization Applied:</strong> 4 routine non-urgent follow-ups redistributed to Dr. V. Rao (Tele-Consultant) during 2 PM–4 PM slot block. Doctor overload reduced by 25%.
          </div>
        )}
      </div>
    </div>
  );
}
