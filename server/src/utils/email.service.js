import nodemailer from 'nodemailer';
import env from '../config/env.config.js';

const SMTP_SERVICE = 'gmail';

const transporter = nodemailer.createTransport({
  service: SMTP_SERVICE,
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
    service: SMTP_SERVICE,
  });

  try {
    console.log('verify start', {
      emailUser: env.EMAIL_USER,
      service: SMTP_SERVICE,
    });
    await transporter.verify();
    console.log('verify done', {
      emailUser: env.EMAIL_USER,
      service: SMTP_SERVICE,
    });

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
    console.error('[email] transporter verification or send failed', error);
    throw error;
  }
};
