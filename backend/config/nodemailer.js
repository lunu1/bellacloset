import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587, // Use 465 for SSL if needed
  secure: false, // Set to true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // 👈 Bypass self-signed certificate errors
  },
});

export default transporter;
