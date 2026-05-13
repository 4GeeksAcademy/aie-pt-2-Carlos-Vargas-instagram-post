# Guia Tecnica Ecommerce Multimoneda

## 1) Arquitectura propuesta

- Frontend: HTML5 + CSS3 + JavaScript vanilla.
- Persistencia local: localStorage para carrito, historial de ordenes y preferencias de moneda/pais.
- Backend recomendado (produccion): Node.js + Express o serverless functions para crear sesiones de pago seguras y validar transacciones.
- Seguridad: HTTPS, tokens CSRF, validacion de input en cliente y servidor, tokenizacion de tarjeta via SDK oficial del proveedor.

## 2) Proveedores de pago por region

- Espana (EUR): Stripe, PayPal.
- Mexico (MXN): Conekta, Stripe, PayPal.
- Argentina (ARS): Mercado Pago, PayPal, Uala (si aplica a comercio con API habilitada).
- Chile (CLP): Transbank, Stripe, PayPal.
- Colombia (COP): Adyen, PayPal, Women\'s ERA (segun disponibilidad comercial/API).

## 3) Flujo seguro de pago (PCI)

1. Cliente inicia checkout con total, moneda y proveedor.
2. Backend crea intent/session con API secreta del proveedor.
3. Cliente confirma pago con SDK del proveedor (token o intent id).
4. Backend verifica webhook firmado y marca orden como pagada.
5. Nunca guardar PAN/CVC en base de datos ni en localStorage.

## 4) Endpoints backend sugeridos

- GET /api/security/csrf-token
- POST /api/checkout/create-session
- POST /api/checkout/webhook/:provider
- POST /api/orders
- GET /api/orders/:id

### Ejemplo payload create-session

```json
{
  "id": "ORD-1710000000",
  "country": "MX",
  "currency": "MXN",
  "provider": "conekta",
  "customer": {
    "name": "Carlos Vargas",
    "email": "carlos@email.com"
  },
  "items": [
    { "productId": "sku-hosting-global", "quantity": 1, "unitPrice": 2200 }
  ],
  "subtotal": 2200,
  "taxAmount": 352,
  "total": 2552
}
```

## 5) Variables de entorno recomendadas

```bash
# General
APP_ENV=production
APP_BASE_URL=https://tu-dominio.com

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# PayPal
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx
PAYPAL_MODE=live

# Conekta
CONEKTA_PRIVATE_KEY=key_xxx

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-xxx

# Transbank
TRANSBANK_COMMERCE_CODE=xxx
TRANSBANK_API_KEY=xxx

# Adyen
ADYEN_API_KEY=xxx
ADYEN_MERCHANT_ACCOUNT=xxx

# CSRF
CSRF_SECRET=un_secreto_largo
```

## 6) Configuracion por proveedor (resumen)

### Stripe
- Crear cuenta y obtener claves API.
- Activar monedas EUR, MXN, ARS, CLP, COP.
- Implementar Payment Intents + Webhooks.
- Usar Stripe Elements para capturar tarjeta en frontend sin tocar datos sensibles.

### PayPal
- Crear app REST en dashboard.
- Configurar credenciales sandbox/live.
- Usar Smart Buttons o Orders API.

### Conekta (MX)
- Configurar merchant y llaves public/private.
- Usar Checkout o API de tokens para tarjetas.

### Mercado Pago (AR)
- Crear aplicacion y token de acceso.
- Integrar Checkout Pro o Bricks con webhooks.

### Transbank (CL)
- Configurar Webpay Plus.
- Validar respuesta firmada y estado de transaccion.

### Adyen (CO)
- Configurar merchant account, API key y webhook HMAC.
- Activar metodos locales aplicables.

## 7) Tipo de cambio

El frontend intenta consumir exchangerate.host:
- https://api.exchangerate.host/latest?base=EUR&symbols=EUR,MXN,ARS,CLP,COP

Si falla, usa tasas hardcodeadas para modo offline/demo.

## 8) Despliegue recomendado

1. Servir frontend en hosting HTTPS (Netlify, Vercel, Nginx, etc.).
2. Exponer backend de pagos bajo /api con TLS.
3. Configurar CORS solo para dominios permitidos.
4. Configurar webhooks con firma (Stripe/PayPal/etc.).
5. Activar logs, alertas antifraude y monitoreo.

## 8.1) Backend de ejemplo incluido

Se incluye [server.example.js](server.example.js) con:
- endpoint CSRF
- endpoint create-session
- validacion de integridad de orden en servidor

Ejecutar localmente:

```bash
cd esitef.com
npm init -y
npm install express helmet cors
node server.example.js
```

## 8.2) Activar Stripe y PayPal en el frontend actual

1. Abre checkout en la tienda y completa:
  - PayPal Client ID
  - Stripe Publishable Key
2. Pulsa "Guardar configuración".
3. El flujo cambia automaticamente:
  - PayPal: se muestran botones oficiales de PayPal SDK.
  - Stripe: se monta Stripe Elements para tokenizar tarjeta.

Nota:
- Si no hay credenciales, el checkout queda en modo demo con validacion local.
- Para cobro real debes validar y capturar en backend con llaves secretas.

## 8.3) Panel admin y exportacion CSV

- El panel admin incluye tabla de ordenes en tiempo real.
- "Exportar órdenes CSV" descarga un archivo para conciliacion.
- "Limpiar historial local" elimina historial almacenado en localStorage (solo entorno demo).

## 9) Como agregar productos o cambiar precios

Editar el arreglo PRODUCTS en esitef.com/main.js:
- id unico
- name
- description
- priceEur (precio base)
- image

Ejemplo:

```js
{
  id: "sku-nuevo",
  name: "Nuevo producto",
  description: "Descripcion del producto",
  priceEur: 129,
  image: "https://picsum.photos/seed/nuevo/640/380"
}
```

## 10) Limitaciones del demo actual

- El frontend incluye modo simulacion si /api/checkout/create-session no existe.
- PayPal y Stripe pueden inicializar SDK real, pero la conciliacion final de pago debe cerrarse en backend con webhooks.
- La validacion final de tarjeta y antifraude debe hacerse en servidor/proveedor.
- El historial de ordenes actual es local (localStorage), no base de datos real.
