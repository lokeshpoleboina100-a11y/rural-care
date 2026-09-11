import React, { createContext, useContext, useState, useEffect } from 'react';
import { recommendDoctorAndSlot, predictPatientDemand, predictNoShowRisk } from '../utils/aiAllocationEngine';

const HealthPlatformContext = createContext();

export const useHealthPlatform = () => useContext(HealthPlatformContext);

export const HealthPlatformProvider = ({ children }) => {
  // Offline & Low Network Detection
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Doctors Availability & Workload Registry
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: 'Dr. S. Reddy',
      specialty: 'General Medicine & Triage',
      department: 'General Medicine',
      clinic: 'Ramapuram Primary Health Center (PHC)',
      status: 'Available', // Available, Limited, Fully Booked, Unavailable, On Break
      workingHours: '09:00 AM - 05:00 PM',
      breakTime: '01:00 PM - 02:00 PM',
      maxPatientsPerDay: 25,
      currentWorkloadCount: 8,
      workloadLevel: 'Medium',
      consultationDurationMin: 12,
      emergencySlotsReserved: 3,
      emergencySlotsUsed: 1,
      timeSlots: ['09:30 AM', '10:00 AM', '10:30 AM', '11:30 AM', '02:30 PM', '03:30 PM']
    },
    {
      id: 2,
      name: 'Dr. Kavitha M.',
      specialty: 'Obstetrics & Gynecology',
      department: 'Obstetrics & Gynecology',
      clinic: 'District General Hospital & CHC',
      status: 'Available',
      workingHours: '09:00 AM - 04:00 PM',
      breakTime: '01:00 PM - 02:00 PM',
      maxPatientsPerDay: 20,
      currentWorkloadCount: 18,
      workloadLevel: 'High',
      consultationDurationMin: 15,
      emergencySlotsReserved: 2,
      emergencySlotsUsed: 0,
      timeSlots: ['11:00 AM', '11:30 AM', '03:00 PM']
    },
    {
      id: 3,
      name: 'Dr. Anjaneyulu',
      specialty: 'Pediatrics & Child Care',
      department: 'Pediatrics & Child Health',
      clinic: 'Community Health Clinic #4',
      status: 'Limited',
      workingHours: '10:00 AM - 04:00 PM',
      breakTime: '01:30 PM - 02:30 PM',
      maxPatientsPerDay: 15,
      currentWorkloadCount: 5,
      workloadLevel: 'Low',
      consultationDurationMin: 10,
      emergencySlotsReserved: 2,
      emergencySlotsUsed: 0,
      timeSlots: ['10:30 AM', '11:30 AM', '02:00 PM']
    },
    {
      id: 4,
      name: 'Dr. V. Rao',
      specialty: 'Community Health & Tele-consultant',
      department: 'General Medicine',
      clinic: 'District Tele-Medicine Center',
      status: 'Available',
      workingHours: '08:00 AM - 08:00 PM (24/7 Shift)',
      breakTime: '02:00 PM - 03:00 PM',
      maxPatientsPerDay: 40,
      currentWorkloadCount: 6,
      workloadLevel: 'Low',
      consultationDurationMin: 10,
      emergencySlotsReserved: 5,
      emergencySlotsUsed: 2,
      timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '04:00 PM', '06:00 PM']
    }
  ]);

  // Update doctor availability status
  const updateDoctorStatus = (doctorId, newStatus) => {
    setDoctors(prev => prev.map(doc => doc.id === doctorId ? { ...doc, status: newStatus } : doc));
  };

  // Update doctor schedule config
  const updateDoctorSchedule = (doctorId, updatedFields) => {
    setDoctors(prev => prev.map(doc => doc.id === doctorId ? { ...doc, ...updatedFields } : doc));
  };

  // 2. Live Patient Queue & Token System
  const [liveQueue, setLiveQueue] = useState([
    { token: 'A-23', patientName: 'Ramesh Kumar', doctorId: 1, doctorName: 'Dr. S. Reddy', status: 'Consulting', position: 0, estWaitMin: 0 },
    { token: 'A-24', patientName: 'Sunita Devi', doctorId: 1, doctorName: 'Dr. S. Reddy', status: 'Waiting', position: 1, estWaitMin: 12 },
    { token: 'A-25', patientName: 'Venkatesh K.', doctorId: 1, doctorName: 'Dr. S. Reddy', status: 'Waiting', position: 2, estWaitMin: 24 },
    { token: 'A-26', patientName: 'Anitha B.', doctorId: 1, doctorName: 'Dr. S. Reddy', status: 'Waiting', position: 3, estWaitMin: 36 },
    { token: 'A-27', patientName: 'Lakshmi Devi', doctorId: 1, doctorName: 'Dr. S. Reddy', status: 'Waiting', position: 4, estWaitMin: 48 }
  ]);

  // Advance live queue (Next patient consulting)
  const advanceDoctorQueue = (doctorId) => {
    setLiveQueue(prev => {
      const docQueue = prev.filter(q => q.doctorId === doctorId && q.status !== 'Completed');
      if (docQueue.length === 0) return prev;

      let consultingIndex = prev.findIndex(q => q.doctorId === doctorId && q.status === 'Consulting');
      let nextIndex = prev.findIndex(q => q.doctorId === doctorId && q.status === 'Waiting');

      return prev.map((q, idx) => {
        if (idx === consultingIndex) return { ...q, status: 'Completed', position: -1, estWaitMin: 0 };
        if (idx === nextIndex) return { ...q, status: 'Consulting', position: 0, estWaitMin: 0 };
        if (q.doctorId === doctorId && q.status === 'Waiting') return { ...q, position: Math.max(0, q.position - 1), estWaitMin: Math.max(0, q.estWaitMin - 12) };
        return q;
      });
    });
  };

  // 3. Digital Prescriptions & Visual Referral Tracker
  const [referrals, setReferrals] = useState([
    {
      id: 'REF-901',
      patientName: 'Ramesh Kumar',
      referringFacility: 'Ramapuram Primary Health Center (PHC)',
      specialistHospital: 'District Area Hospital & Trauma Center',
      specialtyRequired: 'Cardiology Specialist Evaluation',
      status: 'Appointment Scheduled',
      timeline: [
        { title: 'PHC Triage', date: '2026-09-01', completed: true },
        { title: 'Referral Created', date: '2026-09-02', completed: true },
        { title: 'Specialist Hospital Assigned', date: '2026-09-05', completed: true },
        { title: 'Appointment Scheduled', date: '2026-09-15', completed: true },
        { title: 'Consultation & Completion', date: 'Pending', completed: false }
      ]
    }
  ]);

  const [prescriptions, setPrescriptions] = useState([
    {
      id: 'RX-401',
      patientName: 'Ramesh Kumar',
      doctorName: 'Dr. S. Reddy',
      date: '2026-09-05',
      diagnosis: 'Acute Upper Respiratory Tract Infection',
      medicines: [
        { name: 'Paracetamol 500mg', dosage: '1 tablet after food', duration: '5 days' },
        { name: 'Amoxicillin 500mg', dosage: '1 tablet twice daily', duration: '5 days' },
        { name: 'ORS Oral Rehydration Salts', dosage: '1 sachet in 1L water', duration: 'As needed' }
      ],
      notes: 'Drink boiled water and rest for 3 days.'
    }
  ]);

  // 4. Empanelled Pharmacies & Rural Health Camps Registry
  const pharmacies = [
    { name: 'Jan Aushadhi Kendra #104', location: 'Near PHC Ramapuram', distance: '1.2 km', phone: '08572-224411', isGovernment: true },
    { name: 'Sanjivani Medicos & Generic Store', location: 'Main Bus Stand', distance: '2.5 km', phone: '08572-223399', isGovernment: false },
    { name: 'Apollo Pharmacy Rural Express', location: 'Station Road', distance: '3.8 km', phone: '08572-229988', isGovernment: false }
  ];

  const healthCamps = [
    { id: 1, title: 'Free Mega Eye Screening & Cataract Camp', date: '2026-09-20', time: '09:00 AM - 03:00 PM', location: 'Ramapuram Community Hall', category: 'Eye Care', distance: '1.5 km', org: 'District Blindness Control Society' },
    { id: 2, title: 'Maternal & Child Immunization Drive', date: '2026-09-22', time: '10:00 AM - 02:00 PM', location: 'PHC Sector 4 Clinic', category: 'Children & Women', distance: '2.0 km', org: 'National Health Mission (NHM)' },
    { id: 3, title: 'Diabetes & Hypertension Screening Camp', date: '2026-09-25', time: '08:30 AM - 01:00 PM', location: 'Mandal Parishad School', category: 'General NCD', distance: '3.1 km', org: 'RuralCare Health Initiative' }
  ];

  return (
    <HealthPlatformContext.Provider value={{
      isOffline,
      doctors,
      updateDoctorStatus,
      updateDoctorSchedule,
      liveQueue,
      advanceDoctorQueue,
      referrals,
      prescriptions,
      pharmacies,
      healthCamps
    }}>
      {children}
    </HealthPlatformContext.Provider>
  );
};
