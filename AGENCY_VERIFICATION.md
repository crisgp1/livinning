# 🛡️ Sistema de Verificación de Agencias

Sistema completo de verificación para agencias siguiendo Clean Code y principios SOLID.

## 📋 Características

- ✅ **Checkwall automático** para agencias no verificadas
- ✅ **Alert discreto** en el dashboard
- ✅ **Formulario multi-paso** para recolectar información
- ✅ **Carga de documentos** (5 tipos diferentes)
- ✅ **Estados de verificación**: pending, in_review, verified, rejected
- ✅ **Panel de administración** (próximamente)

## 🎯 Flujo Completo

### 1. Usuario se hace Agencia

```
Usuario compra paquete "Conviértete en Agencia"
    ↓
Pago exitoso vía Stripe
    ↓
Webhook actualiza Clerk metadata:
  - role: 'AGENCY'
  - propertyLimit: 'unlimited'
  - verificationStatus: 'pending'
  - isVerified: false
    ↓
Usuario es redirigido al dashboard de agencia
```

### 2. Dashboard muestra Alert de Verificación

```
Dashboard detecta:
  - role === 'AGENCY'
  - verificationStatus === 'pending'
  - isVerified === false
    ↓
Muestra VerificationAlert discreto:
  - Color: Amarillo (warning)
  - Icono: AlertTriangle
  - Badge: "Acción Requerida"
  - Botón: "Completar Verificación"
```

### 3. Usuario completa el formulario

El formulario tiene **5 pasos**:

#### Paso 1: Información Básica
- Nombre Comercial
- Razón Social
- RFC
- Año de Fundación

#### Paso 2: Dirección
- Calle, Número Exterior/Interior
- Colonia
- Ciudad, Estado
- Código Postal, País

#### Paso 3: Representante Legal
- Nombre Completo
- Cargo
- Email
- Teléfono

#### Paso 4: Información del Negocio
- Número de Agentes
- Años de Experiencia
- Propiedades Gestionadas
- Especializaciones (checkboxes):
  - Residencial
  - Comercial
  - Lujo
  - Industrial
  - Terrenos
  - Vacacional
- Áreas de Servicio

#### Paso 5: Documentos

**Requeridos:**
- Acta Constitutiva (company_registration)
- RFC - Constancia de Situación Fiscal (tax_id)
- Comprobante de Domicilio (proof_of_address)
- Identificación Oficial del Representante (official_id)

**Opcionales:**
- Poder Notarial (power_of_attorney)

### 4. Envío y Revisión

```
Usuario hace clic en "Enviar Verificación"
    ↓
API POST /api/agency/verification
    ↓
VerificationService.submitVerification()
    ↓
Clerk metadata actualizado:
  - verificationStatus: 'in_review'
  - verificationData: { ...todos los datos... }
    ↓
Alert cambia a:
  - Color: Azul (info)
  - Icono: Clock
  - Badge: "En Proceso"
  - Texto: "Estamos revisando tu solicitud..."
```

### 5. Aprobación/Rechazo (ADMIN)

```
Admin revisa la solicitud
    ↓
Opción A: Aprobar
  - verificationStatus: 'verified'
  - isVerified: true
  - Alert desaparece
  - Usuario puede publicar propiedades

Opción B: Rechazar
  - verificationStatus: 'rejected'
  - rejectionReason: "Razón del rechazo"
  - Alert cambia a rojo
  - Usuario puede reenviar
```

## 🏗️ Arquitectura (SOLID)

### **Single Responsibility Principle (SRP)**
- `VerificationService` - Solo maneja lógica de verificación
- `VerificationAlert` - Solo muestra el estado
- `VerificationForm` - Solo captura datos

### **Open/Closed Principle (OCP)**
- Sistema extensible para nuevos tipos de documentos
- Nuevos estados de verificación sin modificar código

### **Dependency Inversion Principle (DIP)**
- Componentes dependen de tipos/interfaces
- No dependen de implementaciones concretas

## 📁 Estructura de Archivos

```
├── types/
│   └── verification.ts                 # Tipos para verificación
├── lib/
│   └── services/
│       ├── upgrade.service.ts          # Actualizado con verificación
│       └── verification.service.ts     # Lógica de verificación
├── components/
│   └── agency/
│       ├── verification-alert.tsx      # Alert discreto
│       ├── verification-form.tsx       # Formulario multi-paso
│       └── index.ts                    # Exports
├── app/
│   ├── api/
│   │   └── agency/
│   │       └── verification/
│   │           └── route.ts            # API endpoint
│   └── dashboard/
│       ├── [role]/
│       │   └── page.tsx                # Dashboard con alert
│       └── agency/
│           └── verificacion/
│               └── page.tsx            # Página del formulario
```

## 🎨 Estados de Verificación

### **pending** (Pendiente)
- **Color**: Amarillo
- **Icono**: AlertTriangle
- **Badge**: "Acción Requerida"
- **Acción**: "Completar Verificación"
- **Descripción**: "Tu cuenta necesita ser verificada..."

### **in_review** (En Revisión)
- **Color**: Azul
- **Icono**: Clock
- **Badge**: "En Proceso"
- **Acción**: "Ver Estado"
- **Descripción**: "Estamos revisando tu solicitud..."

### **verified** (Verificada)
- **Color**: Verde
- **Icono**: CheckCircle2
- **Badge**: "Verificada"
- **Acción**: Ninguna (alert no se muestra)
- **Descripción**: "¡Agencia Verificada!"

### **rejected** (Rechazada)
- **Color**: Rojo
- **Icono**: XCircle
- **Badge**: "Requiere Atención"
- **Acción**: "Revisar y Reenviar"
- **Descripción**: Muestra la razón del rechazo

## 🔧 Configuración en Clerk Metadata

### Cuando se hace Agencia
```javascript
{
  role: 'AGENCY',
  propertyLimit: 'unlimited',
  subscriptionStatus: 'active',
  upgradedToAgencyAt: '2025-01-15T10:00:00.000Z',
  verificationStatus: 'pending',
  isVerified: false
}
```

### Durante Verificación
```javascript
{
  ...metadata anterior,
  verificationStatus: 'in_review',
  verificationData: {
    // Información básica
    companyName: 'Inmobiliaria Premium',
    legalName: 'Premium Real Estate S.A. de C.V.',
    taxId: 'PRE123456AB1',
    foundedYear: 2020,

    // Dirección completa
    street: 'Av. Reforma',
    exteriorNumber: '123',
    // ...más campos

    // Representante legal
    legalRepresentativeName: 'Juan Pérez',
    // ...más campos

    // Información del negocio
    numberOfAgents: 10,
    yearsOfExperience: 5,
    // ...más campos

    // Documentos
    documents: [
      {
        type: 'company_registration',
        url: 'https://storage.../acta.pdf',
        fileName: 'acta-constitutiva.pdf',
        uploadedAt: '2025-01-15T10:30:00.000Z'
      },
      // ...más documentos
    ],

    // Estado
    status: 'in_review',
    submittedAt: '2025-01-15T10:30:00.000Z'
  }
}
```

### Después de Aprobar
```javascript
{
  ...metadata anterior,
  verificationStatus: 'verified',
  isVerified: true,
  verificationData: {
    ...datos anteriores,
    status: 'verified',
    verifiedAt: '2025-01-16T14:00:00.000Z',
    reviewedAt: '2025-01-16T14:00:00.000Z',
    reviewedBy: 'admin_user_id',
    reviewerNotes: 'Todo correcto'
  }
}
```

## 🧪 Testing

### Simular Upgrade a Agencia

```bash
# Método 1: Usar el botón "Actualizar ahora" con packageType=agency
# En el dashboard después de comprar

# Método 2: Llamar al API directamente
curl -X POST http://localhost:3000/api/manual-upgrade \
  -H "Content-Type: application/json" \
  -d '{"packageType": "agency"}'
```

### Verificar Estado

1. Ve a `http://localhost:3000/dashboard/agency`
2. Deberías ver el **VerificationAlert** amarillo
3. Haz clic en "Completar Verificación"
4. Completa el formulario de 5 pasos
5. Sube documentos (simulados)
6. Envía la verificación
7. El alert debería cambiar a azul "En Revisión"

## 📊 Componentes UI

### VerificationAlert (Discreto)

```tsx
<VerificationAlert
  status="pending"
  isVerified={false}
  rejectionReason="Documentos incompletos"
/>
```

### VerificationForm (Multi-paso)

```tsx
<VerificationForm
  userId={user.id}
  userEmail={user.email}
/>
```

### VerificationBadge (Para perfil)

```tsx
<VerificationBadge isVerified={true} />
// Muestra: 🛡️ Verificada
```

## 🚀 Próximas Mejoras

- [ ] Panel de administración para revisar verificaciones
- [ ] Integración con servicio de almacenamiento (Cloudinary/S3)
- [ ] Notificaciones por email en cada estado
- [ ] Webhooks para terceros
- [ ] Estadísticas de verificaciones

## 🔍 Debugging

### Ver estado de verificación

```javascript
// En servidor
const user = await currentUser();
console.log('Verification Status:', user.publicMetadata?.verificationStatus);
console.log('Is Verified:', user.publicMetadata?.isVerified);
console.log('Data:', user.publicMetadata?.verificationData);
```

### Logs importantes

```
API Route:
  Recibiendo solicitud de verificación: user_xxx
  Datos: {companyName: '...', taxId: '...', documentsCount: 5}
  ✅ Verificación enviada exitosamente

Service:
  ✅ Verificación enviada para revisión: user_xxx
```

## 📝 Notas

- El sistema está diseñado para ser extensible
- Los documentos actualmente se simulan (TODO: integrar almacenamiento)
- El panel de admin está pendiente de implementación
- Tiempo estimado de revisión: 24-48 horas hábiles
