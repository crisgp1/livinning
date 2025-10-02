# Configuración de Clerk para Livinning

## ✅ Cambios Implementados

Se ha integrado completamente **Clerk** en la aplicación Livinning siguiendo las mejores prácticas de Next.js App Router:

### 1. Dependencias Instaladas
```bash
npm install @clerk/nextjs@latest
```

### 2. Archivos Modificados

- **`middleware.ts`**: Reemplazado con `clerkMiddleware()` para proteger rutas del dashboard
- **`app/layout.tsx`**: Agregado `<ClerkProvider>`
- **`components/layout/navbar.tsx`**: Integrados componentes `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, `<SignedIn>`, `<SignedOut>`
- **`app/dashboard/[role]/layout.tsx`**: Actualizado para usar `auth()` de Clerk
- **`components/layout/dashboard-layout.tsx`**: Actualizado para usar `useUser()` y `useClerk()`
- **`.env.local`**: Agregadas variables de entorno de Clerk

### 3. Sistema de Roles

Livinning maneja 6 roles de usuario:
- `USER` - Usuario regular
- `AGENCY` - Agencia inmobiliaria
- `PARTNER` - Socio
- `HELPDESK` - Soporte técnico
- `ADMIN` - Administrador
- `SUPERADMIN` - Superadministrador

Los roles se almacenan en `publicMetadata` de Clerk y se configuran durante el registro.

---

## 🚀 Pasos para Configurar Clerk

### 1. Crear una Aplicación en Clerk

1. Ve a [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Inicia sesión o crea una cuenta
3. Haz clic en **"+ Create application"**
4. Nombra tu aplicación: **"Livinning"**
5. Selecciona los proveedores de autenticación que desees:
   - ✅ Email
   - ✅ Google (opcional)
   - ✅ Facebook (opcional)
6. Haz clic en **"Create application"**

### 2. Obtener las API Keys

1. En el Dashboard de Clerk, ve a **"API Keys"**
2. Copia la **Publishable Key** (comienza con `pk_test_...` o `pk_live_...`)
3. Copia la **Secret Key** (comienza con `sk_test_...` o `sk_live_...`)

### 3. Configurar Variables de Entorno

Edita el archivo `.env.local` y reemplaza las claves:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxx
```

### 4. Configurar Metadata para Roles

Para manejar los roles de usuario, necesitas configurar el metadata durante el registro:

#### Opción A: Mediante Clerk Dashboard (Desarrollo/Pruebas)

1. Ve a **Users** en Clerk Dashboard
2. Crea o selecciona un usuario
3. Ve a la sección **"Public metadata"**
4. Agrega:
```json
{
  "role": "USER"
}
```

Los roles disponibles son: `USER`, `AGENCY`, `PARTNER`, `HELPDESK`, `ADMIN`, `SUPERADMIN`

#### Opción B: Mediante Webhook (Producción)

Para configurar roles automáticamente durante el registro:

1. En Clerk Dashboard, ve a **Webhooks**
2. Crea un nuevo endpoint: `https://tudominio.com/api/webhooks/clerk`
3. Selecciona evento: `user.created`
4. Crea el archivo `app/api/webhooks/clerk/route.ts`:

```typescript
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    return new Response('Error: Verification failed', { status: 400 })
  }

  // Handle user.created event
  if (evt.type === 'user.created') {
    const { id } = evt.data

    // Set default role to USER
    await fetch(\`https://api.clerk.com/v1/users/\${id}/metadata\`, {
      method: 'PATCH',
      headers: {
        'Authorization': \`Bearer \${process.env.CLERK_SECRET_KEY}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: {
          role: 'USER'
        }
      })
    })
  }

  return new Response('', { status: 200 })
}
```

### 5. Personalizar la UI de Clerk (Opcional)

Para que coincida con el tema de Livinning:

1. En Clerk Dashboard, ve a **Customization** > **Theme**
2. Selecciona **"Custom theme"**
3. Configura los colores:
   - Primary color: `#3b82f6` (blue-500)
   - Background: `#ffffff`
   - Text: `#171717` (neutral-900)

### 6. Configurar Redirects

Ya configurado en `.env.local`:

```env
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard/user
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard/user
```

**Nota**: El middleware de Clerk redirigirá automáticamente al dashboard correcto según el rol del usuario.

---

## 🧪 Probar la Integración

1. Asegúrate de tener las keys configuradas en `.env.local`
2. Reinicia el servidor de desarrollo:
```bash
npm run dev
```
3. Ve a `http://localhost:3000`
4. Haz clic en **"Registrarse"** o **"Iniciar Sesión"**
5. El modal de Clerk debería aparecer
6. Completa el registro/login
7. Deberías ser redirigido al dashboard

---

## 📝 Notas Importantes

### Migración de Usuarios Existentes

Si ya tienes usuarios en MongoDB, necesitarás migrarlos a Clerk:

1. Exporta los usuarios de MongoDB
2. Para cada usuario, crea una cuenta en Clerk vía API
3. Configura el metadata con su rol correspondiente

### Archivos del Sistema Anterior (Pueden Eliminarse)

- `lib/auth/crypto.ts` - Funciones de JWT
- `lib/auth/session.ts` - Gestión de sesiones con cookies
- `hooks/use-auth.ts` - Hook de autenticación personalizado
- `app/api/auth/*` - API routes de autenticación

**⚠️ No elimines aún**: Primero asegúrate de que todo funcione correctamente con Clerk.

### Dashboard de Roles

El dashboard redirecciona automáticamente según el rol:
- USER → `/dashboard/user`
- AGENCY → `/dashboard/agency`
- PARTNER → `/dashboard/partner`
- HELPDESK → `/dashboard/helpdesk`
- ADMIN → `/dashboard/admin`
- SUPERADMIN → `/dashboard/superadmin`

---

## 🐛 Troubleshooting

### Error: "The publishableKey passed to Clerk is invalid"
- Verifica que hayas copiado correctamente las keys de Clerk Dashboard
- Asegúrate de que las keys estén en `.env.local`, no en `.env`
- Reinicia el servidor después de cambiar las variables de entorno

### Usuario no tiene rol asignado
- Verifica que el metadata esté configurado en Clerk Dashboard
- El código espera `publicMetadata.role` en el usuario

### Redirect loop
- Verifica que las URLs de redirect en `.env.local` sean correctas
- Asegúrate de que el middleware no esté bloqueando las rutas de auth

---

## 📚 Recursos

- [Documentación oficial de Clerk](https://clerk.com/docs)
- [Next.js App Router Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [User Metadata](https://clerk.com/docs/users/metadata)
- [Webhooks](https://clerk.com/docs/integrations/webhooks/overview)
