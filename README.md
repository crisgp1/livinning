# 🏠 Livinning - Plataforma de Bienes Raíces

Plataforma completa de bienes raíces con **6 tipos de usuarios** y sistema de roles avanzado.

## 📋 Stack Tecnológico

- **Framework**: Next.js 15.5.4 (App Router + Turbopack)
- **Runtime**: React 19.1.0
- **Language**: TypeScript 5
- **Database**: MongoDB 6.20.0 (sin ORMs)
- **Auth**: JWT + bcryptjs
- **Validation**: Zod 4.1.11
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (21 componentes)
- **Icons**: Lucide React
- **Animation**: Motion 12.23.22

## 👥 Tipos de Usuarios

### 🌐 Lado Cliente (Público)

1. **USER** - Usuario común
   - ✅ Publicar 1 propiedad gratis
   - ✅ Dar likes a propiedades
   - ✅ Guardar favoritos

2. **AGENCY** - Agencia inmobiliaria
   - ✅ Propiedades ilimitadas
   - ✅ Analíticas avanzadas
   - 💳 Suscripción mensual

### 🏢 Lado Interno (Livinning)

3. **ADMIN** - Administrador
4. **SUPERADMIN** - Superadministrador
5. **HELPDESK** - Soporte técnico
6. **PARTNER** - Socio/Referido (10% comisión)

## 🚀 Setup Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/livinning
JWT_SECRET=tu-secret-super-seguro
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Iniciar MongoDB

```bash
docker run -d -p 27017:27017 --name livinning-mongo mongo:latest
```

### 4. Iniciar desarrollo

```bash
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000)

## 📁 Estructura

```
livinning/
├── app/
│   ├── (public)/              # Rutas públicas
│   ├── dashboard/[role]/      # Dashboards dinámicos
│   └── api/auth/              # Autenticación
├── components/
│   ├── ui/                    # shadcn/ui (21)
│   └── layout/                # Navbar, Footer, Sidebar
├── lib/
│   ├── auth/                  # JWT, permisos (34+ funciones)
│   ├── db/                    # MongoDB sin ORM
│   └── dashboard/             # Config 6 dashboards
├── hooks/                     # useAuth, useRole, useDashboard
└── types/                     # TypeScript types
```

## 🔐 Autenticación

```typescript
POST /api/auth/login      // Login
POST /api/auth/register   // Register
POST /api/auth/logout     // Logout
GET  /api/auth/me         // Current user
```

## 🛡️ Permisos

```typescript
USER: { maxProperties: 1 }
AGENCY: { maxProperties: 'unlimited' }
ADMIN: { canEditAllProperties: true }
```

## 🎨 Diseño

- Paleta azul Airbnb (#3b82f6)
- 21 componentes shadcn/ui
- Clases custom: `.btn-primary`, `.card-airbnb`

## 📝 Scripts

```bash
npm run dev        # Desarrollo
npm run build      # Build
npm start          # Producción
```

## 🚧 Próximos Pasos

- [ ] Widgets del dashboard
- [ ] Páginas login/register
- [ ] CRUD propiedades
- [ ] Sistema de favoritos
- [ ] Integración Stripe

## 📚 Docs

- [Next.js](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [MongoDB](https://docs.mongodb.com/)

---

**Livinning** © 2025
