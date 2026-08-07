import nodemailer from 'nodemailer';
import env from '../config/env.config.js';

const SMTP_HOST = 'smtp.gmail.com';
const SMTP_PORT = 465;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
  connectionTimeout: 30_000,
  greetingTimeout: 30_000,
  socketTimeout: 60_000,
});

export const sendEmail = async (to, subject, html) => {
  console.info('[email] sendEmail started', {
    emailUser: env.EMAIL_USER,
    smtpHost: SMTP_HOST,
    smtpPort: SMTP_PORT,
  });

  try {
    console.log('sendMail start');
    const result = await transporter.sendMail({
      from: `"Sellora" <${env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('sendMail done', { messageId: result.messageId });
    console.info('[email] sendEmail completed');
  } catch (error) {
    console.error('[email] transporter.sendMail failed', error);
    throw error;
  }
};
