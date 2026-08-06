import nodemailer from 'nodemailer';
import env from '../config/env.config.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Sellora" <${env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
