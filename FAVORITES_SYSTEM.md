# Sistema de Favoritos

## 📍 Descripción

Sistema completo de favoritos que permite a los usuarios guardar propiedades de interés para consultarlas posteriormente. Implementado con **SOLID**, **Clean Code** y arquitectura REST.

## 🎯 Características

- Agregar/remover propiedades de favoritos
- Página dedicada para ver todos los favoritos
- Grid responsivo con PropertyCard
- Validación de autenticación
- Prevención de duplicados
- Feedback visual (toasts)

## 🏗️ Arquitectura

### Principios SOLID Aplicados

1. **Single Responsibility Principle (SRP)**:
   - `/api/favorites` - Gestión básica de favoritos (add/remove)
   - `/api/favorites/list` - Obtención de favoritos con propiedades completas
   - Página de favoritos - Solo visualización
   - Separación clara de responsabilidades

2. **Open/Closed Principle (OCP)**:
   - API extensible para agregar funcionalidades (compartir, categorías, etc.)
   - Componentes reutilizables

3. **Dependency Inversion Principle (DIP)**:
   - Componentes dependen de abstracciones (API)
   - No dependen de implementación específica de BD

## 📁 Estructura de Archivos

```
app/
├── api/favorites/
│   ├── route.ts                    # POST, DELETE, GET (solo IDs)
│   └── list/
│       └── route.ts                # ✅ GET con propiedades completas
│
├── dashboard/[role]/favoritos/
│   └── page.tsx                    # ✅ Página de favoritos
│
components/
└── properties/
    ├── favorite-button.tsx         # Botón para agregar/quitar favorito
    └── property-card.tsx           # Card usado en grid de favoritos
```

## 🔧 API Endpoints

### 1. POST /api/favorites - Agregar a Favoritos

**Request**:
```json
POST /api/favorites

Headers:
  Content-Type: application/json

Body:
{
  "propertyId": "68ddf0b34c76dcb7f3ce2d7a"
}
```

**Response Success (201)**:
```json
{
  "success": true,
  "data": {
    "message": "Agregado a favoritos"
  }
}
```

**Response Errors**:
| Status | Code | Descripción |
|--------|------|-------------|
| 401 | UNAUTHORIZED | No autenticado |
| 400 | VALIDATION_ERROR | propertyId no proporcionado |
| 400 | ALREADY_EXISTS | Ya está en favoritos |
| 500 | INTERNAL_ERROR | Error del servidor |

### 2. DELETE /api/favorites - Quitar de Favoritos

**Request**:
```json
DELETE /api/favorites

Headers:
  Content-Type: application/json

Body:
{
  "propertyId": "68ddf0b34c76dcb7f3ce2d7a"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "message": "Eliminado de favoritos"
  }
}
```

**Response Errors**:
| Status | Code | Descripción |
|--------|------|-------------|
| 401 | UNAUTHORIZED | No autenticado |
| 400 | VALIDATION_ERROR | propertyId no proporcionado |
| 404 | NOT_FOUND | No está en favoritos |
| 500 | INTERNAL_ERROR | Error del servidor |

### 3. GET /api/favorites - Obtener IDs de Favoritos

**Request**:
```
GET /api/favorites
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "favorites": [
      "68ddf0b34c76dcb7f3ce2d7a",
      "68ddf0b34c76dcb7f3ce2d7b",
      "68ddf0b34c76dcb7f3ce2d7c"
    ]
  }
}
```

**Uso**: Para verificar si una propiedad está en favoritos (FavoriteButton)

### 4. GET /api/favorites/list - Obtener Favoritos Completos ✅

**Request**:
```
GET /api/favorites/list
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "favorites": [
      {
        "favoriteId": "507f1f77bcf86cd799439011",
        "addedAt": "2024-01-15T10:30:00.000Z",
        "property": {
          "id": "68ddf0b34c76dcb7f3ce2d7a",
          "title": "Hermoso Departamento",
          "price": 15000,
          "currency": "MXN",
          "images": ["url1.jpg", "url2.jpg"],
          "city": "Guadalajara",
          "state": "Jalisco",
          "propertyType": "apartment",
          "transactionType": "rent",
          "bedrooms": 3,
          "bathrooms": 2,
          "area": 120,
          "parkingSpaces": 2,
          "views": 150,
          "ownerName": "Juan Pérez",
          "ownerType": "USER"
        }
      }
    ],
    "total": 1
  }
}
```

**Características**:
- Hace populate de las propiedades completas
- Mantiene orden cronológico (más recientes primero)
- Filtra propiedades que ya no existen
- Retorna total de favoritos

## 📱 Página de Favoritos

### Ubicación
`app/dashboard/[role]/favoritos/page.tsx`

### Ruta
```
/dashboard/user/favoritos
/dashboard/agency/favoritos
```

### Estados del Componente

```typescript
interface FavoriteItem {
  favoriteId: string;
  addedAt: Date;
  property: Property;
}

const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
const [isLoading, setIsLoading] = useState(true);
```

### UI States

#### 1. Loading

```tsx
{isLoading && (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
    <p>Cargando favoritos...</p>
  </div>
)}
```

#### 2. Empty State

```tsx
{favorites.length === 0 && (
  <Alert>
    <Heart className="h-4 w-4" />
    <AlertDescription>
      Aún no has agregado propiedades a tus favoritos.
      Explora las propiedades disponibles y haz clic en el ícono de corazón.
    </AlertDescription>
  </Alert>
)}
```

#### 3. Grid con Propiedades

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {favorites.map((item) => (
    <PropertyCard key={item.property.id} {...item.property} />
  ))}
</div>
```

## 🎨 UI/UX

### Header

```
┌─────────────────────────────────────┐
│  ❤️  Mis Favoritos                  │
│     3 propiedades guardadas         │
└─────────────────────────────────────┘
```

### Grid Responsivo

- **Mobile** (< 768px): 1 columna
- **Tablet** (768px - 1024px): 2 columnas
- **Desktop** (> 1024px): 3 columnas

### PropertyCard Features

- Imagen de la propiedad
- Badge de tipo (Casa, Departamento, etc.)
- Badge de operación (Venta/Renta)
- Título
- Precio con formato
- Características (habitaciones, baños, m²)
- Ubicación
- Botón de favoritos (❤️)

## 🔄 Flujo de Usuario

### Agregar a Favoritos

```
1. Usuario navega en /propiedades
   ↓
2. Ve PropertyCard con botón de corazón (outline)
   ↓
3. Hace clic en ❤️
   ↓
4. POST /api/favorites { propertyId }
   ↓
5. Success:
   → Corazón se llena (filled)
   → Toast: "Agregado a favoritos"

   Error:
   → Toast con mensaje de error
```

### Ver Favoritos

```
1. Usuario va a /dashboard/user/favoritos
   ↓
2. Loading spinner mientras carga
   ↓
3. GET /api/favorites/list
   ↓
4. Muestra grid de propiedades favoritas
   ↓
5. Usuario puede:
   - Ver detalles (click en card)
   - Quitar de favoritos (click en ❤️)
   - Navegar a la propiedad
```

### Quitar de Favoritos

```
1. Usuario en página de favoritos
   ↓
2. Hace clic en ❤️ (filled) de una propiedad
   ↓
3. DELETE /api/favorites { propertyId }
   ↓
4. Success:
   → Propiedad desaparece del grid
   → Toast: "Eliminado de favoritos"
   → Grid se actualiza

   Error:
   → Toast con mensaje de error
```

## 🔒 Seguridad

### Validaciones Implementadas

1. **Autenticación** (todas las rutas):
```typescript
const { userId } = await auth();
if (!userId) return 401;
```

2. **Validación de entrada**:
```typescript
if (!propertyId) return 400;
```

3. **Prevención de duplicados**:
```typescript
const existing = await collection.findOne({ userId, propertyId });
if (existing) return 400;
```

4. **Aislamiento de datos**:
- Solo se devuelven favoritos del usuario autenticado
- No se pueden ver favoritos de otros usuarios

## 📊 Base de Datos

### Collection: favorites

```typescript
interface FavoriteDocument {
  _id: ObjectId;
  userId: string;        // Clerk user ID
  propertyId: ObjectId;  // Reference to property
  createdAt: Date;       // Fecha de agregado
}
```

### Índices Recomendados

```javascript
// Índice compuesto para búsquedas por usuario
db.favorites.createIndex({ userId: 1, propertyId: 1 }, { unique: true });

// Índice para ordenar por fecha
db.favorites.createIndex({ createdAt: -1 });

// Índice para buscar por propiedad
db.favorites.createIndex({ propertyId: 1 });
```

### Queries Comunes

**1. Favoritos de un usuario**:
```javascript
db.favorites.find({ userId: "clerk_user_123" }).sort({ createdAt: -1 })
```

**2. Verificar si está en favoritos**:
```javascript
db.favorites.findOne({ userId: "clerk_user_123", propertyId: ObjectId("...") })
```

**3. Contar favoritos de una propiedad**:
```javascript
db.favorites.countDocuments({ propertyId: ObjectId("...") })
```

## 🔧 Código Ejemplo

### Usar en Componente

```typescript
import { useState, useEffect } from 'react';

export function MyFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites/list');
        const data = await response.json();

        if (data.success) {
          setFavorites(data.data.favorites);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <div>
      {favorites.map(item => (
        <PropertyCard key={item.property.id} {...item.property} />
      ))}
    </div>
  );
}
```

### Agregar/Quitar Favorito

```typescript
const toggleFavorite = async (propertyId: string, isFavorite: boolean) => {
  try {
    const method = isFavorite ? 'DELETE' : 'POST';

    const response = await fetch('/api/favorites', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId }),
    });

    const data = await response.json();

    if (data.success) {
      toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
      // Actualizar UI
    } else {
      toast.error(data.error.message);
    }
  } catch (error) {
    toast.error('Error al actualizar favoritos');
  }
};
```

## 💡 Clean Code Aplicado

1. **Nombres descriptivos**: `fetchFavorites()`, `FavoriteItem`, `isLoading`
2. **Single Responsibility**: Cada endpoint hace una cosa
3. **DRY**: Reutiliza PropertyCard
4. **Manejo de errores**: Try/catch exhaustivo
5. **TypeScript**: Interfaces claras
6. **Separación de concerns**: API/UI/Lógica separados

## 🚀 Próximas Mejoras

- [ ] Categorías de favoritos (Para comprar, Para rentar, Favoritos)
- [ ] Notas personales en cada favorito
- [ ] Compartir favoritos con otros usuarios
- [ ] Comparador de favoritos
- [ ] Notificaciones de cambios de precio
- [ ] Exportar favoritos a PDF
- [ ] Límite de favoritos para usuarios free
- [ ] Drag & drop para reordenar

## 🔗 Integración con FavoriteButton

El componente `FavoriteButton` debe:
1. Verificar si está en favoritos al montar
2. Llamar POST/DELETE según estado
3. Actualizar estado local tras respuesta

```tsx
// components/properties/favorite-button.tsx
const [isFavorite, setIsFavorite] = useState(false);

useEffect(() => {
  // Check if in favorites
  fetch('/api/favorites')
    .then(res => res.json())
    .then(data => {
      const favorites = data.data.favorites;
      setIsFavorite(favorites.includes(propertyId));
    });
}, [propertyId]);
```

## 📖 Referencias

- [MongoDB Aggregation](https://www.mongodb.com/docs/manual/aggregation/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Clerk Authentication](https://clerk.com/docs)
- [REST API Best Practices](https://restfulapi.net/)
