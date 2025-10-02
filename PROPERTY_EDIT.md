# Sistema de Edición de Propiedades

## 📝 Descripción

Sistema que permite a los usuarios editar sus propiedades publicadas. Implementado con **SOLID**, **Clean Code** y validaciones de seguridad para asegurar que solo los propietarios puedan modificar sus propiedades.

## 🎯 Características

- Edición completa de información de propiedad
- Carga de datos existentes desde la API
- Validación de propietario (solo el dueño puede editar)
- Actualización de imágenes
- Feedback visual durante carga y actualización
- Redireccionamiento automático después de guardar

## 🏗️ Arquitectura

### Principios SOLID Aplicados

1. **Single Responsibility Principle (SRP)**:
   - Página de edición: Solo maneja la edición de una propiedad
   - API PUT endpoint: Solo actualiza la propiedad
   - Validación separada de lógica de negocio

2. **Open/Closed Principle (OCP)**:
   - Fácil extensión para agregar nuevos campos
   - Estructura reutilizable del formulario

3. **Dependency Inversion Principle (DIP)**:
   - Componente depende de la API, no de implementación específica de BD
   - Servicios abstractos para operaciones CRUD

## 📁 Estructura de Archivos

```
app/
├── dashboard/[role]/propiedades/
│   ├── [id]/
│   │   └── editar/
│   │       └── page.tsx                # ✅ Página de edición
│   ├── nueva/
│   │   └── page.tsx                    # Crear nueva propiedad
│   └── page.tsx                        # Lista de propiedades

app/api/properties/[id]/
└── route.ts                            # ✅ PUT endpoint agregado

components/properties/
└── property-table.tsx                  # ✅ Link a editar ya existe

lib/db/models/
└── property.ts                         # updateProperty() function
```

## 🔧 API Endpoint - PUT

### Ubicación
`app/api/properties/[id]/route.ts`

### Request

```typescript
PUT /api/properties/{id}

Headers:
  Content-Type: application/json

Body:
{
  "title": "Título actualizado",
  "description": "Descripción actualizada",
  "propertyType": "apartment",
  "transactionType": "rent",
  "locationType": "city",
  "price": 15000,
  "state": "Jalisco",
  "city": "Guadalajara",
  "address": "Av. Americas 1500",
  "zipCode": "44630",
  "country": "México",
  "currency": "MXN",
  "bedrooms": 3,
  "bathrooms": 2,
  "area": 120,
  "parkingSpaces": 2,
  "images": ["url1", "url2", "url3"]
}
```

### Response Success (200)

```json
{
  "success": true,
  "data": {
    "property": {
      "id": "68ddf0b34c76dcb7f3ce2d7a",
      "title": "Título actualizado",
      // ... resto de campos
    }
  }
}
```

### Response Errors

| Status | Code | Descripción |
|--------|------|-------------|
| 401 | UNAUTHORIZED | Usuario no autenticado |
| 403 | FORBIDDEN | Usuario no es el propietario |
| 404 | NOT_FOUND | Propiedad no existe |
| 500 | INTERNAL_ERROR | Error del servidor |

### Seguridad

**Validaciones implementadas**:
1. ✅ Verificar autenticación con Clerk
2. ✅ Verificar que la propiedad existe
3. ✅ Verificar que el usuario es el propietario (`property.ownerId === userId`)
4. ✅ Prevenir cambio de propietario (ownerId, ownerType, ownerName)

```typescript
// No permitir cambiar propietario
const updatedProperty = await updateProperty(id, {
  ...body,
  ownerId: undefined,
  ownerType: undefined,
  ownerName: undefined,
});
```

## 🎨 Página de Edición

### Ubicación
`app/dashboard/[role]/propiedades/[id]/editar/page.tsx`

### Ruta
```
/dashboard/user/propiedades/68ddf0b34c76dcb7f3ce2d7a/editar
/dashboard/agency/propiedades/68ddf0b34c76dcb7f3ce2d7a/editar
```

### Estados del Componente

#### 1. Estado de Carga (Fetching)

```typescript
const [isFetching, setIsFetching] = useState(true);
```

**UI durante carga**:
```tsx
<div className="flex items-center justify-center min-h-screen">
  <Loader2 className="h-12 w-12 animate-spin text-primary" />
  <p>Cargando propiedad...</p>
</div>
```

#### 2. Estado de Formulario

```typescript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  propertyType: '',
  transactionType: '',
  locationType: '',
  price: '',
  state: '',
  city: '',
  address: '',
  zipCode: '',
  bedrooms: '',
  bathrooms: '',
  area: '',
  parkingSpaces: '',
});
```

#### 3. Estado de Guardado

```typescript
const [isLoading, setIsLoading] = useState(false);
```

**UI durante guardado**:
```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
  {isLoading ? 'Actualizando...' : 'Guardar cambios'}
</Button>
```

### Flujo de Datos

```
1. Componente monta
   ↓
2. useEffect ejecuta fetchProperty()
   ↓
3. GET /api/properties/{id}
   ↓
4. Llenar formData con datos existentes
   ↓
5. setIsFetching(false) → Mostrar formulario
   ↓
6. Usuario edita campos
   ↓
7. Usuario hace submit
   ↓
8. PUT /api/properties/{id}
   ↓
9. Success → Redirigir a lista
   Error → Mostrar toast
```

### Código del useEffect

```typescript
useEffect(() => {
  const fetchProperty = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(`/api/properties/${propertyId}`);
      const data = await response.json();

      if (data.success && data.data.property) {
        const prop = data.data.property as Property;
        setProperty(prop);

        // Llenar formulario
        setFormData({
          title: prop.title || '',
          description: prop.description || '',
          // ... resto de campos
        });

        setImages(prop.images || []);
      } else {
        toast.error('No se pudo cargar la propiedad');
        router.push(`/dashboard/${userRole}/propiedades`);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Error al cargar la propiedad');
      router.push(`/dashboard/${userRole}/propiedades`);
    } finally {
      setIsFetching(false);
    }
  };

  if (propertyId) {
    fetchProperty();
  }
}, [propertyId, userRole, router]);
```

### Código del handleSubmit

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch(`/api/properties/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType,
        transactionType: formData.transactionType,
        locationType: formData.locationType || undefined,
        price: parseFloat(formData.price),
        state: formData.state,
        city: formData.city,
        address: formData.address,
        zipCode: formData.zipCode,
        country: 'México',
        currency: 'MXN',
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
        area: parseFloat(formData.area),
        parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : undefined,
        images,
      }),
    });

    const data = await response.json();

    if (data.success) {
      toast.success('Propiedad actualizada exitosamente');
      router.push(`/dashboard/${userRole}/propiedades`);
    } else {
      toast.error(data.error?.message || 'Error al actualizar propiedad');
    }
  } catch (error) {
    console.error('Error updating property:', error);
    toast.error('Error al actualizar propiedad');
  } finally {
    setIsLoading(false);
  }
};
```

## 🔗 Integración con PropertyTable

El componente `PropertyTable` ya tiene el link configurado:

```tsx
<DropdownMenuItem asChild>
  <Link href={`${baseUrl}/${property.id}/editar`}>
    <Edit className="h-4 w-4 mr-2" />
    Editar
  </Link>
</DropdownMenuItem>
```

**baseUrl** depende del rol:
- USER: `/dashboard/user/propiedades`
- AGENCY: `/dashboard/agency/propiedades`
- Genera: `/dashboard/{role}/propiedades/{id}/editar`

## 🎨 UI/UX

### Estructura Visual

```
┌─────────────────────────────────────────┐
│  ← Editar propiedad                     │
│  Actualiza la información de tu...      │
├─────────────────────────────────────────┤
│                                         │
│  🏠 Información básica                  │
│  ┌─────────────────────────────────┐   │
│  │ Título *                        │   │
│  │ Descripción *                   │   │
│  │ Tipo | Operación                │   │
│  │ Tipo de ubicación               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📍 Ubicación                           │
│  ┌─────────────────────────────────┐   │
│  │ Estado | Ciudad                 │   │
│  │ CP | Dirección                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  💰 Precio y detalles                   │
│  ┌─────────────────────────────────┐   │
│  │ Precio | Habitaciones | Baños   │   │
│  │ m² | Estacionamientos           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📷 Imágenes                            │
│  ┌─────────────────────────────────┐   │
│  │  Drag & drop area               │   │
│  │  [img] [img] [img] [img]        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Cancelar]         [Guardar cambios]  │
└─────────────────────────────────────────┘
```

### Diferencias con página de creación

| Aspecto | Crear Nueva | Editar |
|---------|------------|--------|
| Título | "Publicar nueva propiedad" | "Editar propiedad" |
| Campos | Vacíos | Pre-llenados |
| Botón | "Publicar propiedad" | "Guardar cambios" |
| Loading inicial | No | Sí (fetching) |
| Validación límite | Sí (PropertyLimitService) | No |
| API Method | POST | PUT |

## 🔄 Flujo Completo de Usuario

```
1. Usuario va a /dashboard/user/propiedades
   ↓
2. Ve tabla de sus propiedades
   ↓
3. Hace clic en menú (⋮) de una propiedad
   ↓
4. Selecciona "Editar"
   ↓
5. Navega a /dashboard/user/propiedades/{id}/editar
   ↓
6. Ve pantalla de carga (spinner)
   ↓
7. Datos se cargan en formulario
   ↓
8. Usuario modifica campos (título, precio, etc.)
   ↓
9. Usuario hace clic en "Guardar cambios"
   ↓
10. Botón muestra "Actualizando..." con spinner
    ↓
11a. ÉXITO:
    → Toast: "Propiedad actualizada exitosamente"
    → Redirige a /dashboard/user/propiedades

11b. ERROR:
    → Toast: Mensaje de error
    → Permanece en página de edición
```

## 🛡️ Validaciones

### Frontend

```typescript
// Campos requeridos en HTML
<Input required />
<Textarea required />
<Select required />

// Validación de tipos
price: parseFloat(formData.price)
bedrooms: parseInt(formData.bedrooms)
```

### Backend (API)

```typescript
// 1. Autenticación
const { userId } = await auth();
if (!userId) return 401;

// 2. Existencia
const property = await findPropertyById(id);
if (!property) return 404;

// 3. Autorización
if (property.ownerId !== userId) return 403;

// 4. Campos protegidos
ownerId: undefined,
ownerType: undefined,
ownerName: undefined,
```

## 🚨 Manejo de Errores

### Error: Propiedad no encontrada

```typescript
if (!data.success) {
  toast.error('No se pudo cargar la propiedad');
  router.push(`/dashboard/${userRole}/propiedades`);
}
```

### Error: Sin permisos

Si el usuario intenta editar una propiedad que no le pertenece:

```
PUT /api/properties/{id}
→ 403 FORBIDDEN
→ Toast: "No tienes permisos para editar esta propiedad"
```

### Error: Red/Servidor

```typescript
catch (error) {
  console.error('Error updating property:', error);
  toast.error('Error al actualizar propiedad');
}
```

## 💡 Clean Code Aplicado

1. **Nombres descriptivos**: `fetchProperty()`, `handleSubmit()`, `isFetching`
2. **Funciones pequeñas**: Cada función hace una cosa
3. **DRY**: Reutiliza estructura de formulario de nueva propiedad
4. **Separación de concerns**: UI, lógica, API separados
5. **Manejo de errores**: Try/catch con mensajes claros
6. **Estados claros**: isFetching vs isLoading (loading inicial vs guardado)
7. **TypeScript**: Tipado fuerte con interfaces

## 🔧 Extensibilidad

### Agregar nuevo campo

**1. Agregar al type en `types/index.ts`**:
```typescript
export interface Property {
  // ... campos existentes
  yearBuilt?: number; // Nuevo campo
}
```

**2. Agregar al modelo en `lib/db/models/property.ts`**:
```typescript
export function propertyDocumentToProperty(doc: PropertyDocument): Property {
  return {
    // ... campos existentes
    yearBuilt: doc.yearBuilt,
  };
}
```

**3. Agregar al formulario**:
```tsx
const [formData, setFormData] = useState({
  // ... campos existentes
  yearBuilt: '',
});

// En fetchProperty:
yearBuilt: prop.yearBuilt?.toString() || '',

// En el JSX:
<Input
  type="number"
  value={formData.yearBuilt}
  onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
/>

// En handleSubmit:
yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : undefined,
```

## 🎓 Patrones de Diseño

### 1. Single Source of Truth
Los datos vienen de la API, el formulario es solo representación.

### 2. Optimistic UI (no implementado)
Podría mejorarse mostrando cambios inmediatamente antes de confirmar con servidor.

### 3. Form State Management
Estado local simple con useState, escalable a React Hook Form si crece.

### 4. Error Boundary
Redirección automática si la propiedad no se puede cargar.

## 🚀 Próximas Mejoras

- [ ] Validación con Zod/Yup en frontend
- [ ] Subida de imágenes real a Cloudinary/S3
- [ ] Botón "Guardar borrador" funcional
- [ ] Historial de cambios
- [ ] Preview de cambios antes de guardar
- [ ] Autoguardado cada X segundos
- [ ] Diff visual de cambios
- [ ] Rollback a versión anterior

## 📖 Ejemplos de Uso

### Editar título y precio

```typescript
// 1. Usuario carga /dashboard/user/propiedades/123/editar
// 2. Formulario se llena con datos existentes
// 3. Usuario cambia:
formData.title = "Nuevo título actualizado"
formData.price = "20000"

// 4. Submit
PUT /api/properties/123
{
  title: "Nuevo título actualizado",
  price: 20000,
  // ... resto sin cambios
}

// 5. Success
→ Toast: "Propiedad actualizada exitosamente"
→ Redirect: /dashboard/user/propiedades
```

### Editar imágenes

```typescript
// 1. Usuario ve imágenes actuales
images = ["img1.jpg", "img2.jpg", "img3.jpg"]

// 2. Usuario elimina img2
removeImage(1)
images = ["img1.jpg", "img3.jpg"]

// 3. Usuario agrega nueva imagen
handleImageUpload(newFile)
images = ["img1.jpg", "img3.jpg", "newimg.jpg"]

// 4. Submit con nuevas imágenes
```

## 🔗 Referencias

- [Next.js Dynamic Routes](https://nextjs.org/docs/routing/dynamic-routes)
- [React useState Hook](https://react.dev/reference/react/useState)
- [Clerk Authentication](https://clerk.com/docs)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
