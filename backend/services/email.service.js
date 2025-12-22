// backend/services/email.service.js
import nodemailer from "nodemailer";

const {
  SMTP_HOST, SMTP_PORT, SMTP_SECURE,
  SMTP_USER, SMTP_PASS, SMTP_FROM,
  EMAIL_LOG_ONLY,
  BASE_URL,
} = process.env;

const SITE_URL = BASE_URL || "http://localhost:5173";

let transporter = null;
let logOnly = false;

function info(msg, extra) {
  console.log(`[email.service] ${msg}`);
  if (extra) console.log(extra);
}

function createTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: String(SMTP_SECURE) === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

// ---- init ----
if (EMAIL_LOG_ONLY === "true") {
  logOnly = true;
  info("EMAIL_LOG_ONLY=true -> logging only");
} else if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
  logOnly = true;
  info("SMTP not configured; one or more envs missing", {
    SMTP_HOST: !!SMTP_HOST,
    SMTP_PORT: !!SMTP_PORT,
    SMTP_USER: !!SMTP_USER,
    SMTP_PASS: !!SMTP_PASS,
    SMTP_FROM: !!SMTP_FROM,
  });
} else {
  transporter = createTransport();
  transporter.verify((err) => {
    if (err) {
      logOnly = true;
      info("SMTP verify failed -> logging only: " + err.message);
    } else {
      info("SMTP OK: " + SMTP_HOST);
    }
  });
}

async function sendOrLog({ to, subject, text = "", html = "" }) {
  const msg = { from: SMTP_FROM, to, subject, text, html };

  if (logOnly || !transporter) {
    console.log("----- EMAIL (LOG ONLY) -----");
    console.log("TO:", to);
    console.log("SUBJECT:", subject);
    console.log("TEXT:", text);
    console.log("HTML:\n\n", html, "\n");
    console.log("----------------------------");
    return { logged: true, reason: !transporter ? "NO_TRANSPORTER" : "LOG_ONLY" };
  }

  return transporter.sendMail(msg);
}

// ---------- PUBLIC EMAIL HELPERS ----------

function buildItems(order) {
  return (order?.products || [])
    .map((l) => `${l.quantity || 1} × ${(l.productId?.name || "Item")}`)
    .join(", ");
}

/**
 * ✅ Stripe manual-capture: request received (Authorized)
 */
export async function emailOrderRequested({ to, order, user }) {
  const id = order?._id || "";
  const items = buildItems(order);
  const link = `${SITE_URL}/orders/${id}`;

  const subject = `Order request received #${id}`;
  const text =
`Hi ${user?.name || ""},

We received your order request.
Payment is authorized (not charged yet). We’ll confirm availability and then capture the payment.

Order #${id}
Items: ${items || "-"}
Total: ${order?.totalAmount ?? "-"}

View your order: ${link}`;

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;font-size:14px">
    <h2>Order request received ✅</h2>
    <p>We received your order request for <strong>#${id}</strong>.</p>
    <p><strong>Payment status:</strong> Authorized (not charged yet)</p>
    <p>We’ll confirm availability and then capture the payment.</p>
    <p><strong>Items:</strong> ${items || "-"}</p>
    <p><strong>Total:</strong> ${order?.totalAmount ?? "-"}</p>
    <p>
      <a href="${link}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;text-decoration:none;border-radius:6px">
        View order
      </a>
    </p>
  </div>`;

  return sendOrLog({ to, subject, text, html });
}

/**
 * ✅ COD confirmed OR Stripe captured: order confirmed
 */
export async function emailOrderConfirmed({ to, order, user }) {
  const id = order?._id || "";
  const items = buildItems(order);
  const link = `${SITE_URL}/orders/${id}`;

  const subject = `Order confirmed #${id}`;
  const text =
`Hi ${user?.name || ""},

Thanks for your order!
Order #${id}
Items: ${items || "-"}
Total: ${order?.totalAmount ?? "-"}

Track your order: ${link}`;

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;font-size:14px">
    <h2>Order confirmed 🎉</h2>
    <p><strong>Order #${id}</strong> has been confirmed.</p>
    <p><strong>Items:</strong> ${items || "-"}</p>
    <p><strong>Total:</strong> ${order?.totalAmount ?? "-"}</p>
    <p>
      <a href="${link}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;text-decoration:none;border-radius:6px">
        View order
      </a>
    </p>
  </div>`;

  return sendOrLog({ to, subject, text, html });
}

export async function emailOrderCancelled({ to, order, user }) {
  const id = order?._id || "";
  const link = `${SITE_URL}/orders/${id}`;

  const subject = `Order cancelled #${id}`;
  const text =
`Hi ${user?.name || ""},

Your order #${id} has been cancelled.
View details: ${link}`;

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;font-size:14px">
    <h2>Order cancelled</h2>
    <p>Your order <strong>#${id}</strong> has been cancelled.</p>
    <p>
      <a href="${link}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;text-decoration:none;border-radius:6px">
        View details
      </a>
    </p>
  </div>`;

  return sendOrLog({ to, subject, text, html });
}

export async function emailBackInStock({ to, product, linkBase = SITE_URL }) {
  const subject = `Back in stock: ${product?.name || "Product"}`;
  const link = `${linkBase}/product/${product?._id || ""}`;
  const text = `Good news!
${product?.name || "Product"} is now available.
View: ${link}`;

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111;font-size:14px">
    <h2>Good news 🎉</h2>
    <p><strong>${product?.name || "This product"}</strong> is now available.</p>
    <p>
      <a href="${link}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;text-decoration:none;border-radius:6px">
        View product
      </a>
    </p>
    <p style="color:#666">If you no longer want these alerts, just ignore this email.</p>
  </div>`;

  return sendOrLog({ to, subject, text, html });
}
