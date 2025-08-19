// backend/services/email.service.js
import transporter from "../config/nodemailer.js";
import {
  orderConfirmationTemplate,
  orderCancelledTemplate,
} from "../templates/orderTemplates.js";

const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SENDER_EMAIL || "no-reply@yourshop.com";
const FROM_NAME  = process.env.FROM_NAME  || "BellaCloset";

export async function emailOrderConfirmed({ to, order, user }) {
  const { subject, html, text } = orderConfirmationTemplate({ order, user });
  return transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  });
}

export async function emailOrderCancelled({ to, order, user }) {
  const { subject, html, text } = orderCancelledTemplate({ order, user });
  return transporter.sendMail({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    text,
  });
}
