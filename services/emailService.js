const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Email templates
const emailTemplates = {
  applicationConfirmation: (candidateName, jobTitle) => ({
    subject: 'Application Submitted Successfully',
    html: `
      <h2>Dear ${candidateName},</h2>
      <p>Your application for the position of <strong>${jobTitle}</strong> has been received successfully.</p>
      <p>The employer will review your application and get back to you soon.</p>
      <p>Best regards,<br/>Job Portal Team</p>
    `
  }),

  applicationStatusUpdate: (candidateName, jobTitle, status) => ({
    subject: `Application Status Update - ${status}`,
    html: `
      <h2>Dear ${candidateName},</h2>
      <p>Your application status for <strong>${jobTitle}</strong> has been updated to: <strong>${status}</strong></p>
      <p>Please log in to your account to view more details.</p>
      <p>Best regards,<br/>Job Portal Team</p>
    `
  }),

  interviewScheduled: (candidateName, jobTitle, interviewDate, interviewTime) => ({
    subject: 'Interview Scheduled',
    html: `
      <h2>Dear ${candidateName},</h2>
      <p>Congratulations! Your interview for <strong>${jobTitle}</strong> has been scheduled.</p>
      <p><strong>Date:</strong> ${interviewDate}</p>
      <p><strong>Time:</strong> ${interviewTime}</p>
      <p>Please confirm your attendance by logging into your account.</p>
      <p>Best regards,<br/>Job Portal Team</p>
    `
  }),

  jobPosted: (employerName, jobTitle) => ({
    subject: 'Job Posted Successfully',
    html: `
      <h2>Dear ${employerName},</h2>
      <p>Your job posting for <strong>${jobTitle}</strong> has been published successfully.</p>
      <p>Candidates can now apply for this position through the platform.</p>
      <p>Best regards,<br/>Job Portal Team</p>
    `
  }),

  welcomeEmail: (userName, role) => ({
    subject: 'Welcome to Job Portal',
    html: `
      <h2>Welcome to Job Portal, ${userName}!</h2>
      <p>Your account as a <strong>${role}</strong> has been created successfully.</p>
      <p>You can now login and start using our platform.</p>
      <p>Best regards,<br/>Job Portal Team</p>
    `
  })
};

// Function to send email
const sendEmail = async (recipientEmail, templateKey, templateParams) => {
  try {
    if (!emailTemplates[templateKey]) {
      throw new Error(`Email template '${templateKey}' not found`);
    }

    const emailContent = emailTemplates[templateKey](...templateParams);

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@jobportal.com',
      to: recipientEmail,
      ...emailContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent:', result.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendEmail,
  emailTemplates
};