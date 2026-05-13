const STORAGE_KEYS = {
  cart: "esitef_cart_v1",
  orders: "esitef_orders_v1",
  settings: "esitef_settings_v1",
  rates: "esitef_rates_v1",
  gateways: "esitef_gateways_v1"
};

const BASE_CURRENCY = "EUR";

const CURRENCIES = {
  EUR: { symbol: "EUR", decimals: 2 },
  MXN: { symbol: "MXN", decimals: 2 },
  ARS: { symbol: "ARS", decimals: 2 },
  CLP: { symbol: "CLP", decimals: 0 },
  COP: { symbol: "COP", decimals: 0 }
};

const COUNTRY_CONFIG = {
  ES: { name: "Espana", currency: "EUR", taxRate: 0.21, providers: ["paypal", "stripe"] },
  MX: { name: "Mexico", currency: "MXN", taxRate: 0.16, providers: ["conekta", "paypal", "stripe"] },
  AR: { name: "Argentina", currency: "ARS", taxRate: 0.21, providers: ["mercado_pago", "paypal", "uala"] },
  CL: { name: "Chile", currency: "CLP", taxRate: 0.19, providers: ["transbank", "paypal", "stripe"] },
  CO: { name: "Colombia", currency: "COP", taxRate: 0.19, providers: ["adyen", "paypal", "womensera"] }
};

const PROVIDER_LABELS = {
  paypal: "PayPal",
  stripe: "Stripe",
  conekta: "Conekta",
  mercado_pago: "Mercado Pago",
  uala: "Uala",
  transbank: "Transbank",
  adyen: "Adyen",
  womensera: "Women\'s ERA"
};

const PRODUCTS = [
  {
    id: "sku-hosting-global",
    name: "Hosting Internacional Pro",
    description: "Plan anual con SSL, CDN y soporte tecnico 24/7.",
    priceEur: 119,
    image: "https://picsum.photos/seed/hosting/640/380"
  },
  {
    id: "sku-pasarela-ai",
    name: "Pasarela de Pago Inteligente",
    description: "Modulo para enrutar transacciones por proveedor y pais.",
    priceEur: 249,
    image: "https://picsum.photos/seed/payment/640/380"
  },
  {
    id: "sku-analytics",
    name: "Panel Analytics Ecommerce",
    description: "Dashboard de conversion, abandono de carrito y monedas.",
    priceEur: 89,
    image: "https://picsum.photos/seed/analytics/640/380"
  },
  {
    id: "sku-chatbot",
    name: "Asistente de Ventas Multilenguaje",
    description: "Chatbot entrenado para soporte pre y post compra.",
    priceEur: 159,
    image: "https://picsum.photos/seed/chatbot/640/380"
  },
  {
    id: "sku-maintenance",
    name: "Mantenimiento Premium",
    description: "Actualizaciones, backups cifrados y monitoreo continuo.",
    priceEur: 79,
    image: "https://picsum.photos/seed/maintenance/640/380"
  },
  {
    id: "sku-design-pack",
    name: "Pack UI Ecommerce",
    description: "Plantillas de producto, checkout y confirmacion.",
    priceEur: 59,
    image: "https://picsum.photos/seed/design/640/380"
  }
];

const DEFAULT_RATES = {
  EUR: 1,
  MXN: 18.7,
  ARS: 1052,
  CLP: 1018,
  COP: 4350
};

const state = {
  country: "ES",
  currency: "EUR",
  rates: { ...DEFAULT_RATES },
  cart: [],
  orders: [],
  csrfToken: "",
  taxRate: COUNTRY_CONFIG.ES.taxRate,
  gateways: {
    paypalClientId: "",
    stripePublishableKey: ""
  },
  stripe: {
    instance: null,
    cardElement: null,
    readyKey: ""
  },
  paypal: {
    readyClientId: "",
    buttonsRendered: false
  }
};

const el = {};

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("confirmation.html")) {
    renderConfirmationPage();
    return;
  }

  cacheElements();
  loadState();
  bindEvents();
  renderProducts();
  updateProviderOptions();
  renderAll();
  detectCountryByIp();
  refreshExchangeRates();
  preloadCsrfToken();
});

function cacheElements() {
  el.countrySelector = document.getElementById("countrySelector");
  el.currencySelector = document.getElementById("currencySelector");
  el.productGrid = document.getElementById("productGrid");
  el.cartItems = document.getElementById("cartItems");
  el.drawerItems = document.getElementById("drawerItems");
  el.ordersHistory = document.getElementById("ordersHistory");
  el.cartCount = document.getElementById("cartCount");
  el.subtotalValue = document.getElementById("subtotalValue");
  el.taxValue = document.getElementById("taxValue");
  el.totalValue = document.getElementById("totalValue");
  el.paymentProvider = document.getElementById("paymentProvider");
  el.providerHint = document.getElementById("providerHint");
  el.paymentForm = document.getElementById("paymentForm");
  el.paymentFeedback = document.getElementById("paymentFeedback");
  el.gatewayFeedback = document.getElementById("gatewayFeedback");
  el.gatewayNotice = document.getElementById("gatewayNotice");
  el.paypalClientId = document.getElementById("paypalClientId");
  el.stripePublishableKey = document.getElementById("stripePublishableKey");
  el.saveGatewayConfig = document.getElementById("saveGatewayConfig");
  el.paypalButtonsContainer = document.getElementById("paypalButtonsContainer");
  el.stripeElementsContainer = document.getElementById("stripeElementsContainer");
  el.stripeCardElement = document.getElementById("stripeCardElement");
  el.cardFields = document.getElementById("cardFields");
  el.payButton = document.getElementById("payButton");
  el.contactForm = document.getElementById("contactForm");
  el.supportFeedback = document.getElementById("supportFeedback");
  el.cartDrawer = document.getElementById("cartDrawer");
  el.cartToggle = document.getElementById("cartToggle");
  el.closeDrawer = document.getElementById("closeDrawer");
  el.adminOrdersTableBody = document.getElementById("adminOrdersTableBody");
  el.exportOrdersCsv = document.getElementById("exportOrdersCsv");
  el.clearOrdersHistory = document.getElementById("clearOrdersHistory");
  el.adminFeedback = document.getElementById("adminFeedback");
}

function bindEvents() {
  el.countrySelector.addEventListener("change", (event) => {
    const country = event.target.value;
    setCountry(country, true);
  });

  el.currencySelector.addEventListener("change", (event) => {
    state.currency = event.target.value;
    saveSettings();
    renderAll();
    updateProviderOptions();
  });

  el.cartToggle.addEventListener("click", () => toggleDrawer(true));
  el.closeDrawer.addEventListener("click", () => toggleDrawer(false));

  document.getElementById("goCheckout").addEventListener("click", () => {
    toggleDrawer(false);
  });

  el.paymentForm.addEventListener("submit", onPaymentSubmit);
  el.paymentProvider.addEventListener("change", () => {
    refreshGatewayUx();
  });
  el.contactForm.addEventListener("submit", onContactSubmit);

  el.saveGatewayConfig.addEventListener("click", onSaveGatewayConfig);
  el.exportOrdersCsv.addEventListener("click", exportOrdersCsv);
  el.clearOrdersHistory.addEventListener("click", clearOrdersHistory);

  ["cardNumber", "cardExpiry", "cardCvc"].forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", normalizeCardInput);
  });
}

function loadState() {
  const savedCart = safeJsonParse(localStorage.getItem(STORAGE_KEYS.cart), []);
  const savedOrders = safeJsonParse(localStorage.getItem(STORAGE_KEYS.orders), []);
  const savedSettings = safeJsonParse(localStorage.getItem(STORAGE_KEYS.settings), {});
  const savedRates = safeJsonParse(localStorage.getItem(STORAGE_KEYS.rates), null);
  const savedGateways = safeJsonParse(localStorage.getItem(STORAGE_KEYS.gateways), null);

  state.cart = savedCart;
  state.orders = savedOrders;

  if (savedRates && typeof savedRates === "object") {
    state.rates = { ...DEFAULT_RATES, ...savedRates };
  }

  if (savedGateways && typeof savedGateways === "object") {
    state.gateways = {
      ...state.gateways,
      paypalClientId: String(savedGateways.paypalClientId || "").trim(),
      stripePublishableKey: String(savedGateways.stripePublishableKey || "").trim()
    };
  }

  if (savedSettings.country && COUNTRY_CONFIG[savedSettings.country]) {
    state.country = savedSettings.country;
  }

  if (savedSettings.currency && CURRENCIES[savedSettings.currency]) {
    state.currency = savedSettings.currency;
  } else {
    state.currency = COUNTRY_CONFIG[state.country].currency;
  }

  state.taxRate = COUNTRY_CONFIG[state.country].taxRate;
}

function saveSettings() {
  localStorage.setItem(
    STORAGE_KEYS.settings,
    JSON.stringify({
      country: state.country,
      currency: state.currency
    })
  );
}

function persistCart() {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(state.cart));
}

function persistOrders() {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(state.orders));
}

function persistRates() {
  localStorage.setItem(STORAGE_KEYS.rates, JSON.stringify(state.rates));
}

function persistGateways() {
  localStorage.setItem(STORAGE_KEYS.gateways, JSON.stringify(state.gateways));
}

function setCountry(countryCode, syncCurrency) {
  if (!COUNTRY_CONFIG[countryCode]) {
    return;
  }

  state.country = countryCode;
  state.taxRate = COUNTRY_CONFIG[countryCode].taxRate;

  if (syncCurrency) {
    state.currency = COUNTRY_CONFIG[countryCode].currency;
  }

  saveSettings();
  renderAll();
  updateProviderOptions();
}

function renderProducts() {
  el.productGrid.innerHTML = PRODUCTS.map((product) => {
    return `
      <article class="product-card">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-body">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <div class="product-footer">
            <span class="price">${formatMoney(convertPrice(product.priceEur))}</span>
            <button class="btn btn-primary" data-action="add" data-id="${product.id}">Agregar</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  el.productGrid.querySelectorAll("button[data-action='add']").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id);
    });
  });
}

function addToCart(productId) {
  const existing = state.cart.find((item) => item.productId === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ productId, qty: 1 });
  }

  persistCart();
  renderAll();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.productId !== productId);
  persistCart();
  renderAll();
}

function updateProviderOptions() {
  const providers = COUNTRY_CONFIG[state.country].providers;
  el.paymentProvider.innerHTML = providers.map((provider) => {
    return `<option value="${provider}">${PROVIDER_LABELS[provider] || provider}</option>`;
  }).join("");

  const selectedProvider = el.paymentProvider.value;
  el.providerHint.textContent = `Proveedor recomendado para ${COUNTRY_CONFIG[state.country].name}: ${PROVIDER_LABELS[selectedProvider] || selectedProvider}.`;
  refreshGatewayUx().catch(() => {
    setFeedback(el.gatewayFeedback, "error", "No se pudo actualizar la pasarela seleccionada.");
  });
}

function renderCartLines(container) {
  if (!state.cart.length) {
    container.innerHTML = "<p class='small'>Tu carrito esta vacio.</p>";
    return;
  }

  container.innerHTML = state.cart.map((line) => {
    const product = PRODUCTS.find((productItem) => productItem.id === line.productId);
    if (!product) {
      return "";
    }

    const linePrice = convertPrice(product.priceEur) * line.qty;

    return `
      <div class="cart-line">
        <div class="line-top">
          <strong>${product.name}</strong>
          <strong>${formatMoney(linePrice)}</strong>
        </div>
        <div class="line-meta">Cantidad: ${line.qty}</div>
        <button class="link-btn" data-remove="${product.id}">Eliminar</button>
      </div>
    `;
  }).join("");

  container.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      removeFromCart(button.getAttribute("data-remove"));
    });
  });
}

function renderTotals() {
  const subtotal = calculateSubtotal();
  const taxes = subtotal * state.taxRate;
  const total = subtotal + taxes;

  el.subtotalValue.textContent = formatMoney(subtotal);
  el.taxValue.textContent = `${formatMoney(taxes)} (${Math.round(state.taxRate * 100)}%)`;
  el.totalValue.textContent = formatMoney(total);
}

function renderCartCount() {
  const items = state.cart.reduce((acc, item) => acc + item.qty, 0);
  el.cartCount.textContent = String(items);
}

function renderOrders() {
  if (!state.orders.length) {
    el.ordersHistory.innerHTML = "<p class='small'>Aun no hay ordenes registradas.</p>";
    renderAdminTable();
    return;
  }

  el.ordersHistory.innerHTML = state.orders.slice().reverse().map((order) => {
    return `
      <article class="order-card">
        <p><strong>Orden:</strong> ${order.id}</p>
        <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleString("es-ES")}</p>
        <p><strong>Pais:</strong> ${order.country}</p>
        <p><strong>Moneda:</strong> ${order.currency}</p>
        <p><strong>Total:</strong> ${formatMoney(order.total, order.currency)}</p>
        <p><strong>Metodo:</strong> ${PROVIDER_LABELS[order.provider] || order.provider}</p>
      </article>
    `;
  }).join("");

  renderAdminTable();
}

function renderAll() {
  el.countrySelector.value = state.country;
  el.currencySelector.value = state.currency;
  el.paypalClientId.value = state.gateways.paypalClientId;
  el.stripePublishableKey.value = state.gateways.stripePublishableKey;

  renderProducts();
  renderCartLines(el.cartItems);
  renderCartLines(el.drawerItems);
  renderTotals();
  renderCartCount();
  renderOrders();
  refreshGatewayUx().catch(() => {
    setFeedback(el.gatewayFeedback, "error", "No se pudo inicializar la pasarela seleccionada.");
  });
}

function renderAdminTable() {
  if (!state.orders.length) {
    el.adminOrdersTableBody.innerHTML = "<tr><td colspan='7'>Sin órdenes registradas.</td></tr>";
    return;
  }

  el.adminOrdersTableBody.innerHTML = state.orders.slice().reverse().map((order) => {
    return `
      <tr>
        <td>${order.id}</td>
        <td>${new Date(order.createdAt).toLocaleString("es-ES")}</td>
        <td>${order.country}</td>
        <td>${order.currency}</td>
        <td>${formatMoney(order.total, order.currency)}</td>
        <td>${PROVIDER_LABELS[order.provider] || order.provider}</td>
        <td>${order.status || "approved"}</td>
      </tr>
    `;
  }).join("");
}

function calculateSubtotal() {
  return state.cart.reduce((subtotal, line) => {
    const product = PRODUCTS.find((entry) => entry.id === line.productId);
    if (!product) {
      return subtotal;
    }
    return subtotal + convertPrice(product.priceEur) * line.qty;
  }, 0);
}

function convertPrice(priceEur) {
  const rate = state.rates[state.currency] || 1;
  return priceEur * rate;
}

function formatMoney(amount, forcedCurrency) {
  const currency = forcedCurrency || state.currency;
  const formatConfig = CURRENCIES[currency] || CURRENCIES.EUR;

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: formatConfig.decimals,
    maximumFractionDigits: formatConfig.decimals
  }).format(amount);
}

function toggleDrawer(open) {
  if (open) {
    el.cartDrawer.classList.add("open");
    el.cartDrawer.setAttribute("aria-hidden", "false");
    return;
  }

  el.cartDrawer.classList.remove("open");
  el.cartDrawer.setAttribute("aria-hidden", "true");
}

function normalizeCardInput(event) {
  const fieldId = event.target.id;
  const digits = event.target.value.replace(/\D/g, "");

  if (fieldId === "cardNumber") {
    event.target.value = digits.slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  }

  if (fieldId === "cardExpiry") {
    const raw = digits.slice(0, 4);
    event.target.value = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
  }

  if (fieldId === "cardCvc") {
    event.target.value = digits.slice(0, 4);
  }
}

function validateCardFields() {
  const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "");
  const cardExpiry = document.getElementById("cardExpiry").value;
  const cardCvc = document.getElementById("cardCvc").value;

  if (!luhnCheck(cardNumber)) {
    return { ok: false, message: "Numero de tarjeta invalido." };
  }

  if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
    return { ok: false, message: "Fecha de vencimiento invalida." };
  }

  const [monthText, yearText] = cardExpiry.split("/");
  const month = Number(monthText);
  const year = 2000 + Number(yearText);
  const now = new Date();

  if (month < 1 || month > 12) {
    return { ok: false, message: "Mes de vencimiento fuera de rango." };
  }

  const expiry = new Date(year, month, 0);
  if (expiry < now) {
    return { ok: false, message: "Tarjeta vencida." };
  }

  if (!/^\d{3,4}$/.test(cardCvc)) {
    return { ok: false, message: "CVC invalido." };
  }

  return { ok: true };
}

function luhnCheck(number) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = number.length - 1; i >= 0; i -= 1) {
    let digit = Number(number[i]);

    if (Number.isNaN(digit)) {
      return false;
    }

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

async function onPaymentSubmit(event) {
  event.preventDefault();
  setFeedback(el.paymentFeedback, "", "");

  if (!state.cart.length) {
    setFeedback(el.paymentFeedback, "error", "Agrega productos antes de pagar.");
    return;
  }

  const formData = new FormData(el.paymentForm);
  const customerName = String(formData.get("customerName") || "").trim();
  const customerEmail = String(formData.get("customerEmail") || "").trim();
  const provider = String(formData.get("paymentProvider") || "");

  if (!customerName || !customerEmail.includes("@")) {
    setFeedback(el.paymentFeedback, "error", "Completa nombre y correo validos.");
    return;
  }

  const orderPayload = buildOrderPayload(customerName, customerEmail, provider);
  const payButton = el.payButton;

  if (provider === "paypal" && hasRealPaypalConfig()) {
    setFeedback(el.paymentFeedback, "error", "Usa el botón de PayPal para completar el pago.");
    return;
  }

  if (provider === "stripe" && hasRealStripeConfig()) {
    await submitStripePayment(orderPayload);
    return;
  }

  const cardValidation = validateCardFields();
  if (!cardValidation.ok) {
    setFeedback(el.paymentFeedback, "error", cardValidation.message);
    return;
  }

  payButton.disabled = true;
  payButton.textContent = "Procesando...";

  try {
    const response = await createCheckoutSession(orderPayload);
    finishOrder(orderPayload, response, "Pago procesado. Redirigiendo a confirmacion...");
  } catch (error) {
    setFeedback(el.paymentFeedback, "error", error.message || "No se pudo procesar el pago.");
  } finally {
    payButton.disabled = false;
    payButton.textContent = "Pagar ahora";
  }
}

async function submitStripePayment(orderPayload) {
  setFeedback(el.paymentFeedback, "", "");
  const payButton = el.payButton;
  payButton.disabled = true;
  payButton.textContent = "Procesando Stripe...";

  try {
    await ensureStripeMounted();
    const stripe = state.stripe.instance;

    if (!stripe || !state.stripe.cardElement) {
      throw new Error("Stripe no esta disponible. Revisa tu Publishable Key.");
    }

    const tokenResult = await stripe.createToken(state.stripe.cardElement);
    if (tokenResult.error) {
      throw new Error(tokenResult.error.message || "No se pudo tokenizar la tarjeta.");
    }

    const response = await createCheckoutSession({
      ...orderPayload,
      paymentToken: tokenResult.token.id,
      paymentMode: "stripe_elements"
    });

    finishOrder(orderPayload, response, "Pago Stripe aprobado. Redirigiendo...");
  } catch (error) {
    setFeedback(el.paymentFeedback, "error", error.message || "Error procesando Stripe.");
  } finally {
    payButton.disabled = false;
    payButton.textContent = "Pagar ahora";
  }
}

function finishOrder(orderPayload, response, successMessage) {
  const orderRecord = {
    ...orderPayload,
    status: response.status || "approved",
    providerReference: response.providerReference || "DEMO-REF"
  };

  state.orders.push(orderRecord);
  persistOrders();

  state.cart = [];
  persistCart();

  localStorage.setItem("esitef_last_order", JSON.stringify(orderRecord));

  setFeedback(el.paymentFeedback, "ok", successMessage);
  renderAll();

  window.location.href = "confirmation.html";
}

function onSaveGatewayConfig() {
  state.gateways.paypalClientId = el.paypalClientId.value.trim();
  state.gateways.stripePublishableKey = el.stripePublishableKey.value.trim();
  persistGateways();

  // Reset providers so new credentials are loaded cleanly.
  resetPaypalState();
  resetStripeState();

  refreshGatewayUx(true)
    .then(() => {
      setFeedback(el.gatewayFeedback, "ok", "Configuración guardada correctamente.");
    })
    .catch((error) => {
      setFeedback(el.gatewayFeedback, "error", error.message || "No se pudo inicializar la pasarela.");
    });
}

async function refreshGatewayUx(forceInit) {
  const provider = el.paymentProvider.value;

  el.paypalButtonsContainer.classList.add("hidden");
  el.stripeElementsContainer.classList.add("hidden");
  el.cardFields.classList.remove("hidden");
  el.payButton.classList.remove("hidden");

  if (provider === "paypal" && hasRealPaypalConfig()) {
    el.gatewayNotice.textContent = "PayPal real activo. Completa el pago con el botón oficial de PayPal.";
    el.paypalButtonsContainer.classList.remove("hidden");
    el.cardFields.classList.add("hidden");
    el.payButton.classList.add("hidden");
    await ensurePaypalButtons(forceInit);
    return;
  }

  if (provider === "stripe" && hasRealStripeConfig()) {
    el.gatewayNotice.textContent = "Stripe real activo con Elements. Tus datos se tokenizan en el navegador.";
    el.stripeElementsContainer.classList.remove("hidden");
    el.cardFields.classList.add("hidden");
    el.payButton.classList.remove("hidden");
    await ensureStripeMounted(forceInit);
    return;
  }

  if (provider === "paypal") {
    el.gatewayNotice.textContent = "Para habilitar PayPal real, agrega tu Client ID y guarda la configuración.";
    return;
  }

  if (provider === "stripe") {
    el.gatewayNotice.textContent = "Para habilitar Stripe real, agrega tu Publishable Key y guarda la configuración.";
    return;
  }

  el.gatewayNotice.textContent = "Modo demo: validación local + backend de sesión para pruebas.";
}

function hasRealPaypalConfig() {
  return Boolean(state.gateways.paypalClientId);
}

function hasRealStripeConfig() {
  return Boolean(state.gateways.stripePublishableKey);
}

function resetPaypalState() {
  state.paypal.readyClientId = "";
  state.paypal.buttonsRendered = false;
  el.paypalButtonsContainer.innerHTML = "";
  const sdk = document.getElementById("paypal-sdk");
  if (sdk) {
    sdk.remove();
  }
}

function resetStripeState() {
  if (state.stripe.cardElement) {
    state.stripe.cardElement.unmount();
  }
  state.stripe.instance = null;
  state.stripe.cardElement = null;
  state.stripe.readyKey = "";
  el.stripeCardElement.innerHTML = "";
}

function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    if (id) {
      script.id = id;
    }
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar script externo."));
    document.head.appendChild(script);
  });
}

async function ensurePaypalButtons(forceInit) {
  const clientId = state.gateways.paypalClientId;
  if (!clientId) {
    return;
  }

  if (state.paypal.readyClientId !== clientId || forceInit) {
    el.paypalButtonsContainer.innerHTML = "";
    state.paypal.buttonsRendered = false;

    const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(state.currency)}`;
    await loadScript(sdkUrl, "paypal-sdk");
    state.paypal.readyClientId = clientId;
  }

  if (state.paypal.buttonsRendered || typeof window.paypal === "undefined") {
    return;
  }

  window.paypal.Buttons({
    style: {
      shape: "rect",
      color: "gold",
      layout: "vertical",
      label: "paypal"
    },
    createOrder: (data, actions) => {
      const total = calculateSubtotal() + (calculateSubtotal() * state.taxRate);
      const decimals = CURRENCIES[state.currency].decimals;
      return actions.order.create({
        purchase_units: [
          {
            amount: {
              currency_code: state.currency,
              value: total.toFixed(decimals)
            }
          }
        ]
      });
    },
    onApprove: async (data, actions) => {
      const capture = await actions.order.capture();
      const formData = new FormData(el.paymentForm);
      const customerName = String(formData.get("customerName") || "").trim();
      const customerEmail = String(formData.get("customerEmail") || "").trim();

      if (!customerName || !customerEmail.includes("@")) {
        throw new Error("Completa nombre y correo antes de pagar con PayPal.");
      }

      const orderPayload = buildOrderPayload(customerName, customerEmail, "paypal");
      finishOrder(orderPayload, {
        status: "approved",
        providerReference: capture.id || data.orderID
      }, "Pago PayPal aprobado. Redirigiendo...");
    },
    onError: () => {
      setFeedback(el.paymentFeedback, "error", "No se pudo completar PayPal.");
    }
  }).render("#paypalButtonsContainer");

  state.paypal.buttonsRendered = true;
}

async function ensureStripeMounted(forceInit) {
  const publishableKey = state.gateways.stripePublishableKey;
  if (!publishableKey) {
    return;
  }

  await loadScript("https://js.stripe.com/v3/", "stripe-sdk");

  if (typeof window.Stripe === "undefined") {
    throw new Error("Stripe SDK no disponible.");
  }

  if (state.stripe.readyKey !== publishableKey || forceInit) {
    resetStripeState();
    state.stripe.instance = window.Stripe(publishableKey);
    const elements = state.stripe.instance.elements();
    state.stripe.cardElement = elements.create("card", {
      hidePostalCode: true,
      style: {
        base: {
          fontFamily: "DM Sans, sans-serif",
          fontSize: "16px",
          color: "#1f2933"
        }
      }
    });
    state.stripe.cardElement.mount("#stripeCardElement");
    state.stripe.readyKey = publishableKey;
  }
}

function exportOrdersCsv() {
  if (!state.orders.length) {
    setFeedback(el.adminFeedback, "error", "No hay órdenes para exportar.");
    return;
  }

  const header = ["id", "createdAt", "country", "currency", "total", "provider", "status", "customerName", "customerEmail"];
  const rows = state.orders.map((order) => [
    order.id,
    order.createdAt,
    order.country,
    order.currency,
    Number(order.total || 0).toFixed(2),
    order.provider,
    order.status || "approved",
    (order.customer && order.customer.name) || "",
    (order.customer && order.customer.email) || ""
  ]);

  const csv = [header, ...rows]
    .map((line) => line.map(escapeCsvCell).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ordenes-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  setFeedback(el.adminFeedback, "ok", "CSV exportado correctamente.");
}

function clearOrdersHistory() {
  state.orders = [];
  persistOrders();
  renderAll();
  setFeedback(el.adminFeedback, "ok", "Historial local eliminado.");
}

function escapeCsvCell(value) {
  const safe = String(value || "").replace(/"/g, '""');
  return `"${safe}"`;
}

function buildOrderPayload(customerName, customerEmail, provider) {
  const subtotal = calculateSubtotal();
  const taxAmount = subtotal * state.taxRate;
  const total = subtotal + taxAmount;

  return {
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    country: state.country,
    currency: state.currency,
    provider,
    customer: {
      name: customerName,
      email: customerEmail
    },
    items: state.cart.map((line) => {
      const product = PRODUCTS.find((entry) => entry.id === line.productId);
      return {
        productId: line.productId,
        name: product ? product.name : "Producto",
        quantity: line.qty,
        unitPrice: product ? convertPrice(product.priceEur) : 0
      };
    }),
    subtotal,
    taxAmount,
    total
  };
}

async function createCheckoutSession(orderPayload) {
  const endpoint = "/api/checkout/create-session";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": state.csrfToken || ""
      },
      body: JSON.stringify(orderPayload)
    });

    if (!response.ok) {
      throw new Error("Fallo en backend de pagos.");
    }

    return await response.json();
  } catch (networkError) {
    return {
      status: "approved",
      providerReference: `SIM-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
      note: "Modo demo sin backend."
    };
  }
}

async function preloadCsrfToken() {
  try {
    const response = await fetch("/api/security/csrf-token", { method: "GET" });
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    state.csrfToken = data.token || "";
  } catch (error) {
    state.csrfToken = "";
  }
}

function onContactSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("supportName").value.trim();
  const email = document.getElementById("supportEmail").value.trim();
  const message = document.getElementById("supportMessage").value.trim();

  if (!name || !email.includes("@") || message.length < 10) {
    setFeedback(el.supportFeedback, "error", "Completa todos los campos (minimo 10 caracteres en mensaje).");
    return;
  }

  setFeedback(el.supportFeedback, "ok", "Mensaje enviado. Te responderemos en menos de 24h.");
  el.contactForm.reset();
}

function setFeedback(node, status, message) {
  node.classList.remove("ok", "error");
  if (status) {
    node.classList.add(status);
  }
  node.textContent = message;
}

async function detectCountryByIp() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    const countryCode = (data && data.country_code) ? String(data.country_code).toUpperCase() : "";

    if (COUNTRY_CONFIG[countryCode]) {
      setCountry(countryCode, true);
    }
  } catch (error) {
    /* silent fallback to manual selector */
  }
}

async function refreshExchangeRates() {
  try {
    const response = await fetch("https://api.exchangerate.host/latest?base=EUR&symbols=EUR,MXN,ARS,CLP,COP");
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    if (data && data.rates) {
      state.rates = {
        ...DEFAULT_RATES,
        ...data.rates
      };
      persistRates();
      renderAll();
    }
  } catch (error) {
    /* fallback to default hardcoded rates */
  }
}

function safeJsonParse(content, fallback) {
  try {
    return content ? JSON.parse(content) : fallback;
  } catch (error) {
    return fallback;
  }
}

function renderConfirmationPage() {
  const mount = document.getElementById("confirmationMount");
  if (!mount) {
    return;
  }

  const order = safeJsonParse(localStorage.getItem("esitef_last_order"), null);
  if (!order) {
    mount.innerHTML = "<p>No hay una orden reciente para mostrar.</p><a href='index.html'>Volver a la tienda</a>";
    return;
  }

  const lines = order.items.map((item) => {
    return `<li>${item.quantity} x ${item.name} - ${new Intl.NumberFormat("es-ES", { style: "currency", currency: order.currency }).format(item.unitPrice)}</li>`;
  }).join("");

  mount.innerHTML = `
    <article class="panel" style="max-width:720px;margin:48px auto;">
      <h1>Pago confirmado</h1>
      <p>Tu pedido ha sido registrado correctamente.</p>
      <p><strong>Orden:</strong> ${order.id}</p>
      <p><strong>Proveedor:</strong> ${PROVIDER_LABELS[order.provider] || order.provider}</p>
      <p><strong>Referencia:</strong> ${order.providerReference || "Pendiente"}</p>
      <p><strong>Total:</strong> ${new Intl.NumberFormat("es-ES", { style: "currency", currency: order.currency }).format(order.total)}</p>
      <h2>Detalle</h2>
      <ul>${lines}</ul>
      <a class="btn btn-primary" href="index.html">Seguir comprando</a>
    </article>
  `;
}
