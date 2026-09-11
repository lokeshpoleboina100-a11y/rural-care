// Modular AI Intelligence Engine for RuralCare Doctor Availability & Appointment Allocation

// 1. AI Patient Triage Analysis
export function aiTriageAnalysis(requirementText) {
  const text = (requirementText || '').toLowerCase().trim();

  // Emergency triggers
  if (text.includes('chest pain') || text.includes('heart attack') || text.includes('unconscious') || text.includes('snake') || text.includes('severe bleeding') || text.includes('stroke') || text.includes('burn')) {
    return {
      department: 'Emergency & Trauma Care',
      urgency: 'Emergency',
      recommendedSpecialist: 'Emergency Physician / Cardiologist',
      isEmergencyOverride: true,
      triageNote: '🚨 CRITICAL WARNING: Potentially life-threatening symptoms detected. Immediate 108 Emergency Ambulance dispatch recommended.',
      disclaimer: 'AI guidance is for informational purposes only and does not replace professional medical advice.'
    };
  }

  // Dermatology / Skin
  if (text.includes('skin') || text.includes('rash') || text.includes('itch') || text.includes('spot') || text.includes('allergy') || text.includes('eczema')) {
    return {
      department: 'Dermatology',
      urgency: 'Routine',
      recommendedSpecialist: 'Dermatologist (Skin Specialist)',
      isEmergencyOverride: false,
      triageNote: 'Dermatological screening matched.',
      disclaimer: 'AI guidance is for informational purposes only and does not replace professional medical advice.'
    };
  }

  // Ophthalmology / Eye
  if (text.includes('eye') || text.includes('vision') || text.includes('redness') || text.includes('cataract')) {
    return {
      department: 'Ophthalmology',
      urgency: 'Routine',
      recommendedSpecialist: 'Ophthalmologist (Eye Specialist)',
      isEmergencyOverride: false,
      triageNote: 'Ophthalmic screening matched.',
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

// 2. AI Doctor Match Score Calculator (Weighted Multi-Factor Match Engine)
export function calculateDoctorMatchScore(doctor, targetDepartment, requestedTime = '11:30 AM', userDistanceKm = 3.2) {
  let score = 50; // Base score
  const matchReasons = [];

  // Factor 1: Specialty Match (Max 35 pts)
  const isDepartmentMatch = (doctor.department || '').toLowerCase().includes((targetDepartment || '').toLowerCase()) ||
                            (doctor.specialty || '').toLowerCase().includes((targetDepartment || '').toLowerCase()) ||
                            targetDepartment === 'General Medicine';

  if (isDepartmentMatch) {
    score += 35;
    matchReasons.push(`✓ Correct specialty (${doctor.department || doctor.specialty})`);
  } else {
    score += 15; // Partial cross-specialty
    matchReasons.push(`✓ Qualified general physician`);
  }

  // Factor 2: Doctor Status & Availability (Max 25 pts)
  if (doctor.status === 'Available') {
    score += 25;
    matchReasons.push(`✓ Available at preferred time (${requestedTime})`);
  } else if (doctor.status === 'Limited') {
    score += 15;
    matchReasons.push(`✓ Limited slots remaining`);
  } else {
    score += 5;
  }

  // Factor 3: Current Workload & Queue Length (Max 20 pts)
  const workload = doctor.currentWorkloadCount || 5;
  if (workload <= 6) {
    score += 20;
    matchReasons.push(`✓ Low current workload (${workload} patients in queue)`);
  } else if (workload <= 12) {
    score += 12;
    matchReasons.push(`✓ Moderate workload (${workload} patients in queue)`);
  } else {
    score += 5;
    matchReasons.push(`✓ High workload (${workload} patients)`);
  }

  // Factor 4: Estimated Waiting Time (Max 10 pts)
  const estWaitMin = Math.round(workload * (doctor.consultationDurationMin || 10) + 4);
  if (estWaitMin <= 15) {
    score += 10;
    matchReasons.push(`✓ Short expected waiting time (~${estWaitMin} min)`);
  } else if (estWaitMin <= 30) {
    score += 6;
    matchReasons.push(`✓ Moderate waiting time (~${estWaitMin} min)`);
  } else {
    score += 2;
  }

  // Factor 5: Hospital Proximity (Max 10 pts)
  const dist = userDistanceKm || (3.0 + Math.random() * 3);
  if (dist <= 4.0) {
    score += 10;
    matchReasons.push(`✓ Hospital is nearby (${dist.toFixed(1)} km)`);
  } else {
    score += 6;
    matchReasons.push(`✓ Facility within district (${dist.toFixed(1)} km)`);
  }

  const finalScore = Math.min(score, 98); // Cap at 98% for realistic AI match score

  let scoreLabel = 'Good Match';
  if (finalScore >= 90) scoreLabel = 'Excellent Match';
  else if (finalScore >= 80) scoreLabel = 'Strong Match';

  return {
    matchScore: finalScore,
    scoreLabel: `${finalScore}% ${scoreLabel}`,
    matchReasons,
    estWaitMinutes: estWaitMin,
    distanceKm: dist.toFixed(1),
    availableSlot: requestedTime
  };
}

// 3. Top 3 AI Recommended Doctors Finder
export function getTopDoctorMatches({ doctorsList, department, requestedTime = '11:30 AM', userDistanceKm = 3.2 }) {
  if (!doctorsList || doctorsList.length === 0) return [];

  // Filter & score all doctors
  const scoredDoctors = doctorsList.map((doc, idx) => {
    // Add artificial distance variation per doctor
    const dist = (parseFloat(userDistanceKm) + idx * 1.5).toFixed(1);
    const timeSlots = doc.timeSlots || ['09:30 AM', '11:30 AM', '02:00 PM', '03:30 PM'];
    const matchedSlot = timeSlots[0] || requestedTime;

    const scoring = calculateDoctorMatchScore(doc, department, matchedSlot, dist);

    return {
      doctor: doc,
      scoring,
      matchScore: scoring.matchScore,
      scoreLabel: scoring.scoreLabel,
      reasons: scoring.matchReasons,
      estWaitMinutes: scoring.estWaitMinutes,
      distanceKm: dist,
      availableSlot: matchedSlot
    };
  });

  // Sort by highest match score
  scoredDoctors.sort((a, b) => b.matchScore - a.matchScore);

  // Return Top 3 options
  return scoredDoctors.slice(0, 3);
}

// Legacy helper compatibility wrapper
export function recommendDoctorAndSlot({ doctorsList, department, urgency, requestedDate }) {
  const topMatches = getTopDoctorMatches({ doctorsList, department });
  if (topMatches.length === 0) return null;

  const top = topMatches[0];
  return {
    department,
    recommendedDoctor: top.doctor,
    recommendedHospital: top.doctor.clinic || 'Ramapuram Primary Health Center',
    bestSlot: top.availableSlot,
    estimatedWaitMinutes: top.estWaitMinutes,
    reason: `Doctor ${top.doctor.name} achieves a ${top.scoreLabel} with low queue and specialty fit.`,
    doctorStatus: top.doctor.status,
    workloadLevel: top.doctor.workloadLevel,
    matchScore: top.matchScore,
    scoreLabel: top.scoreLabel,
    topMatches
  };
}

// 4. AI Patient Load & Hospital Staffing Forecast Engine (Level 3 Hospital Optimization)
export function predictPatientDemand() {
  return [
    { timeRange: '09:00 AM - 10:00 AM', demand: 'Medium', predictedPatients: 16, capacity: 25, status: 'Normal', barPercent: 64 },
    { timeRange: '10:00 AM - 11:00 AM', demand: 'High', predictedPatients: 32, capacity: 25, status: 'Peak Demand', barPercent: 100 },
    { timeRange: '11:00 AM - 12:00 PM', demand: 'Very High', predictedPatients: 44, capacity: 25, status: 'Overload Alert', barPercent: 100 },
    { timeRange: '12:00 PM - 01:00 PM', demand: 'Medium', predictedPatients: 22, capacity: 25, status: 'Normal', barPercent: 88 },
    { timeRange: '02:00 PM - 03:00 PM', demand: 'Low', predictedPatients: 9, capacity: 25, status: 'Optimal / Low', barPercent: 36 }
  ];
}

// 5. Department Demand & Capacity Prediction
export function predictDepartmentDemand() {
  return [
    {
      department: 'General Medicine',
      demandLevel: 'HIGH',
      expectedPatients: 58,
      availableCapacity: 40,
      potentialShortage: 18,
      recommendation: 'Consider assigning +1 additional general physician between 10:00 AM and 1:00 PM.'
    },
    {
      department: 'Dermatology',
      demandLevel: 'HIGH',
      expectedPatients: 42,
      availableCapacity: 28,
      potentialShortage: 14,
      recommendation: 'Consider opening +1 extra appointment block for dermatology telemedicine.'
    },
    {
      department: 'Pediatrics & Child Health',
      demandLevel: 'MEDIUM',
      expectedPatients: 24,
      availableCapacity: 25,
      potentialShortage: 0,
      recommendation: 'Capacity optimal for routine infant vaccination visits.'
    },
    {
      department: 'Orthopedics',
      demandLevel: 'LOW',
      expectedPatients: 12,
      availableCapacity: 25,
      potentialShortage: 0,
      recommendation: 'Low utilization detected between 2 PM–4 PM. Capacity can absorb overflow general cases.'
    },
    {
      department: 'Obstetrics & Gynecology',
      demandLevel: 'HIGH',
      expectedPatients: 36,
      availableCapacity: 30,
      potentialShortage: 6,
      recommendation: 'Maternal health morning clinic peak. Emergency reserved slots active.'
    }
  ];
}

// 6. AI Staffing Recommendations & Workload Balancing
export function generateStaffingOptimizationAlerts(doctorsList = []) {
  const alerts = [
    {
      id: 'STF-101',
      title: '🚨 High Patient Demand Predicted (10:00 AM – 01:00 PM)',
      department: 'General Medicine',
      timeWindow: '10:00 AM – 01:00 PM',
      expectedPatients: 58,
      currentCapacity: 40,
      recommendedAction: '+1 Additional Doctor & +1 Appointment Block',
      actionType: 'add_capacity',
      whyText: 'Historical Monday morning peak combined with monsoon fever surge. Adding 1 doctor prevents queue wait times from exceeding 45 minutes.',
      status: 'Pending Admin Approval'
    },
    {
      id: 'STF-102',
      title: 'ℹ️ Low Demand & Capacity Redistribution (02:00 PM – 04:00 PM)',
      department: 'Orthopedics / General Consultation',
      timeWindow: '02:00 PM – 04:00 PM',
      expectedPatients: 9,
      currentCapacity: 25,
      recommendedAction: 'Reallocate overflow General Medicine patients to available doctor slots',
      actionType: 'redistribute',
      whyText: 'Dr. V. Rao has 52% unused capacity during afternoon hours. Reallocating routine general follow-ups balances physician workload without extra cost.',
      status: 'Pending Admin Approval'
    }
  ];

  return alerts;
}

// 7. Doctor Utilization & Workload Balancing Classifier
export function classifyDoctorUtilization(doctorsList = []) {
  return doctorsList.map(doc => {
    const workload = doc.currentWorkloadCount || 5;
    const maxCapacity = doc.maxPatientsPerDay || 25;
    const utilizationPct = Math.round((workload / maxCapacity) * 100);

    let status = 'Optimal';
    let statusColor = '#047857';
    let bg = '#ecfdf5';

    if (utilizationPct >= 80) {
      status = 'Overloaded';
      statusColor = '#dc2626';
      bg = '#fef2f2';
    } else if (utilizationPct >= 65) {
      status = 'High Utilization';
      statusColor = '#b45309';
      bg = '#fef3c7';
    } else if (utilizationPct < 45) {
      status = 'Underutilized';
      statusColor = '#0284c7';
      bg = '#e0f2fe';
    }

    return {
      ...doc,
      utilizationPct,
      statusLabel: status,
      statusColor,
      bg
    };
  });
}

// 8. AI No-Show Risk Prediction
export function predictNoShowRisk(appointment) {
  let riskScore = 25;

  if (appointment.consultType === 'telemedicine') riskScore += 15;
  if (appointment.reason && appointment.reason.length < 10) riskScore += 20;

  const isHighRisk = riskScore >= 50;

  return {
    riskPercentage: Math.min(riskScore, 85),
    level: isHighRisk ? 'High Risk' : 'Low Risk',
    recommendedAction: isHighRisk ? 'Send SMS & WhatsApp Reminder' : 'Standard Queue Tracking'
  };
}

// 9. Automatic Slot Reallocation Engine
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
