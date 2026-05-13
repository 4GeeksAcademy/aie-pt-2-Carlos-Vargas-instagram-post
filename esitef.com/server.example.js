/*
  Backend de ejemplo para ecommerce multimoneda.
  No usar tal cual en produccion sin endurecimiento adicional.
*/

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const crypto = require("node:crypto");

const app = express();
const port = process.env.PORT || 8787;
const allowedOrigin = process.env.APP_BASE_URL || "http://localhost:5500";
const csrfSecret = process.env.CSRF_SECRET || "change_me";

app.use(helmet());
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: "250kb" }));

const TAX_RATES = {
  ES: 0.21,
  MX: 0.16,
  AR: 0.21,
  CL: 0.19,
  CO: 0.19
};

app.get("/api/security/csrf-token", (req, res) => {
  const token = signCsrfToken(Date.now().toString());
  res.json({ token });
});

app.post("/api/checkout/create-session", (req, res) => {
  const csrfToken = req.get("X-CSRF-Token") || "";
  if (!verifyCsrfToken(csrfToken)) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  const order = req.body;
  const validation = validateOrder(order);

  if (!validation.ok) {
    return res.status(400).json({ error: validation.message });
  }

  const providerReference = `LIVE-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  // Aqui debes llamar al SDK real del proveedor (Stripe/PayPal/etc.)
  return res.status(200).json({
    status: "approved",
    providerReference
  });
});

app.listen(port, () => {
  console.log(`API ecommerce escuchando en puerto ${port}`);
});

function validateOrder(order) {
  if (!order || typeof order !== "object") {
    return { ok: false, message: "Payload de orden invalido" };
  }

  const required = ["id", "country", "currency", "provider", "items", "subtotal", "taxAmount", "total"];
  for (const field of required) {
    if (!(field in order)) {
      return { ok: false, message: `Falta campo obligatorio: ${field}` };
    }
  }

  if (!Array.isArray(order.items) || !order.items.length) {
    return { ok: false, message: "La orden debe tener items" };
  }

  if (!TAX_RATES[order.country]) {
    return { ok: false, message: "Pais no soportado" };
  }

  if (!order.customer || !String(order.customer.email || "").includes("@")) {
    return { ok: false, message: "Datos de cliente invalidos" };
  }

  const computedSubtotal = order.items.reduce((acc, item) => {
    const qty = Number(item.quantity || 0);
    const unit = Number(item.unitPrice || 0);
    return acc + qty * unit;
  }, 0);

  const taxRate = TAX_RATES[order.country];
  const computedTax = computedSubtotal * taxRate;
  const computedTotal = computedSubtotal + computedTax;

  const epsilon = 0.01;

  if (Math.abs(computedSubtotal - Number(order.subtotal)) > epsilon) {
    return { ok: false, message: "Subtotal alterado" };
  }

  if (Math.abs(computedTax - Number(order.taxAmount)) > epsilon) {
    return { ok: false, message: "Impuestos alterados" };
  }

  if (Math.abs(computedTotal - Number(order.total)) > epsilon) {
    return { ok: false, message: "Total alterado" };
  }

  return { ok: true };
}

function signCsrfToken(payload) {
  const signature = crypto
    .createHmac("sha256", csrfSecret)
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

function verifyCsrfToken(token) {
  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [payload, signature] = parts;
  const expected = crypto
    .createHmac("sha256", csrfSecret)
    .update(payload)
    .digest("hex");

  if (signature.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
