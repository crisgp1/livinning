# Sistema de Geolocalización

## 📍 Descripción

Sistema de geolocalización que permite a los usuarios obtener su ubicación actual y centrar el mapa en ella. Implementado siguiendo principios **SOLID** y **Clean Code**.

## 🏗️ Arquitectura

### Principios SOLID Aplicados

1. **Single Responsibility Principle (SRP)**:
   - `GeolocationService` - Solo maneja obtención de ubicación del navegador
   - `PropertyMap` - Solo maneja visualización del mapa
   - Separación clara de responsabilidades

2. **Open/Closed Principle (OCP)**:
   - Servicio extensible para agregar más funcionalidades (watchPosition)
   - Componente extensible mediante props

3. **Dependency Inversion Principle (DIP)**:
   - PropertyMap depende de la abstracción (GeolocationService)
   - No depende de implementación específica del navegador

## 📁 Estructura de Archivos

```
lib/
└── services/
    └── geolocation.service.ts    # ✅ Servicio de geolocalización

components/
└── properties/
    └── property-map.tsx          # ✅ Mapa con geolocalización
```

## 🔧 Servicio de Geolocalización

### GeolocationService

**Ubicación**: `lib/services/geolocation.service.ts`

#### Métodos

##### 1. `isSupported()`
Verifica si el navegador soporta geolocalización.

```typescript
const supported = GeolocationService.isSupported();
// true o false
```

##### 2. `getCurrentPosition()`
Obtiene la ubicación actual del usuario (una sola vez).

```typescript
try {
  const location = await GeolocationService.getCurrentPosition();
  // { lat: 19.4326, lng: -99.1332 }
} catch (error) {
  // Manejo de error
}
```

**Opciones configuradas**:
- `enableHighAccuracy: true` - Usar GPS si está disponible
- `timeout: 10000` - Timeout de 10 segundos
- `maximumAge: 0` - No usar caché

##### 3. `watchPosition()`
Observa cambios en la ubicación (para seguimiento en tiempo real).

```typescript
const watchId = GeolocationService.watchPosition(
  (location) => {
    console.log('Nueva ubicación:', location);
  },
  (error) => {
    console.error('Error:', error);
  }
);

// Detener seguimiento
GeolocationService.clearWatch(watchId);
```

##### 4. `clearWatch()`
Detiene el seguimiento de ubicación.

```typescript
GeolocationService.clearWatch(watchId);
```

### Tipos

```typescript
interface UserLocation {
  lat: number;
  lng: number;
}

interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
  message: string;
}
```

## 🎯 Integración en PropertyMap

### Estado del Componente

```typescript
const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
const [isLoadingLocation, setIsLoadingLocation] = useState(false);
```

### Función handleGetUserLocation

```typescript
const handleGetUserLocation = useCallback(async () => {
  if (!map) {
    toast.error('El mapa aún no está cargado');
    return;
  }

  setIsLoadingLocation(true);

  try {
    // 1. Obtener ubicación del usuario
    const location = await GeolocationService.getCurrentPosition();

    // 2. Guardar en estado
    setUserLocation(location);

    // 3. Centrar mapa
    map.setCenter(location);
    map.setZoom(13); // Zoom cercano

    toast.success('Ubicación obtenida exitosamente');
  } catch (error: any) {
    toast.error(error.message || 'No se pudo obtener tu ubicación');
  } finally {
    setIsLoadingLocation(false);
  }
}, [map]);
```

### Marcador de Usuario

```typescript
{userLocation && (
  <Marker
    position={userLocation}
    icon={{
      url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
    }}
    title="Tu ubicación"
  />
)}
```

### Botón Flotante

```typescript
<div className="absolute bottom-6 right-6">
  <Button
    onClick={handleGetUserLocation}
    disabled={isLoadingLocation || !map}
    className="shadow-lg bg-white hover:bg-neutral-50 text-neutral-700 border"
    size="icon"
    title="Obtener mi ubicación"
  >
    {isLoadingLocation ? (
      <Loader2 className="h-5 w-5 animate-spin" />
    ) : (
      <Crosshair className="h-5 w-5" />
    )}
  </Button>
</div>
```

## 🔒 Seguridad y Privacidad

### Requisitos del Navegador

1. **HTTPS**: Solo funciona en sitios seguros (HTTPS)
2. **Permisos**: El usuario debe otorgar permiso
3. **Soporte**: Navegadores modernos (Chrome, Firefox, Safari, Edge)

### Prompt de Permisos

Al hacer clic en el botón, el navegador muestra:

```
[sitio.com] quiere conocer tu ubicación
[ Bloquear ] [ Permitir ]
```

## ⚠️ Manejo de Errores

### Códigos de Error

| Código | Descripción | Mensaje al Usuario |
|--------|-------------|-------------------|
| `PERMISSION_DENIED` | Usuario rechazó permiso | "Permiso de ubicación denegado. Permite el acceso en la configuración del navegador." |
| `POSITION_UNAVAILABLE` | No se pudo determinar | "No se pudo determinar tu ubicación. Verifica que los servicios de ubicación estén activados." |
| `TIMEOUT` | Tiempo agotado | "Tiempo de espera agotado al obtener tu ubicación. Intenta de nuevo." |
| `NOT_SUPPORTED` | Navegador no soporta | "Tu navegador no soporta geolocalización" |

### Flujo de Error

```typescript
try {
  const location = await GeolocationService.getCurrentPosition();
  // Éxito
} catch (error: GeolocationError) {
  switch (error.code) {
    case 'PERMISSION_DENIED':
      // Mostrar instrucciones para habilitar
      break;
    case 'POSITION_UNAVAILABLE':
      // Verificar GPS/WiFi
      break;
    case 'TIMEOUT':
      // Reintentar
      break;
    case 'NOT_SUPPORTED':
      // Navegador no compatible
      break;
  }
}
```

## 🎨 UI/UX

### Botón Flotante

**Posición**: Esquina inferior derecha del mapa
**Estilo**:
- Fondo blanco
- Borde gris claro
- Sombra grande
- Icono de cruz (Crosshair)

**Estados**:
1. **Normal**: Icono de cruz estático
2. **Loading**: Spinner animado
3. **Deshabilitado**: Cuando el mapa no está cargado

### Iconos del Mapa

| Elemento | Color | Descripción |
|----------|-------|-------------|
| Propiedades en venta | 🔴 Rojo | Marcador estándar de Google |
| Propiedades en renta | 🔵 Azul | Marcador estándar de Google |
| **Tu ubicación** | 🟢 **Verde** | **Marcador de usuario** |

## 📊 Flujo de Usuario

### Flujo Completo

```
1. Usuario abre /propiedades
   ↓
2. Ve el mapa con propiedades
   ↓
3. Hace clic en botón de ubicación (Crosshair)
   ↓
4. Navegador pide permiso
   ↓
5a. Usuario PERMITE:
    → Obtiene ubicación
    → Muestra marcador verde
    → Centra mapa (zoom 13)
    → Toast: "Ubicación obtenida exitosamente"

5b. Usuario BLOQUEA:
    → Toast: "Permiso de ubicación denegado..."
```

## 🚀 Uso

### En Componente

```tsx
<PropertyMap
  properties={properties}
  onBoundsChanged={handleBoundsChanged}
  className="h-full"
/>
```

El botón de geolocalización está **integrado automáticamente**.

### Obtener Ubicación Programáticamente

```typescript
import { GeolocationService } from '@/lib/services/geolocation.service';

const getLocation = async () => {
  try {
    const location = await GeolocationService.getCurrentPosition();
    console.log('Ubicación:', location);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🐛 Debugging

### Logs en Consola

```javascript
// Al solicitar ubicación
Requesting user location...

// Éxito
✅ User location obtained: { lat: 19.4326, lng: -99.1332 }

// Error
❌ Geolocation error: { code: 1, message: "User denied..." }
```

### Verificar Permisos

Chrome DevTools:
1. F12 → Console
2. Escribir: `navigator.permissions.query({ name: 'geolocation' })`
3. Ver estado: `granted`, `denied`, o `prompt`

### Simular Ubicación (Testing)

Chrome DevTools:
1. F12 → Console (⋮) → Sensors
2. Location → Custom location
3. Ingresar lat/lng
4. Recargar página

## ⚙️ Configuración

### Ajustar Precisión

```typescript
// En geolocation.service.ts
const options: PositionOptions = {
  enableHighAccuracy: true,  // false = más rápido, menos preciso
  timeout: 10000,            // Ajustar timeout
  maximumAge: 0,             // Usar caché (ms)
};
```

### Ajustar Zoom

```typescript
// En property-map.tsx
map.setZoom(13); // 1 = mundo, 20 = calle
```

## 📱 Compatibilidad

| Navegador | Soporte |
|-----------|---------|
| Chrome | ✅ |
| Firefox | ✅ |
| Safari | ✅ |
| Edge | ✅ |
| IE 11 | ❌ |
| Opera | ✅ |

## 🔐 Mejores Prácticas

1. ✅ **Siempre usar HTTPS** (geolocalización no funciona en HTTP)
2. ✅ **Pedir permiso en contexto** (no al cargar la página)
3. ✅ **Mostrar feedback** (loading, éxito, error)
4. ✅ **Manejar todos los errores** (con mensajes claros)
5. ✅ **Respetar privacidad** (no guardar sin consentimiento)
6. ✅ **Timeout razonable** (10 segundos)
7. ✅ **Fallback** (usar ubicación por defecto si falla)

## 🎯 Próximas Mejoras

- [ ] Guardar última ubicación en localStorage
- [ ] Botón para volver a ubicación guardada
- [ ] Seguimiento en tiempo real (watchPosition)
- [ ] Mostrar precisión de la ubicación
- [ ] Círculo de precisión en el mapa
- [ ] Autocomplete de direcciones cerca de la ubicación
- [ ] Notificar cuando hay propiedades cerca

## 📝 Ejemplo Completo

```typescript
// 1. Importar servicio
import { GeolocationService } from '@/lib/services/geolocation.service';

// 2. Verificar soporte
if (!GeolocationService.isSupported()) {
  console.error('Geolocalización no soportada');
  return;
}

// 3. Obtener ubicación
try {
  const location = await GeolocationService.getCurrentPosition();

  // 4. Usar ubicación
  map.setCenter(location);
  map.setZoom(13);

  // 5. Agregar marcador
  new google.maps.Marker({
    position: location,
    map: map,
    title: 'Tu ubicación',
  });

} catch (error) {
  // 6. Manejar error
  toast.error(error.message);
}
```

## 💡 Clean Code Aplicado

1. **Nombres descriptivos**: `getCurrentPosition()`, `handleGetUserLocation()`
2. **Funciones pequeñas**: Cada función hace una cosa
3. **DRY**: Servicio reutilizable
4. **Manejo de errores**: Try/catch con mensajes claros
5. **Comentarios**: Solo cuando agregan valor
6. **Tipado fuerte**: TypeScript con interfaces

## 🔗 Referencias

- [HTML5 Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Google Maps Geolocation](https://developers.google.com/maps/documentation/javascript/geolocation)
- [Best Practices](https://developers.google.com/web/fundamentals/native-hardware/user-location)
