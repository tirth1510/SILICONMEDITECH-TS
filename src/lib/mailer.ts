import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (mailOptions: MailOptions) => {
  try {
    await transporter.sendMail({
      from: `"Silicon Meditech" <${process.env.SMTP_USER}>`,
      ...mailOptions,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email sending failed');
  }
};
