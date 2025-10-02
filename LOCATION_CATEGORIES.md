# Sistema de Categorías de Ubicación

## 📍 Descripción

Sistema que permite a los usuarios explorar y filtrar propiedades según el tipo de ubicación (Ciudad, Playa, Montaña, Campo, Lago, Suburbio). Implementado con **SOLID**, **Clean Code** y **Framer Motion** para animaciones suaves. Diseño compacto tipo chip/badge.

## 🎯 Características

- 6 categorías de ubicación con emojis de Microsoft Fluent
- Diseño compacto tipo chip en una sola fila
- Animaciones suaves con Framer Motion
- Filtrado dinámico de propiedades
- Integración completa con el sistema de búsqueda
- Selector en formulario de publicación

## 🏗️ Arquitectura

### Principios SOLID Aplicados

1. **Single Responsibility Principle (SRP)**:
   - `LocationCategories` - Solo maneja la visualización y selección de categorías
   - `PropertyFilters` - Solo maneja filtros de búsqueda
   - Separación clara de responsabilidades

2. **Open/Closed Principle (OCP)**:
   - Fácil agregar nuevas categorías modificando solo el array de configuración
   - Componente extensible mediante props

3. **Dependency Inversion Principle (DIP)**:
   - Componente depende de tipos abstractos (LocationType)
   - No depende de implementación específica

## 📁 Estructura de Archivos

```
types/
└── index.ts                                # ✅ LocationType agregado

components/properties/
└── location-categories.tsx                 # ✅ Componente de categorías

app/(public)/propiedades/
└── page.tsx                                # ✅ Integración en página

app/dashboard/[role]/propiedades/nueva/
└── page.tsx                                # ✅ Selector en formulario

lib/db/models/
└── property.ts                             # ✅ Filtrado por locationType
```

## 🎨 Categorías Disponibles

| ID | Nombre | Emoji | Color de Fondo |
|----|--------|-------|----------------|
| `city` | Ciudad | 🏙️ | Azul claro (`bg-blue-100`) |
| `beach` | Playa | 🏖️ | Cian claro (`bg-cyan-100`) |
| `mountain` | Montaña | ⛰️ | Esmeralda claro (`bg-emerald-100`) |
| `countryside` | Campo | 🌾 | Verde claro (`bg-green-100`) |
| `lake` | Lago | 🏞️ | Sky claro (`bg-sky-100`) |
| `suburb` | Suburbio | 🏘️ | Violeta claro (`bg-violet-100`) |

## 🔧 Componente LocationCategories

### Ubicación
`components/properties/location-categories.tsx`

### Props
```typescript
// No requiere props, lee searchParams automáticamente
```

### Estructura

```typescript
interface LocationCategory {
  id: LocationType;
  name: string;
  emoji: string; // Emoji de Microsoft Fluent
  color: string; // Clases de Tailwind para colores
}
```

### Características de UI

#### Diseño Compacto

- **Layout**: Chips horizontales con flex-wrap
- **Tamaño**: `px-3 py-1.5` (padding pequeño)
- **Borde**: `rounded-full` (completamente redondeado)
- **Tipografía**: `text-sm` (14px)

#### Estados Visuales

1. **Normal**:
   - Fondo de color pastel (ej: `bg-blue-100`)
   - Texto de color oscuro (ej: `text-blue-700`)
   - Borde del mismo color (ej: `border-blue-200`)
   - Hover: Color más intenso

2. **Activo**:
   - Fondo primario (`bg-primary`)
   - Texto blanco
   - Ring con offset (`ring-2 ring-primary ring-offset-1`)
   - Sombra suave

3. **Animaciones**:
   ```typescript
   // Entrada (stagger rápido)
   initial={{ opacity: 0, scale: 0.8 }}
   animate={{ opacity: 1, scale: 1 }}
   transition={{ delay: index * 0.03, duration: 0.2 }}

   // Hover
   whileHover={{ scale: 1.05 }}

   // Click
   whileTap={{ scale: 0.95 }}

   // Emoji wobble en hover
   whileHover={{ rotate: [0, -15, 15, 0] }}
   transition={{ duration: 0.3 }}
   ```

### Código de Ejemplo

```tsx
import { LocationCategories } from '@/components/properties/location-categories';

export default function PropertiesPage() {
  return (
    <div>
      <PropertyFilters />
      <LocationCategories /> {/* Aquí se muestra */}
      <PropertiesMapView />
    </div>
  );
}
```

## 🔌 Integración en Filtros

### Página de Propiedades

**Archivo**: `app/(public)/propiedades/page.tsx`

```typescript
interface PropertiesPageProps {
  searchParams: Promise<{
    city?: string;
    propertyType?: string;
    transactionType?: string;
    locationType?: string; // ✅ Nuevo filtro
    page?: string;
    sortBy?: string;
  }>;
}

const { properties, total } = await listProperties({
  status: 'active',
  locationType: params.locationType, // ✅ Pasar a query
  // ... otros filtros
});
```

### Modelo de Propiedades

**Archivo**: `lib/db/models/property.ts`

```typescript
export async function listProperties(filters: {
  locationType?: string; // ✅ Nuevo filtro
  // ... otros filtros
}) {
  const query: Filter<PropertyDocument> = {};

  if (filters.locationType) {
    query.locationType = filters.locationType as any;
  }

  // ... resto del query
}
```

## 📝 Formulario de Publicación

### Ubicación
`app/dashboard/[role]/propiedades/nueva/page.tsx`

### Nuevo Campo

```typescript
const [formData, setFormData] = useState({
  // ... otros campos
  locationType: '', // ✅ Nuevo campo
});

// En el JSX:
<div className="space-y-2 md:col-span-2">
  <Label>Tipo de ubicación</Label>
  <Select
    value={formData.locationType}
    onValueChange={(value) => setFormData({ ...formData, locationType: value })}
  >
    <SelectTrigger>
      <SelectValue placeholder="Selecciona el tipo de ubicación" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="city">Ciudad - Propiedades en zonas urbanas</SelectItem>
      <SelectItem value="beach">Playa - Propiedades frente al mar</SelectItem>
      <SelectItem value="mountain">Montaña - Propiedades en zonas montañosas</SelectItem>
      <SelectItem value="countryside">Campo - Propiedades rurales</SelectItem>
      <SelectItem value="lake">Lago - Propiedades junto a lagos</SelectItem>
      <SelectItem value="suburb">Suburbio - Propiedades en zonas residenciales</SelectItem>
    </SelectContent>
  </Select>
  <p className="text-xs text-neutral-500">
    Esto ayudará a los usuarios a encontrar tu propiedad según el tipo de ubicación que buscan
  </p>
</div>
```

### Envío al API

```typescript
const response = await fetch('/api/properties', {
  method: 'POST',
  body: JSON.stringify({
    ...formData,
    locationType: formData.locationType || undefined, // ✅ Opcional
  }),
});
```

## 🎬 Animaciones con Framer Motion

### Dependencia

```json
{
  "framer-motion": "^12.23.22"
}
```

### Animaciones Implementadas

#### 1. Entrada Staggered (Rápida)

```typescript
{categories.map((category, index) => (
  <motion.button
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.03, duration: 0.2 }}
  >
  </motion.button>
))}
```

**Efecto**: Los chips aparecen uno tras otro con delay de 30ms (más rápido que antes).

#### 2. Hover Effects (Suave)

```typescript
whileHover={{ scale: 1.05 }}
```

**Efecto**: Al pasar el mouse, el chip crece 5%.

#### 3. Click Feedback

```typescript
whileTap={{ scale: 0.95 }}
```

**Efecto**: Al hacer clic, el chip se comprime ligeramente.

#### 4. Emoji Wobble

```typescript
<motion.span
  whileHover={{ rotate: [0, -15, 15, 0] }}
  transition={{ duration: 0.3 }}
>
  {category.emoji}
</motion.span>
```

**Efecto**: El emoji hace un "wobble" más pronunciado al pasar el mouse.

#### 5. Active Indicator

```typescript
{isActive && (
  <motion.div
    layoutId="activeChip"
    className="absolute inset-0 rounded-full"
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  />
)}
```

**Efecto**: Animación fluida cuando cambia la selección (layout animation).

## 🔄 Flujo de Usuario

```
1. Usuario visita /propiedades
   ↓
2. Ve las 6 categorías en grid
   ↓
3. Hace clic en "Playa"
   ↓
4. Animaciones:
   - whileTap (scale 0.95)
   - Gradiente se activa (opacity 10% → 100%)
   - Texto cambia a blanco
   - Ring de selección aparece
   - layoutId anima el borde
   ↓
5. URL actualiza: /propiedades?locationType=beach
   ↓
6. Propiedades se filtran en servidor
   ↓
7. Mapa y lista muestran solo propiedades de playa
   ↓
8. Clic en la misma categoría = deseleccionar
```

## 🎯 Casos de Uso

### 1. Buscar propiedades de playa

```typescript
// Usuario hace clic en "Playa"
handleCategoryClick('beach')
  → Router actualiza a: /propiedades?locationType=beach
  → Server filtra: listProperties({ locationType: 'beach' })
  → Muestra solo propiedades con locationType: 'beach'
```

### 2. Combinar con otros filtros

```typescript
// Usuario busca departamentos de playa en venta
URL: /propiedades?propertyType=apartment&transactionType=sale&locationType=beach

// Query:
{
  propertyType: 'apartment',
  transactionType: 'sale',
  locationType: 'beach'
}
```

### 3. Publicar propiedad de montaña

```typescript
// En formulario de publicación
formData.locationType = 'mountain'

// Al guardar
POST /api/properties
{
  title: "Cabaña en la Sierra",
  locationType: "mountain", // ✅ Se guarda en BD
  // ... otros campos
}
```

## 🎨 Estilos y Colores

### Configuración de Colores por Categoría

```typescript
const categories = [
  { color: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' },      // Ciudad
  { color: 'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200' },      // Playa
  { color: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' },   // Montaña
  { color: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' },  // Campo
  { color: 'bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-200' },      // Lago
  { color: 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200' },  // Suburbio
];
```

### Estados Visuales

```typescript
className={`
  ${isActive
    ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary ring-offset-1'
    : category.color
  }
`}
```

- **Normal**: Colores pasteles con fondo claro
- **Hover**: Fondo ligeramente más oscuro (definido en clase)
- **Activo**: Fondo primary, texto blanco, ring con offset

## 📊 Base de Datos

### Schema

```typescript
// types/database.ts
export interface PropertyDocument {
  // ... otros campos
  locationType?: LocationType; // 'city' | 'beach' | 'mountain' | ...
}

// types/index.ts
export type LocationType =
  | 'city'
  | 'beach'
  | 'mountain'
  | 'countryside'
  | 'lake'
  | 'suburb';
```

### Índice Recomendado

```javascript
// MongoDB
db.properties.createIndex({ locationType: 1 });

// Índice compuesto para búsquedas comunes
db.properties.createIndex({
  locationType: 1,
  transactionType: 1,
  status: 1
});
```

## 🔍 Query Examples

### Filtrar solo por ubicación

```typescript
const { properties } = await listProperties({
  status: 'active',
  locationType: 'beach',
});
```

### Combinar múltiples filtros

```typescript
const { properties } = await listProperties({
  status: 'active',
  locationType: 'mountain',
  propertyType: 'house',
  transactionType: 'sale',
  minPrice: 1000000,
  maxPrice: 5000000,
});
```

## 📱 Responsive Design

### Flex Layout

```typescript
<div className="flex items-center gap-2 flex-wrap">
```

- **Layout**: Horizontal con wrap automático
- **Mobile**: Los chips se envuelven a múltiples líneas si es necesario
- **Desktop**: Todos los chips en una sola línea (6 chips caben fácilmente)

### Chip Sizing

```typescript
className="px-3 py-1.5 rounded-full text-sm"
```

- **Padding horizontal**: 12px (0.75rem)
- **Padding vertical**: 6px (0.375rem)
- **Border radius**: Completo (rounded-full)
- **Font size**: 14px (text-sm)
- **Emoji size**: 16px (text-base)
- **Gap entre emoji y texto**: 6px (gap-1.5)

## 💡 Clean Code Aplicado

1. **Nombres descriptivos**: `LocationCategories`, `handleCategoryClick`
2. **Single file configuration**: Array de categorías en un solo lugar
3. **Reusabilidad**: Componente standalone sin dependencias fuertes
4. **TypeScript**: Tipos fuertes para LocationType
5. **Composición**: Usa componentes de UI existentes (motion.button)
6. **Separación de concerns**: UI separada de lógica de routing

## 🚀 Próximas Mejoras

- [ ] Badge con contador de propiedades en cada chip
- [ ] Tooltip con descripción al hacer hover
- [ ] Lazy loading de categorías
- [ ] Categorías personalizadas por región
- [ ] Filtro combinado con rango de distancia
- [ ] Modo "Explorar" con mapa centrado en categoría
- [ ] Scroll horizontal suave en mobile si hay muchas categorías
- [ ] Botón "Ver todas" si se agregan más de 8 categorías

## 📖 Ejemplo Completo de Uso

### 1. Agregar nueva categoría

```typescript
// En location-categories.tsx
const categories: LocationCategory[] = [
  // ... categorías existentes
  {
    id: 'desert', // Agregar a LocationType en types/index.ts
    name: 'Desierto',
    emoji: '🏜️',
    color: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
  },
];
```

### 2. Personalizar animación

```typescript
// Cambiar timing de entrada
transition={{ delay: index * 0.05, duration: 0.3 }} // Más lento

// Cambiar efecto hover del chip
whileHover={{ scale: 1.08 }} // Escala mayor

// Emoji con rotación adicional
whileHover={{ rotate: [0, -20, 20, 0], scale: 1.2 }}
```

### 3. Integrar con analytics

```typescript
const handleCategoryClick = (categoryId: LocationType) => {
  // Analytics
  trackEvent('category_clicked', { category: categoryId });

  // Routing
  const params = new URLSearchParams(searchParams.toString());
  // ...
};
```

## 🔗 Referencias

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind Gradients](https://tailwindcss.com/docs/gradient-color-stops)
- [Lucide Icons](https://lucide.dev/)
- [Next.js Dynamic Routing](https://nextjs.org/docs/routing/dynamic-routes)

## 🎓 Patrones de Diseño

### Configuración Declarativa
Todas las categorías en un array de configuración hace fácil agregar/quitar/modificar.

### Layout Animation
`layoutId="activeCategory"` permite transiciones fluidas entre categorías activas.

### Gesture Animations
`whileHover`, `whileTap` proporcionan feedback inmediato.

### Staggered Animation
Delay incremental (`index * 0.05`) crea efecto de cascada.
