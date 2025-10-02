# Vista de Mapa Estilo Zillow

## 📍 Descripción

Implementación de la vista de propiedades estilo Zillow con mapa interactivo a la izquierda y grid de propiedades a la derecha. Las propiedades mostradas se filtran dinámicamente según el área visible del mapa.

## 🎨 Layout

```
┌─────────────────────────────────────────────────────┐
│            FILTERS (PropertyFilters)                 │
└─────────────────────────────────────────────────────┘
┌───────────────────┬─────────────────────────────────┐
│                   │                                  │
│                   │   Property Card                  │
│                   │  ┌──────────────────────────┐   │
│                   │  │ Image                    │   │
│   GOOGLE MAPS     │  │ Title                    │   │
│   (Sticky/Fixed)  │  │ Price                    │   │
│                   │  └──────────────────────────┘   │
│   • Marcadores    │                                  │
│   • InfoWindow    │   Property Card                  │
│   • Auto-zoom     │  ┌──────────────────────────┐   │
│                   │  │ Image                    │   │
│   40% width       │  │ Title                    │   │
│                   │  │ Price                    │   │
│                   │  └──────────────────────────┘   │
│                   │                                  │
│                   │   (Scrollable)                   │
│                   │   60% width                      │
└───────────────────┴─────────────────────────────────┘
```

## 🏗️ Arquitectura

### Componentes Creados

1. **PropertiesMapView** (`components/properties/properties-map-view.tsx`)
   - Componente cliente principal
   - Coordina el mapa y el grid
   - Filtra propiedades por bounds del mapa
   - Estado local de propiedades visibles

2. **PropertyMap (actualizado)** (`components/properties/property-map.tsx`)
   - Agregado callback `onBoundsChanged`
   - Props `className` y `height` dinámicos
   - Evento `bounds_changed` del mapa
   - Filtra al cargar y al mover/zoom

### Flujo de Datos

```
┌─────────────────────────────────────────────┐
│  Server: PropertiesPage                     │
│  - Obtiene todas las propiedades (limit: 1000) │
│  - Pasa a PropertiesMapView                 │
└─────────────────┬───────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────┐
│  Client: PropertiesMapView                  │
│  - Estado: visibleProperties                │
│  - Callback: handleBoundsChanged           │
└─────────────────┬───────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────┐
│  PropertyMap                                │
│  - onLoad: Agrega listener bounds_changed   │
│  - onBoundsChanged: Notifica cambios        │
└─────────────────┬───────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────┐
│  PropertiesMapView.handleBoundsChanged      │
│  - Filtra por bounds.contains(position)     │
│  - Actualiza visibleProperties              │
└─────────────────────────────────────────────┘
```

## 🔧 Implementación

### PropertiesMapView

**Estado**:
```typescript
const [visibleProperties, setVisibleProperties] = useState<Property[]>(initialProperties);
```

**Filtrado por Bounds**:
```typescript
const handleBoundsChanged = useCallback((bounds: google.maps.LatLngBounds) => {
  const filtered = initialProperties.filter((property) => {
    if (!property.coordinates?.lat || !property.coordinates?.lng) {
      return false;
    }

    const position = new google.maps.LatLng(
      property.coordinates.lat,
      property.coordinates.lng
    );

    return bounds.contains(position);
  });

  setVisibleProperties(filtered);
}, [initialProperties]);
```

**Layout**:
```tsx
<div className="flex h-[calc(100vh-200px)] gap-4">
  {/* Mapa - Izquierda (Sticky) */}
  <div className="w-2/5 sticky top-4 h-full">
    <PropertyMap
      properties={initialProperties}
      onBoundsChanged={handleBoundsChanged}
      className="h-full rounded-lg overflow-hidden shadow-lg"
    />
  </div>

  {/* Grid - Derecha (Scrollable) */}
  <div className="w-3/5 overflow-y-auto">
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {visibleProperties.map(property => (
        <PropertyCard {...property} />
      ))}
    </div>
  </div>
</div>
```

### PropertyMap Updates

**Nuevas Props**:
```typescript
interface PropertyMapProps {
  properties: Property[];
  onBoundsChanged?: (bounds: google.maps.LatLngBounds) => void;
  className?: string;
  height?: string;
}
```

**Evento bounds_changed**:
```typescript
const onLoad = useCallback((map: google.maps.Map) => {
  setMap(map);

  // Listener para cuando cambian los bounds
  if (onBoundsChanged) {
    map.addListener('bounds_changed', () => {
      const newBounds = map.getBounds();
      if (newBounds) {
        onBoundsChanged(newBounds);
      }
    });

    // Llamar inicialmente
    const initialBounds = map.getBounds();
    if (initialBounds) {
      onBoundsChanged(initialBounds);
    }
  }
}, [onBoundsChanged]);
```

## 🎯 Características

### Mapa Interactivo

- ✅ **Sticky/Fixed**: Permanece visible al hacer scroll
- ✅ **Marcadores**: Rojo = venta, Azul = renta
- ✅ **InfoWindow**: Click en marcador muestra preview
- ✅ **Auto-zoom**: Ajusta para mostrar todas las propiedades
- ✅ **Filtrado dinámico**: Actualiza grid al mover/zoom

### Grid de Propiedades

- ✅ **Scrollable**: Independiente del mapa
- ✅ **Responsive**: 2 columnas en XL, 1 en móvil
- ✅ **Contador**: Muestra "X de Y propiedades"
- ✅ **Alert vacío**: Cuando no hay propiedades en el área

### Dimensiones

| Elemento | Desktop | Tablet | Móvil |
|----------|---------|--------|-------|
| Mapa | 40% width | 100% | 100% |
| Grid | 60% width | 100% | 100% |
| Altura | calc(100vh-200px) | auto | auto |
| Columnas Grid | 2 (XL) | 1 | 1 |

## 📊 Rendimiento

### Optimizaciones

1. **Paginación del servidor**: Carga máximo 1000 propiedades
2. **Filtrado en cliente**: Rápido con `bounds.contains()`
3. **useMemo**: Calcula center una sola vez
4. **useCallback**: Evita re-renders innecesarios
5. **Sticky position**: CSS nativo (no JavaScript)

### Carga Inicial

```typescript
// Server-side (PropertiesPage)
const { properties, total } = await listProperties({
  status: 'active',
  limit: 1000, // Máximo
  // ... filtros
});
```

## 🔍 Filtrado por Bounds

### ¿Cómo Funciona?

1. Usuario carga la página → Muestra todas las propiedades
2. Mapa carga → Calcula bounds iniciales
3. `onBoundsChanged` se dispara → Filtra propiedades
4. Grid se actualiza → Muestra solo las visibles
5. Usuario mueve/zoom mapa → Repite 3-4

### Ejemplo de Bounds

```typescript
// Bounds del mapa
const bounds = map.getBounds();
// LatLngBounds {
//   sw: { lat: 19.3, lng: -99.2 },
//   ne: { lat: 19.5, lng: -99.0 }
// }

// Propiedad
const position = new google.maps.LatLng(19.4326, -99.1332);

// Verificar si está dentro
bounds.contains(position); // true
```

## 🎨 Estilos CSS

### Sticky Map

```css
.sticky {
  position: sticky;
  top: 1rem; /* 16px */
}
```

### Flex Layout

```css
.flex {
  display: flex;
  gap: 1rem; /* 16px */
}

.w-2/5 {
  width: 40%; /* Mapa */
}

.w-3/5 {
  width: 60%; /* Grid */
}
```

### Altura Dinámica

```css
.h-\[calc\(100vh-200px\)\] {
  height: calc(100vh - 200px);
}
```

## 🚀 Uso

### En la Página de Propiedades

```tsx
import { PropertiesMapView } from '@/components/properties/properties-map-view';

export default async function PropertiesPage({ searchParams }) {
  const { properties, total } = await listProperties({
    status: 'active',
    limit: 1000,
  });

  return (
    <div>
      <PropertyFilters {...} />
      <PropertiesMapView
        initialProperties={properties}
        total={total}
      />
    </div>
  );
}
```

### Standalone (opcional)

```tsx
<PropertiesMapView
  initialProperties={properties}
  total={total}
/>
```

## 📱 Responsive Behavior

### Desktop (> 1280px)

- Mapa 40% izquierda
- Grid 2 columnas derecha
- Ambos visibles

### Tablet (768px - 1280px)

- Mapa 40% izquierda
- Grid 1 columna derecha
- Ambos visibles

### Móvil (< 768px)

- Stack vertical
- Mapa arriba (altura fija)
- Grid abajo (scrollable)

## 🐛 Debugging

### Ver bounds del mapa

```javascript
// En DevTools Console
window.google.maps.event.addListener(map, 'bounds_changed', () => {
  const bounds = map.getBounds();
  console.log('Bounds:', {
    sw: bounds.getSouthWest().toJSON(),
    ne: bounds.getNorthEast().toJSON(),
  });
});
```

### Ver propiedades filtradas

```javascript
// En PropertiesMapView
console.log('Visible properties:', visibleProperties.length);
console.log('Total properties:', initialProperties.length);
```

## ✅ Checklist de Implementación

- [x] Crear PropertiesMapView component
- [x] Actualizar PropertyMap con callbacks
- [x] Agregar onBoundsChanged prop
- [x] Agregar className y height props
- [x] Implementar filtrado por bounds
- [x] Layout sticky + scrollable
- [x] Responsive grid (2 cols → 1 col)
- [x] Alert cuando no hay propiedades
- [x] Contador de propiedades visibles
- [x] Actualizar página de propiedades
- [x] Remover tabs (Grid/Mapa)
- [x] Testing en diferentes tamaños

## 🎯 Próximas Mejoras

- [ ] Debounce en bounds_changed (evitar updates muy frecuentes)
- [ ] Clustering de marcadores cuando hay muchos
- [ ] Hover en card → Highlight marcador
- [ ] Click en marcador → Scroll a card
- [ ] Guardar bounds en URL (compartir vista)
- [ ] Loading state al filtrar
- [ ] Animaciones al agregar/quitar cards
- [ ] Lazy load de imágenes en grid
- [ ] Virtual scrolling para muchas propiedades

## 📝 Notas Importantes

1. **Clean Code**: Cada componente tiene una responsabilidad única
2. **SOLID**: Open/Closed (extensible mediante props)
3. **Performance**: Filtrado eficiente con bounds.contains()
4. **UX**: Smooth, sin recargas de página
5. **Responsive**: Funciona en todos los dispositivos

## 🔗 Archivos Relacionados

- `app/(public)/propiedades/page.tsx` - Página principal
- `components/properties/properties-map-view.tsx` - Vista principal
- `components/properties/property-map.tsx` - Mapa actualizado
- `components/properties/property-card.tsx` - Card de propiedad
- `components/properties/property-filters.tsx` - Filtros de búsqueda
