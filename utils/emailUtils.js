/**
 * Email utility functions for sending notifications
 * Note: This is a placeholder implementation. In production,
 * you would use a service like SendGrid, Mailgun, AWS SES, etc.
 */

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise<boolean>} - Success status
 */
exports.sendEmail = async (options) => {
  // In production, replace with actual email service implementation
  // For now, we'll just log the email details
  console.log('Email would be sent with the following details:');
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Text: ${options.text.substring(0, 100)}...`);
  
  // Simulate successful email sending
  return true;
};

/**
 * Send booking confirmation email
 * @param {Object} user - User object
 * @param {Object} booking - Booking object
 * @param {Object} turf - Turf object
 * @returns {Promise<boolean>} - Success status
 */
exports.sendBookingConfirmation = async (user, booking, turf) => {
  const subject = `TurfX Booking Confirmation - ${booking._id}`;
  
  const text = `
    Dear ${user.name},
    
    Your booking at ${turf.name} has been confirmed.
    
    Booking Details:
    - Date: ${new Date(booking.bookingDate).toDateString()}
    - Time: ${booking.startTime} to ${booking.endTime}
    - Duration: ${booking.duration} hours
    - Price: ₹${booking.price}
    
    Turf Address: ${turf.address}
    
    Thank you for choosing TurfX!
    
    Regards,
    TurfX Team
  `;
  
  return exports.sendEmail({
    to: user.email,
    subject,
    text,
    html: text.replace(/\n/g, '<br>')
  });
};

/**
 * Send payment confirmation email
 * @param {Object} user - User object
 * @param {Object} payment - Payment object
 * @param {Object} booking - Booking object
 * @param {Object} turf - Turf object
 * @returns {Promise<boolean>} - Success status
 */
exports.sendPaymentConfirmation = async (user, payment, booking, turf) => {
  const subject = `TurfX Payment Confirmation - ${payment._id}`;
  
  const text = `
    Dear ${user.name},
    
    Your payment for booking at ${turf.name} has been confirmed.
    
    Payment Details:
    - Amount: ₹${payment.amount}
    - Payment ID: ${payment.paymentGatewayId}
    - Payment Date: ${new Date(payment.paymentDate).toDateString()}
    
    Booking Details:
    - Date: ${new Date(booking.bookingDate).toDateString()}
    - Time: ${booking.startTime} to ${booking.endTime}
    
    Thank you for choosing TurfX!
    
    Regards,
    TurfX Team
  `;
  
  return exports.sendEmail({
    to: user.email,
    subject,
    text,
    html: text.replace(/\n/g, '<br>')
  });
};

/**
 * Send booking cancellation email
 * @param {Object} user - User object
 * @param {Object} booking - Booking object
 * @param {Object} turf - Turf object
 * @param {number} refundAmount - Refund amount (if any)
 * @returns {Promise<boolean>} - Success status
 */
exports.sendCancellationEmail = async (user, booking, turf, refundAmount = 0) => {
  const subject = `TurfX Booking Cancellation - ${booking._id}`;
  
  let refundText = '';
  if (refundAmount > 0) {
    refundText = `A refund of ₹${refundAmount} has been initiated and will be credited to your account within 5-7 business days.`;
  }
  
  const text = `
    Dear ${user.name},
    
    Your booking at ${turf.name} has been cancelled.
    
    Booking Details:
    - Date: ${new Date(booking.bookingDate).toDateString()}
    - Time: ${booking.startTime} to ${booking.endTime}
    - Cancellation Reason: ${booking.cancellationReason || 'User requested'}
    
    ${refundText}
    
    We hope to see you again soon!
    
    Regards,
    TurfX Team
  `;
  
  return exports.sendEmail({
    to: user.email,
    subject,
    text,
    html: text.replace(/\n/g, '<br>')
  });
};

/**
 * Send team invitation email
 * @param {string} email - Recipient email
 * @param {Object} team - Team object
 * @param {Object} captain - Captain user object
 * @returns {Promise<boolean>} - Success status
 */
exports.sendTeamInvitation = async (email, team, captain) => {
  const subject = `TurfX Team Invitation - ${team.name}`;
  
  const text = `
    Hello,
    
    You have been invited to join the cricket team "${team.name}" by ${captain.name}.
    
    Team Details:
    - Name: ${team.name}
    - Captain: ${captain.name}
    - Description: ${team.description || 'No description provided'}
    
    To accept this invitation, please log in to your TurfX account and visit the team page.
    
    Regards,
    TurfX Team
  `;
  
  return exports.sendEmail({
    to: email,
    subject,
    text,
    html: text.replace(/\n/g, '<br>')
  });
};