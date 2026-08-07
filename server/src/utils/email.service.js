import nodemailer from 'nodemailer';
import env from '../config/env.config.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: false,
  requireTLS: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  family: 4,
});

export const sendEmail = async (to, subject, html) => {
  try {
    const result = await transporter.sendMail({
      from: `"Sellora" <${env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });

    console.info('[email] Email sent', {
      messageId: result.messageId,
    });

    return result;
  } catch (error) {
    console.error('[email] sendEmail failed', {
      code: error.code,
      message: error.message,
    });

    throw error;
  }
};
