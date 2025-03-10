// emailService.js
const nodemailer = require('nodemailer');
const config = require('../config/config.js');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');
const httpStatus = require('../utils/httpStatus');

let transporter;

const initializeEmailService = async () => {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  try {
    await transporter.verify();
    logger.info('Email service initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize email service:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Email service initialization failed');
  }
};

const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Email service not initialized');
  }

  const mailOptions = {
    from: config.email.from,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send email');
  }
};

const sendPasswordResetEmail = async (to, resetToken) => {
  const subject = '重設你的帳戶密碼';
  const resetUrl = `${config.clientUrl}/resetpassword?token=${resetToken}`;
  const html = `
    <p>你好, <br><br></p>
    <p>你可以在1小時內，使用以下的連結去重設你的帳戶密碼:</p>
    <a href="${resetUrl}">重設密碼</a>
    <p><br><br>謝謝</p>
  `;

  await sendEmail(to, subject, html);
};

const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `${config.clientUrl}/users/emailverification?token=${token}`;
  
  const mailOptions = {
    from: config.email.from,
    to,
    subject: 'Confirm your account by E-mail',
    html: `
      <p>Hi there, <br><br></p>
      <p>Please click on the link below to confirm your account registration:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p><br><br>Thank you</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  initializeEmailService,
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
};
