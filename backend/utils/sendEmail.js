// utils/sendEmail.js
import transporter from "../config/nodemailer.js"; // <-- your file with nodemailer createTransport

export default async function sendEmail({ to, subject, html, text }) {
  if (!to) throw new Error("Missing 'to' email");
  await transporter.sendMail({
    from: process.env.MAIL_FROM || '"Bella Closet" <no-reply@bellacloset.com>',
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  });
}
