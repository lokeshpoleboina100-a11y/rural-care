/**
 * Decoupled Appointment Notification Service Architecture
 * Supports free email notifications (via Netlify Serverless Function / Resend / EmailJS)
 */

export async function sendAppointmentNotification(appointmentData) {
  console.log('[NotificationService] Preparing email notification for appointment:', appointmentData);

  const payload = {
    patient_name: appointmentData.patientName || 'Patient',
    patient_email: appointmentData.patientEmail || 'patient@ruralcare.in',
    doctor_name: appointmentData.doctorName || 'Doctor',
    hospital_name: appointmentData.clinic || 'RuralCare Health Center',
    appointment_date: appointmentData.date,
    time_slot: appointmentData.timeSlot,
    token: appointmentData.token,
    status: appointmentData.status || 'pending',
    timestamp: new Date().toISOString()
  };

  try {
    // Call Netlify Function endpoint for serverless email dispatch
    const response = await fetch('/.netlify/functions/send-appointment-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('[NotificationService] Email notification dispatched successfully:', result);
      return { success: true, method: 'netlify-function', result };
    } else {
      console.warn('[NotificationService] Netlify function returned status:', response.status);
      return { success: false, fallback: 'local-log', message: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.warn('[NotificationService] Network/Offline fallback:', error.message);
    return { success: false, fallback: 'local-log', error: error.message };
  }
}
