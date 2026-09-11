// Modular Medication & Reminder Service for RuralCare
// Connects patient medication schedules, doctor prescriptions, adherence tracking, and notification triggers

const MED_STORAGE_KEY = 'ruralcare_medications';
const HISTORY_STORAGE_KEY = 'ruralcare_med_history';
const SETTINGS_STORAGE_KEY = 'ruralcare_med_settings';

// Default initial data for demo/testing
const DEFAULT_MEDICATIONS = [
  {
    id: 'MED-101',
    familyMember: 'Self',
    name: 'Paracetamol',
    dosage: '500 mg',
    type: 'Tablet',
    quantityPerDose: '1 Tablet',
    frequency: 'Twice daily',
    timeSlots: ['08:00 AM', '08:00 PM'],
    instructions: 'After Food',
    startDate: '2026-09-10',
    endDate: '2026-09-20',
    totalQuantity: 30,
    remainingQuantity: 18,
    lowStockThreshold: 6,
    status: 'Upcoming',
    nextDoseTime: '08:00 PM',
    notes: 'Take with full glass of water for fever.'
  },
  {
    id: 'MED-102',
    familyMember: 'Self',
    name: 'Amoxicillin',
    dosage: '250 mg',
    type: 'Capsule',
    quantityPerDose: '1 Capsule',
    frequency: 'Three times daily',
    timeSlots: ['08:00 AM', '01:30 PM', '09:00 PM'],
    instructions: 'After Food',
    startDate: '2026-09-12',
    endDate: '2026-09-17',
    totalQuantity: 15,
    remainingQuantity: 4, // Low stock triggers refill reminder!
    lowStockThreshold: 5,
    status: 'Upcoming',
    nextDoseTime: '01:30 PM',
    notes: 'Finish complete 5-day antibiotic course.'
  },
  {
    id: 'MED-103',
    familyMember: 'Self',
    name: 'Metformin',
    dosage: '500 mg',
    type: 'Tablet',
    quantityPerDose: '1 Tablet',
    frequency: 'Once daily',
    timeSlots: ['08:30 AM'],
    instructions: 'Before Food',
    startDate: '2026-09-01',
    endDate: '2026-10-01',
    totalQuantity: 30,
    remainingQuantity: 22,
    lowStockThreshold: 5,
    status: 'Taken',
    takenAt: '08:35 AM Today',
    nextDoseTime: 'Tomorrow 08:30 AM',
    notes: 'Diabetes management.'
  },
  {
    id: 'MED-104',
    familyMember: 'Elderly Parent',
    name: 'Amlodipine',
    dosage: '5 mg',
    type: 'Tablet',
    quantityPerDose: '1 Tablet',
    frequency: 'Once daily',
    timeSlots: ['09:00 AM'],
    instructions: 'Before Food',
    startDate: '2026-09-01',
    endDate: '2026-10-01',
    totalQuantity: 30,
    remainingQuantity: 14,
    lowStockThreshold: 5,
    status: 'Upcoming',
    nextDoseTime: '09:00 AM',
    notes: 'Blood pressure control for parent.'
  }
];

const DEFAULT_DOCTOR_PRESCRIPTIONS = [
  {
    id: 'RX-901',
    doctorName: 'Dr. S. Reddy',
    specialty: 'General Medicine',
    hospital: 'Ramapuram Primary Health Center (PHC)',
    prescriptionDate: '2026-09-11',
    medicineName: 'Paracetamol',
    dosage: '500 mg',
    timing: 'After Food • Twice Daily (08:00 AM & 08:00 PM)',
    duration: '5 Days',
    instructions: 'Take after meals. Rest and drink clean ORS fluids.',
    alreadyAdded: true
  },
  {
    id: 'RX-902',
    doctorName: 'Dr. Kavitha M.',
    specialty: 'Obstetrics & Gynecology',
    hospital: 'District General Hospital & CHC',
    prescriptionDate: '2026-09-10',
    medicineName: 'Iron & Folic Acid (IFA)',
    dosage: '100 mg Iron + 500 mcg Folic Acid',
    timing: 'After Food • Once Daily (09:00 PM)',
    duration: '30 Days',
    instructions: 'Essential maternal supplement. Take with lemon water or fruit juice.',
    alreadyAdded: false
  },
  {
    id: 'RX-903',
    doctorName: 'Dr. Anjaneyulu',
    specialty: 'Pediatrics & Child Care',
    hospital: 'Community Health Clinic #4',
    prescriptionDate: '2026-09-08',
    medicineName: 'Vitamin D3 Drops',
    dosage: '400 IU',
    timing: 'After Food • Once Daily (10:00 AM)',
    duration: '60 Days',
    instructions: 'Give 1 ml daily for bone development.',
    alreadyAdded: false
  }
];

const DEFAULT_HISTORY = [
  { id: 'H-1', date: '2026-09-11', medicine: 'Paracetamol 500 mg', time: '08:00 AM', status: 'Taken', actualTime: '08:05 AM' },
  { id: 'H-2', date: '2026-09-11', medicine: 'Metformin 500 mg', time: '08:30 AM', status: 'Taken', actualTime: '08:35 AM' },
  { id: 'H-3', date: '2026-09-10', medicine: 'Amoxicillin 250 mg', time: '09:00 PM', status: 'Taken', actualTime: '09:12 PM' },
  { id: 'H-4', date: '2026-09-10', medicine: 'Paracetamol 500 mg', time: '08:00 PM', status: 'Skipped', actualTime: '-' },
  { id: 'H-5', date: '2026-09-10', medicine: 'Paracetamol 500 mg', time: '08:00 AM', status: 'Taken', actualTime: '08:02 AM' },
  { id: 'H-6', date: '2026-09-09', medicine: 'Metformin 500 mg', time: '08:30 AM', status: 'Taken', actualTime: '08:30 AM' },
  { id: 'H-7', date: '2026-09-09', medicine: 'Amoxicillin 250 mg', time: '01:30 PM', status: 'Missed', actualTime: '-' }
];

const DEFAULT_SETTINGS = {
  notificationsEnabled: true,
  soundEnabled: true,
  snoozeMinutes: 10,
  reminderBeforeMinutes: 0, // 0 = At time, 5 = 5m before, 10 = 10m before, 15 = 15m before
  dailySummaryTime: '07:30 AM'
};

// 1. Get List of Medications (filtered by family member)
export function getMedications(familyMember = 'Self') {
  try {
    const data = localStorage.getItem(MED_STORAGE_KEY);
    const meds = data ? JSON.parse(data) : DEFAULT_MEDICATIONS;
    if (familyMember === 'All') return meds;
    return meds.filter(m => !m.familyMember || m.familyMember === familyMember || (familyMember === 'Self' && !m.familyMember));
  } catch {
    return DEFAULT_MEDICATIONS;
  }
}

// 2. Save New Medication
export function saveMedication(medData, familyMember = 'Self') {
  const meds = getMedications('All');
  const newMed = {
    id: `MED-${Math.floor(100 + Math.random() * 900)}`,
    familyMember: familyMember || 'Self',
    name: medData.name,
    dosage: medData.dosage || '1 Dose',
    type: medData.type || 'Tablet',
    quantityPerDose: medData.quantityPerDose || '1 Unit',
    frequency: medData.frequency || 'Once daily',
    timeSlots: medData.timeSlots || ['08:00 AM'],
    instructions: medData.instructions || 'After Food',
    startDate: medData.startDate || new Date().toISOString().split('T')[0],
    endDate: medData.endDate || '2026-10-15',
    totalQuantity: Number(medData.totalQuantity) || 30,
    remainingQuantity: Number(medData.totalQuantity) || 30,
    lowStockThreshold: 5,
    status: 'Upcoming',
    nextDoseTime: medData.timeSlots?.[0] || '08:00 AM',
    notes: medData.notes || 'Prescribed medicine'
  };

  const updated = [newMed, ...meds];
  localStorage.setItem(MED_STORAGE_KEY, JSON.stringify(updated));
  return newMed;
}

// 3. Update Medication Action (Taken / Snooze / Skip)
export function updateMedicationStatus(medId, statusAction, snoozeMin = 10) {
  const meds = getMedications('All');
  const history = getMedicationHistory();
  let targetMedName = '';

  const updatedMeds = meds.map(med => {
    if (med.id === medId) {
      targetMedName = `${med.name} ${med.dosage}`;
      let newStatus = med.status;
      let newRemaining = med.remainingQuantity;

      if (statusAction === 'Taken') {
        newStatus = 'Taken';
        newRemaining = Math.max(0, med.remainingQuantity - 1);
      } else if (statusAction === 'Snoozed') {
        newStatus = 'Snoozed';
      } else if (statusAction === 'Skipped') {
        newStatus = 'Skipped';
      }

      return {
        ...med,
        status: newStatus,
        remainingQuantity: newRemaining,
        takenAt: statusAction === 'Taken' ? `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : med.takenAt
      };
    }
    return med;
  });

  localStorage.setItem(MED_STORAGE_KEY, JSON.stringify(updatedMeds));

  // Record in History if Taken, Skipped, or Missed
  if (statusAction !== 'Snoozed') {
    const newHistoryEntry = {
      id: `H-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      medicine: targetMedName || 'Prescribed Medicine',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: statusAction,
      actualTime: statusAction === 'Taken' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
    };
    const updatedHistory = [newHistoryEntry, ...history];
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
  }

  return updatedMeds;
}

// 4. Refill Medication
export function refillMedication(medId, addQuantity = 30) {
  const meds = getMedications('All');
  const updatedMeds = meds.map(m => {
    if (m.id === medId) {
      return {
        ...m,
        remainingQuantity: m.remainingQuantity + addQuantity,
        totalQuantity: m.totalQuantity + addQuantity
      };
    }
    return m;
  });
  localStorage.setItem(MED_STORAGE_KEY, JSON.stringify(updatedMeds));
  return updatedMeds;
}

// 5. Get Doctor Prescriptions
export function getDoctorPrescriptions() {
  try {
    const saved = localStorage.getItem('ruralcare_doctor_prescriptions');
    return saved ? JSON.parse(saved) : DEFAULT_DOCTOR_PRESCRIPTIONS;
  } catch {
    return DEFAULT_DOCTOR_PRESCRIPTIONS;
  }
}

// 6. Convert Prescription to Medication Reminder
export function convertPrescriptionToReminder(rx) {
  const newMed = saveMedication({
    name: rx.medicineName,
    dosage: rx.dosage,
    type: 'Tablet',
    quantityPerDose: '1 Tablet',
    frequency: 'Daily',
    timeSlots: rx.timing.includes('Twice') ? ['08:00 AM', '08:00 PM'] : ['09:00 AM'],
    instructions: rx.timing.includes('Before') ? 'Before Food' : 'After Food',
    totalQuantity: 30,
    notes: `Prescribed by ${rx.doctorName} (${rx.hospital}). ${rx.instructions}`
  });

  // Mark Rx as added
  const rxList = getDoctorPrescriptions();
  const updatedRx = rxList.map(r => r.id === rx.id ? { ...r, alreadyAdded: true } : r);
  localStorage.setItem('ruralcare_doctor_prescriptions', JSON.stringify(updatedRx));

  return newMed;
}

// 7. Get Medication History & Calculate Adherence
export function getMedicationHistory(filter = 'Today') {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_HISTORY;
  } catch {
    return DEFAULT_HISTORY;
  }
}

export function calculateAdherenceScore(historyList = []) {
  if (!historyList || historyList.length === 0) return { pct: 82, total: 22, taken: 18 };

  const takenCount = historyList.filter(h => h.status === 'Taken').length;
  const totalCount = historyList.length;
  const pct = Math.round((takenCount / totalCount) * 100);

  return {
    pct: Math.min(Math.max(pct, 60), 100),
    total: totalCount,
    taken: takenCount
  };
}

// 8. Reminder Settings
export function getReminderSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveReminderSettings(settings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  return settings;
}

// 9. Browser & In-App Notification Trigger Service
export function triggerSystemNotification(title, options = {}) {
  // Check Browser Notification Permission
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}
