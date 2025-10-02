# Configuración del Webhook de Stripe

Para que el sistema de upgrades funcione correctamente, necesitas configurar el webhook de Stripe para que los pagos actualicen automáticamente la cuenta del usuario.

## 🧪 Configuración Local (Desarrollo)

### 1. Instalar Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Otras plataformas: https://stripe.com/docs/stripe-cli
```

### 2. Autenticarse con Stripe

```bash
stripe login
```

### 3. Ejecutar el webhook local

En una terminal separada, ejecuta:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Esto te dará un **webhook signing secret** que empieza con `whsec_...`

### 4. Actualizar `.env.local`

Copia el webhook signing secret y actualiza tu archivo `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui
```

### 5. Reiniciar tu servidor Next.js

```bash
npm run dev
```

## 🧪 Probar el Webhook Localmente

### Opción 1: Usar Stripe CLI para simular eventos

```bash
stripe trigger checkout.session.completed
```

### Opción 2: Hacer un pago de prueba

1. Ve a tu aplicación en `http://localhost:3000`
2. Haz clic en el botón de Upgrade
3. Usa una tarjeta de prueba:
   - Número: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos
   - ZIP: Cualquier código postal

4. Completa el pago
5. Observa los logs en la terminal donde corre `stripe listen`
6. Observa los logs de tu servidor Next.js

Deberías ver algo como:

```
=== Iniciando creación de checkout session ===
...
✅ Webhook signature verified: checkout.session.completed
💳 Processing checkout.session.completed: cs_test_...
Processing upgrade: User user_xxx -> Package package_5
Límite incrementado de 1 a 6
Metadata actualizado exitosamente
✅ Upgrade processed successfully
```

## 🚀 Configuración en Producción

### 1. Ir al Dashboard de Stripe

1. Ve a https://dashboard.stripe.com/webhooks
2. Haz clic en "Add endpoint"

### 2. Configurar el Endpoint

- **URL del endpoint**: `https://tu-dominio.com/api/webhooks/stripe`
- **Eventos a escuchar**:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

### 3. Obtener el Signing Secret

Después de crear el endpoint, Stripe te dará un **Signing secret** que empieza con `whsec_...`

### 4. Configurar en Producción

Agrega el webhook secret a tus variables de entorno de producción (Vercel, Railway, etc.):

```
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_de_produccion
```

## 🔍 Verificar que Funciona

### En el Dashboard de Stripe

1. Ve a https://dashboard.stripe.com/webhooks
2. Haz clic en tu webhook
3. Ve a la pestaña "Recent events"
4. Deberías ver eventos con estado `succeeded`

### En tu Aplicación

1. Después de completar un pago
2. Recarga la página del dashboard
3. Deberías ver:
   - Mensaje de éxito verde
   - Límite de propiedades actualizado
   - Si compraste el paquete de agencia, tu rol debe cambiar a AGENCY

## 🐛 Troubleshooting

### El webhook no recibe eventos

- ✅ Verifica que `STRIPE_WEBHOOK_SECRET` esté configurado correctamente
- ✅ Asegúrate de que la URL del webhook sea accesible públicamente (en producción)
- ✅ Revisa los logs del servidor para ver si hay errores

### El pago se completa pero el usuario no se actualiza

- ✅ Revisa los logs del webhook en Stripe Dashboard
- ✅ Verifica que el metadata del checkout incluya `userId` y `packageType`
- ✅ Revisa los logs del servidor para ver errores en el `UpgradeService`

### La UI no se actualiza después del pago

- ✅ Asegúrate de que el webhook se procesó correctamente
- ✅ Recarga la página manualmente (F5)
- ✅ Verifica que Clerk esté sincronizado (puede tomar unos segundos)

## 📊 Logs Importantes

### Logs del Servidor (Next.js)

```
=== Iniciando creación de checkout session ===
Usuario autenticado: user_xxx
Paquete encontrado: Paquete 5 Propiedades - Precio: 1199
Sesión creada exitosamente: cs_test_xxx
✅ Webhook signature verified: checkout.session.completed
💳 Processing checkout.session.completed
Processing upgrade: User user_xxx -> Package package_5
Límite incrementado de 1 a 6
✅ Upgrade processed successfully
```

### Logs de Stripe CLI

```
2025-01-15 10:30:45   --> checkout.session.completed [evt_xxx]
2025-01-15 10:30:45   <--  [200] POST http://localhost:3000/api/webhooks/stripe [evt_xxx]
```

## 💡 Notas

- El webhook es **crítico** para que funcione el sistema de upgrades
- Sin el webhook configurado, los pagos se procesarán pero los usuarios no se actualizarán
- En desarrollo, usa Stripe CLI para probar localmente
- En producción, configura el webhook en el Dashboard de Stripe
