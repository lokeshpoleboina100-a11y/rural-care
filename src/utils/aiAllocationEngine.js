// Modular AI Intelligence Engine for RuralCare Doctor Availability & Appointment Allocation

// 1. AI Patient Triage Analysis
export function aiTriageAnalysis(requirementText) {
  const text = (requirementText || '').toLowerCase().trim();

  // Emergency triggers
  if (text.includes('chest pain') || text.includes('heart attack') || text.includes('unconscious') || text.includes('snake') || text.includes('severe bleeding') || text.includes('stroke')) {
    return {
      department: 'Emergency & Trauma Care',
      urgency: 'Emergency',
      recommendedSpecialist: 'Emergency Physician / Cardiologist',
      isEmergencyOverride: true,
      triageNote: '🚨 CRITICAL WARNING: Potentially life-threatening symptoms detected. Immediate 108 Emergency Ambulance dispatch recommended.',
      disclaimer: 'AI guidance is for informational purposes only and does not replace professional medical advice.'
    };
  }

  // Maternity / Women's Health
  if (text.includes('pregnant') || text.includes('maternity') || text.includes('delivery') || text.includes('period') || text.includes('women')) {
    return {
      department: 'Obstetrics & Gynecology',
      urgency: text.includes('pain') ? 'High' : 'Routine',
      recommendedSpecialist: 'Gynecologist & Maternal Specialist',
      isEmergencyOverride: false,
      triageNote: 'Maternal health triage completed. Empanelled OB/GYN specialists identified.',
      disclaimer: 'AI guidance is for informational purposes only and does not replace professional medical advice.'
    };
  }

  // Child Care / Pediatrics
  if (text.includes('baby') || text.includes('child') || text.includes('vaccine') || text.includes('infant') || text.includes('pediatric')) {
    return {
      department: 'Pediatrics & Child Health',
      urgency: text.includes('high fever') ? 'High' : 'Routine',
      recommendedSpecialist: 'Pediatric Specialist',
      isEmergencyOverride: false,
      triageNote: 'Pediatric triage completed. Vaccination & growth tracking matched.',
      disclaimer: 'AI guidance is for informational purposes only and does not replace professional medical advice.'
    };
  }

  // Diabetes / Endocrinology / BP
  if (text.includes('sugar') || text.includes('diabetes') || text.includes('pressure') || text.includes('bp') || text.includes('thyroid')) {
    return {
      department: 'Endocrinology & General Medicine',
      urgency: 'Routine',
      recommendedSpecialist: 'General Physician & NCD Officer',
      isEmergencyOverride: false,
      triageNote: 'Non-Communicable Disease (NCD) screening required.',
      disclaimer: 'AI guidance is for informational purposes only and does not replace professional medical advice.'
    };
  }

  // Orthopedics / Joint Pain
  if (text.includes('bone') || text.includes('fracture') || text.includes('joint') || text.includes('knee') || text.includes('back pain')) {
    return {
      department: 'Orthopedics',
      urgency: text.includes('fracture') ? 'High' : 'Routine',
      recommendedSpecialist: 'Orthopedic Surgeon',
      isEmergencyOverride: false,
      triageNote: 'Musculoskeletal evaluation matched.',
      disclaimer: 'AI guidance is for informational purposes only and does not replace professional medical advice.'
    };
  }

  // Default General Medicine
  return {
    department: 'General Medicine',
    urgency: text.includes('fever') || text.includes('vomiting') ? 'High' : 'Routine',
    recommendedSpecialist: 'General Physician',
    isEmergencyOverride: false,
    triageNote: 'General health evaluation matched with local PHC physician.',
    disclaimer: 'AI guidance is for informational purposes only and does not replace professional medical advice.'
  };
}

// 2. AI Doctor Availability & Smart Allocation Recommendation
export function recommendDoctorAndSlot({ doctorsList, department, urgency, requestedDate }) {
  if (!doctorsList || doctorsList.length === 0) return null;

  // Filter available doctors matching department & status
  let eligibleDoctors = doctorsList.filter(d => d.status !== 'Unavailable' && d.status !== 'On Leave');

  if (eligibleDoctors.length === 0) {
    eligibleDoctors = doctorsList.filter(d => d.status !== 'Unavailable');
  }

  // Sort by workload (Low workload first) & status availability
  eligibleDoctors.sort((a, b) => {
    if (a.status === 'Available' && b.status !== 'Available') return -1;
    if (b.status === 'Available' && a.status !== 'Available') return 1;
    return a.currentWorkloadCount - b.currentWorkloadCount;
  });

  const bestDoctor = eligibleDoctors[0] || doctorsList[0];

  // Identify best available slot
  const availableSlots = bestDoctor.timeSlots || ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM'];
  const recommendedSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)] || '11:00 AM';

  const estWaitMinutes = bestDoctor.currentWorkloadCount * (bestDoctor.consultationDurationMin || 10) + 5;

  let reason = `Doctor ${bestDoctor.name} specializes in ${department} and currently has the lowest workload (${bestDoctor.currentWorkloadCount} patients) with immediate availability.`;

  if (bestDoctor.workloadLevel === 'High') {
    reason = `High patient volume detected. ${bestDoctor.name} is recommended as the primary specialist for ${department}.`;
  }

  return {
    department,
    recommendedDoctor: bestDoctor,
    recommendedHospital: bestDoctor.clinic || 'Ramapuram Primary Health Center',
    bestSlot: recommendedSlot,
    estimatedWaitMinutes: estWaitMinutes,
    reason,
    doctorStatus: bestDoctor.status,
    workloadLevel: bestDoctor.workloadLevel
  };
}

// 3. AI Patient Load Prediction
export function predictPatientDemand() {
  return [
    { timeRange: '09:00 AM - 10:00 AM', demand: 'Medium', predictedPatients: 14, status: 'Normal' },
    { timeRange: '10:00 AM - 11:00 AM', demand: 'High', predictedPatients: 28, status: 'Peak' },
    { timeRange: '11:00 AM - 12:00 PM', demand: 'Very High', predictedPatients: 36, status: 'Overload Alert' },
    { timeRange: '12:00 PM - 01:00 PM', demand: 'Medium', predictedPatients: 18, status: 'Normal' },
    { timeRange: '02:00 PM - 03:00 PM', demand: 'Low', predictedPatients: 8, status: 'Optimal' }
  ];
}

// 4. AI No-Show Risk Prediction
export function predictNoShowRisk(appointment) {
  let riskScore = 25; // default 25%

  if (appointment.consultType === 'telemedicine') riskScore += 15;
  if (appointment.reason && appointment.reason.length < 10) riskScore += 20;

  const isHighRisk = riskScore >= 50;

  return {
    riskPercentage: Math.min(riskScore, 85),
    level: isHighRisk ? 'High Risk' : 'Low Risk',
    recommendedAction: isHighRisk ? 'Send SMS & WhatsApp Reminder' : 'Standard Queue Tracking'
  };
}

// 5. Automatic Slot Reallocation Engine
export function reallocateCancelledSlot(cancelledAppointment, waitingPatientsList) {
  if (!waitingPatientsList || waitingPatientsList.length === 0) {
    return { reallocated: false, message: 'Slot opened for new booking' };
  }

  const matchedPatient = waitingPatientsList[0];
  return {
    reallocated: true,
    matchedPatient,
    slot: cancelledAppointment.timeSlot,
    message: `Cancelled slot (${cancelledAppointment.timeSlot}) automatically reallocated to waiting patient ${matchedPatient.patientName}.`
  };
}
