# 🚀 Sistema de Upgrades de Usuarios

Sistema completo de upgrades siguiendo Clean Code y principios SOLID para permitir a los usuarios expandir sus límites de propiedades.

## 📋 Características

- ✅ **3 Paquetes de Upgrade**:
  - Propiedad Individual ($299 MXN) - 1 propiedad adicional
  - Paquete 5 Propiedades ($1,199 MXN) - 5 propiedades adicionales
  - Conviértete en Agencia ($1,999 MXN/mes) - Propiedades ilimitadas

- ✅ **Integración con Stripe** para pagos seguros
- ✅ **Webhooks** para actualización automática
- ✅ **Actualización de Clerk metadata** en tiempo real
- ✅ **UI reactiva** que muestra los cambios inmediatamente

## 🏗️ Arquitectura (SOLID)

### **Single Responsibility Principle (SRP)**
- `UpgradeService` - Solo maneja lógica de upgrades
- `PropertyLimitService` - Solo maneja lógica de límites
- `UpgradeModal` - Solo maneja la UI del modal
- `UpgradeButton` - Solo maneja la UI del botón

### **Open/Closed Principle (OCP)**
- Sistema extensible para nuevos paquetes sin modificar código existente
- Solo agregar nuevos paquetes a `UPGRADE_PACKAGES`

### **Dependency Inversion Principle (DIP)**
- Componentes dependen de abstracciones (tipos, interfaces)
- No dependen de implementaciones concretas

## 📁 Estructura de Archivos

```
├── types/
│   └── upgrade.ts                          # Tipos para el sistema de upgrades
├── lib/
│   ├── services/
│   │   ├── upgrade.service.ts              # Lógica de procesamiento de upgrades
│   │   └── property-limit.service.ts       # Lógica de límites de propiedades
│   └── utils/
│       └── upgrade-plans.ts                # Definición de paquetes
├── components/
│   └── upgrade/
│       ├── upgrade-modal.tsx               # Modal con opciones de paquetes
│       ├── upgrade-button.tsx              # Botón de upgrade (sidebar/floating)
│       └── index.ts                        # Exports
├── app/
│   ├── api/
│   │   ├── create-property-checkout/
│   │   │   └── route.ts                    # API para crear checkout session
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts                # Webhook handler
│   └── dashboard/
│       └── [role]/
│           └── page.tsx                    # Dashboard con mensajes de éxito
└── scripts/
    └── test-webhook.sh                     # Script para probar webhooks
```

## 🔧 Configuración

### 1. Variables de Entorno

Asegúrate de tener en tu `.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Obtenido de Stripe CLI o Dashboard

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 2. Configurar Webhook de Stripe

Sigue las instrucciones en [STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md)

## 🎯 Flujo de Usuario

### Paso 1: Usuario alcanza el límite
```
Usuario publica 1 propiedad (límite gratis)
    ↓
Intenta publicar otra
    ↓
Sistema detecta que alcanzó el límite
    ↓
Muestra modal de upgrade automáticamente
```

### Paso 2: Usuario selecciona paquete
```
Usuario elige paquete en modal
    ↓
Click en "Seleccionar"
    ↓
API crea checkout session de Stripe
    ↓
Usuario es redirigido a Stripe Checkout
```

### Paso 3: Usuario completa el pago
```
Usuario ingresa datos de tarjeta
    ↓
Stripe procesa el pago
    ↓
Stripe envía evento checkout.session.completed al webhook
    ↓
Webhook procesa el evento y actualiza Clerk metadata
    ↓
Usuario es redirigido al dashboard con mensaje de éxito
```

### Paso 4: UI se actualiza
```
Dashboard muestra:
- ✅ Mensaje de éxito verde
- ✅ Nuevo límite de propiedades
- ✅ (Si compró agency) Rol actualizado a AGENCY
```

## 🔄 Actualización de Metadata en Clerk

### Para Paquete Individual (`single`)
```javascript
{
  propertyLimit: currentLimit + 1,
  lastUpgrade: "2025-01-15T10:30:00.000Z",
  lastUpgradeType: "single",
  lastUpgradeSession: "cs_test_..."
}
```

### Para Paquete de 5 (`package_5`)
```javascript
{
  propertyLimit: currentLimit + 5,
  lastUpgrade: "2025-01-15T10:30:00.000Z",
  lastUpgradeType: "package_5",
  lastUpgradeSession: "cs_test_..."
}
```

### Para Agencia (`agency`)
```javascript
{
  role: "AGENCY",
  propertyLimit: "unlimited",
  subscriptionStatus: "active",
  upgradedToAgencyAt: "2025-01-15T10:30:00.000Z",
  lastUpgradeSession: "cs_test_..."
}
```

## 🧪 Testing

### Test Manual Completo

1. **Iniciar servidor y webhook local**:
```bash
# Terminal 1
npm run dev

# Terminal 2
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

2. **Realizar pago de prueba**:
- Ve a `http://localhost:3000/dashboard/user`
- Haz clic en botón "Upgrade" en el sidebar
- Selecciona un paquete
- Usa tarjeta de prueba: `4242 4242 4242 4242`
- Completa el pago

3. **Verificar logs**:
```
Server logs:
  ✅ Sesión creada exitosamente
  ✅ Webhook signature verified
  ✅ Upgrade processed successfully

Stripe CLI logs:
  --> checkpoint.session.completed
  <--  [200] POST /api/webhooks/stripe
```

4. **Verificar UI**:
- Dashboard muestra mensaje de éxito
- Límite de propiedades actualizado
- Botón de "Nueva Propiedad" funciona

### Test Automatizado con Script

```bash
./scripts/test-webhook.sh
```

## 🎨 Componentes UI

### UpgradeButton (Sidebar)
```typescript
<UpgradeButton
  userId={user.id}
  userEmail={user.email}
  userName={user.name}
  currentProperties={user.propertyCount}
  variant="sidebar"  // o "floating"
/>
```

### UpgradeModal
```typescript
<UpgradeModal
  open={showModal}
  onOpenChange={setShowModal}
  userId={user.id}
  userEmail={user.email}
  userName={user.name}
  currentProperties={user.propertyCount}
/>
```

## 🔍 Debugging

### Ver metadata de Clerk

```javascript
// En cualquier componente del servidor
const user = await currentUser();
console.log(user.publicMetadata);
```

### Ver eventos de Stripe

1. Dashboard de Stripe: https://dashboard.stripe.com/events
2. Logs del webhook: https://dashboard.stripe.com/webhooks

### Logs importantes del servidor

```javascript
// API Route
console.log('Sesión creada exitosamente:', session.id);

// Webhook
console.log('✅ Webhook signature verified:', event.type);
console.log('Processing upgrade: User', userId, '-> Package', packageType);

// UpgradeService
console.log('Límite incrementado de', currentLimit, 'a', newLimit);
console.log('Metadata actualizado exitosamente');
```

## 🚀 Deploy a Producción

1. **Configurar webhook en Stripe Dashboard**
   - URL: `https://tu-dominio.com/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, subscriptions

2. **Configurar variables de entorno en Vercel/Railway**
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_... (de producción)
   ```

3. **Verificar que funciona**
   - Hacer pago de prueba en producción
   - Revisar logs de Stripe
   - Confirmar que usuario se actualiza

## 📊 Métricas a Monitorear

- ✅ Tasa de conversión (usuarios que ven modal → compran)
- ✅ Paquete más popular
- ✅ Tasa de éxito de webhooks (debe ser ~100%)
- ✅ Tiempo promedio de procesamiento de webhook
- ✅ Errores en procesamiento de upgrades

## 🆘 Troubleshooting

Ver [STRIPE_WEBHOOK_SETUP.md](./STRIPE_WEBHOOK_SETUP.md#-troubleshooting)

## 📝 Notas

- Sistema diseñado con Clean Code y SOLID
- Totalmente type-safe con TypeScript
- Preparado para escalar a nuevos paquetes
- Compatible con Stripe y Clerk
