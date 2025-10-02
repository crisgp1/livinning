# Sistema de Gestión de Propiedades

## 📋 Descripción

Sistema completo para que los usuarios gestionen sus propiedades publicadas desde el dashboard, siguiendo principios de **Clean Code** y **SOLID**.

## 🏗️ Arquitectura

### Principios Aplicados

1. **Single Responsibility Principle (SRP)**:
   - `PropertyTable` - Solo maneja la visualización y acciones de la tabla
   - `PropertiesPage` - Solo coordina los componentes de la página
   - Endpoints API - Cada uno maneja una operación específica

2. **Open/Closed Principle (OCP)**:
   - Componentes extensibles mediante props
   - Fácil agregar nuevas columnas o acciones

3. **Dependency Inversion Principle (DIP)**:
   - Componentes dependen de abstracciones (tipos de Property)
   - Servicios desacoplados de la UI

## 📁 Estructura de Archivos

```
app/
├── dashboard/
│   └── [role]/
│       └── propiedades/
│           ├── page.tsx          # ✅ Listado de propiedades
│           └── nueva/
│               └── page.tsx      # ✅ Crear propiedad
├── api/
    └── properties/
        ├── route.ts              # GET (list), POST (create)
        └── [id]/
            └── route.ts          # GET (detail), DELETE (delete)

components/
└── properties/
    ├── property-table.tsx        # ✅ Tabla de propiedades
    ├── property-card.tsx         # ✅ Tarjeta de propiedad
    ├── property-filters.tsx      # ✅ Filtros de búsqueda
    └── property-map.tsx          # ✅ Mapa de propiedades

lib/
├── db/
│   └── models/
│       └── property.ts           # CRUD operations
└── services/
    └── geocoding.service.ts      # Geocodificación
```

## 🎯 Funcionalidades

### Página de Propiedades (`/dashboard/[role]/propiedades`)

#### Para Usuarios (USER)
- Ver todas sus propiedades publicadas
- Tabla con información resumida
- Ver vistas de cada propiedad
- Editar propiedades
- Eliminar propiedades
- Botón para crear nueva propiedad (si no alcanzó el límite)
- Alert informativo con límite actual

#### Para Agencias (AGENCY)
- Todo lo anterior
- Sin límite de propiedades (si suscripción activa)
- Estadísticas más detalladas

## 🔧 Componentes

### PropertyTable

**Ubicación**: `components/properties/property-table.tsx`

**Props**:
```typescript
interface PropertyTableProps {
  properties: Property[];      // Propiedades a mostrar
  currentPage: number;         // Página actual
  totalPages: number;          // Total de páginas
  baseUrl: string;            // URL base para navegación
}
```

**Características**:
- ✅ Tabla responsive con shadcn/ui Table
- ✅ Columnas: Imagen, Título, Tipo, Precio, Ubicación, Estado, Vistas, Acciones
- ✅ Dropdown menu con acciones (Ver, Editar, Eliminar)
- ✅ Dialog de confirmación para eliminar
- ✅ Paginación integrada
- ✅ Estados de la propiedad con badges
- ✅ Manejo de errores con toast

**Estados de Propiedad**:
| Estado | Badge | Descripción |
|--------|-------|-------------|
| `active` | Verde | Activa y visible |
| `pending` | Gris | Pendiente de aprobación |
| `rejected` | Rojo | Rechazada |
| `sold` | Outline | Vendida |
| `rented` | Outline | Rentada |

### PropertiesPage

**Ubicación**: `app/dashboard/[role]/propiedades/page.tsx`

**Características**:
- ✅ Autenticación con Clerk
- ✅ Obtiene propiedades del usuario autenticado
- ✅ Paginación (10 propiedades por página)
- ✅ Alert informativo con límite
- ✅ Botón para nueva propiedad (validado)
- ✅ Card vacío cuando no hay propiedades

**Validaciones**:
```typescript
// Usuario puede publicar si:
const canPublish = userRole === 'USER'
  ? total < propertyLimit           // No alcanzó el límite
  : userRole === 'AGENCY'
  ? subscriptionStatus === 'active' // Suscripción activa
  : false;
```

## 🌐 API Endpoints

### DELETE `/api/properties/[id]`

**Autenticación**: ✅ Requerida

**Validaciones**:
1. Usuario autenticado
2. Propiedad existe
3. Usuario es el propietario

**Respuesta Exitosa**:
```json
{
  "success": true,
  "data": {
    "message": "Propiedad eliminada exitosamente"
  }
}
```

**Errores**:
- `401` - No autenticado
- `403` - No es el propietario
- `404` - Propiedad no encontrada
- `500` - Error del servidor

## 🎨 UI/UX

### Acciones Disponibles

1. **Ver en sitio público**:
   - Abre la propiedad en nueva pestaña
   - URL: `/propiedades/[id]`

2. **Editar**:
   - Redirige a página de edición
   - URL: `/dashboard/[role]/propiedades/[id]/editar`
   - ⚠️ Pendiente de implementar

3. **Eliminar**:
   - Muestra dialog de confirmación
   - Elimina la propiedad de la BD
   - Recarga la página

### Mensajes Informativos

**Usuario (USER)**:
- `"Tienes X propiedad(es) publicada(s). Puedes publicar Y propiedad(es) más."`
- `"Has alcanzado el límite de X propiedad(es). Actualiza tu plan para publicar más."`

**Agencia (AGENCY)**:
- `"Tienes X propiedad(es) publicada(s). Como agencia, puedes publicar propiedades ilimitadas."`
- `"Tu suscripción no está activa. Reactívala para publicar propiedades."`

## 🔐 Seguridad

### Validaciones Implementadas

1. **Autenticación**:
   ```typescript
   const { userId } = await auth();
   if (!userId) redirect('/');
   ```

2. **Autorización**:
   ```typescript
   if (property.ownerId !== userId) {
     return 403 Forbidden;
   }
   ```

3. **Límites de Propiedades**:
   ```typescript
   const canPublish = total < propertyLimit;
   ```

## 📊 Datos Mostrados

### Tabla de Propiedades

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| Imagen | Thumbnail 48x48px | Primera imagen o placeholder |
| Título | Nombre de la propiedad | "Departamento en Reforma" |
| Tipo | Tipo de propiedad | "Casa", "Departamento" |
| Precio | Precio con formato | "$25,000/mes" |
| Ubicación | Ciudad, Estado | "CDMX, México" |
| Estado | Badge con estado | "Activa" |
| Vistas | Contador de vistas | 👁️ 521 |
| Acciones | Dropdown menu | Ver, Editar, Eliminar |

## 🚀 Flujo de Usuario

### Ver Propiedades

1. Usuario hace login
2. Navega a `/dashboard/user/propiedades` (desde sidebar)
3. Ve tabla con sus propiedades
4. Puede filtrar, ordenar, paginar
5. Puede realizar acciones (ver, editar, eliminar)

### Eliminar Propiedad

1. Usuario hace clic en "Eliminar" en dropdown
2. Se muestra dialog de confirmación
3. Usuario confirma
4. Se envía DELETE a `/api/properties/[id]`
5. Se valida que sea el propietario
6. Se elimina de la BD
7. Página se recarga
8. Toast de éxito

## 🎯 TODO Futuro

- [ ] Implementar página de edición de propiedades
- [ ] Agregar filtros en la tabla (por tipo, estado, etc.)
- [ ] Agregar ordenamiento por columnas
- [ ] Bulk actions (eliminar múltiples)
- [ ] Exportar propiedades a CSV/PDF
- [ ] Vista previa antes de publicar
- [ ] Duplicar propiedad
- [ ] Archivar en lugar de eliminar
- [ ] Historial de cambios
- [ ] Analytics por propiedad

## 📝 Ejemplos de Código

### Crear nueva propiedad

```typescript
// Ya implementado en /dashboard/[role]/propiedades/nueva
const response = await fetch('/api/properties', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Mi Propiedad',
    price: 25000,
    address: 'Av. Reforma 123',
    city: 'CDMX',
    state: 'México',
    propertyType: 'apartment',
    transactionType: 'rent',
    area: 120,
    // ... otros campos
  }),
});
```

### Eliminar propiedad

```typescript
// Implementado en PropertyTable
const response = await fetch(`/api/properties/${propertyId}`, {
  method: 'DELETE',
});

if (data.success) {
  toast.success('Propiedad eliminada');
  window.location.reload();
}
```

## 🔗 Navegación

### Sidebar Links

**USER**:
- Inicio → `/dashboard/user`
- **Mi Propiedad** → `/dashboard/user/propiedades` ✅
- Favoritos → `/dashboard/user/favoritos`
- Perfil → `/dashboard/user/perfil`

**AGENCY**:
- Inicio → `/dashboard/agency`
- Verificación → `/dashboard/agency/verificacion`
- **Propiedades** → `/dashboard/agency/propiedades` ✅
- Nueva Propiedad → `/dashboard/agency/propiedades/nueva`
- Analíticas → `/dashboard/agency/analiticas`
- Suscripción → `/dashboard/agency/suscripcion`
- Perfil → `/dashboard/agency/perfil`

## 🐛 Debugging

### Logs del Sistema

```bash
# Al listar propiedades
GET /api/properties - Params: { ownerId: "user_xxx", page: 1, limit: 10 }
✅ Found 5 properties (total: 5)

# Al eliminar propiedad
DELETE /api/properties/[id] - ID: 507f1f77bcf86cd799439011 User: user_xxx
✅ Property deleted: 507f1f77bcf86cd799439011
```

### Verificar en MongoDB

```javascript
// Ver propiedades de un usuario
db.properties.find({ ownerId: "user_xxx" })

// Contar propiedades
db.properties.countDocuments({ ownerId: "user_xxx" })
```

## ✅ Checklist de Implementación

- [x] Página de listado de propiedades
- [x] Componente PropertyTable
- [x] Endpoint DELETE
- [x] Autenticación y autorización
- [x] Dialog de confirmación
- [x] Paginación
- [x] Badges de estado
- [x] Dropdown de acciones
- [x] Validación de permisos
- [x] Toast notifications
- [x] Responsive design
- [x] Clean Code y SOLID

## 🎨 Componentes UI Usados

- ✅ Table (shadcn/ui)
- ✅ Card (shadcn/ui)
- ✅ Badge (shadcn/ui)
- ✅ Button (shadcn/ui)
- ✅ Alert (shadcn/ui)
- ✅ DropdownMenu (shadcn/ui)
- ✅ AlertDialog (shadcn/ui)
- ✅ Toast (sonner)
