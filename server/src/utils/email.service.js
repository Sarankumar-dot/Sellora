import axios from 'axios';
import env from '../config/env.config.js';

export const sendEmail = async (to, subject, html) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: env.EMAIL_FROM_NAME,
          email: env.EMAIL_FROM,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': env.BREVO_API_KEY,
        },
        timeout: 30000,
      }
    );

    console.log('[email] Email sent', response.data);

    return response.data;
  } catch (error) {
    console.error('[email] Brevo API Error', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    throw error;
  }
};
