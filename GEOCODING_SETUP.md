# Sistema de Geocodificación de Propiedades

## 📍 Descripción

El sistema convierte automáticamente las direcciones de las propiedades en coordenadas geográficas (latitud/longitud) usando Google Maps Geocoding API. Esto permite mostrar las propiedades en el mapa de manera precisa.

## 🔧 Configuración

### 1. API Key

La API key de Google Maps ya está configurada en `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCTnXVhGc9Vyq7N6HI2HNwPgq0AgNPHT-c
```

### 2. Habilitar Geocoding API

Asegúrate de que la **Geocoding API** esté habilitada en tu proyecto de Google Cloud:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Library**
4. Busca "Geocoding API"
5. Haz clic en **Enable**

## 🚀 Cómo Funciona

### Flujo Automático

Cuando un usuario publica una propiedad:

1. **Usuario completa el formulario** con:
   - Dirección (ej: "Av. Reforma 123")
   - Ciudad (ej: "Ciudad de México")
   - Estado (ej: "CDMX")
   - País (ej: "México")

2. **API recibe la petición** en `POST /api/properties`

3. **Geocodificación automática**:
   ```typescript
   // Si no se proporcionaron coordenadas manualmente
   const geocodeResult = await GeocodingService.geocodeAddress(
     address,
     city,
     state,
     country
   );

   // Resultado: { lat: 19.4326, lng: -99.1332 }
   ```

4. **Propiedad guardada con coordenadas**:
   ```json
   {
     "title": "Departamento en Reforma",
     "address": "Av. Reforma 123",
     "city": "Ciudad de México",
     "state": "CDMX",
     "coordinates": {
       "lat": 19.4326,
       "lng": -99.1332
     }
   }
   ```

5. **Aparece en el mapa** automáticamente en `/propiedades` (vista mapa)

## 📚 Servicio de Geocodificación

### Archivo: `lib/services/geocoding.service.ts`

#### Métodos Disponibles

1. **`geocodeAddress()`** - Geocodifica una dirección completa
   ```typescript
   const result = await GeocodingService.geocodeAddress(
     "Av. Reforma 123",
     "Ciudad de México",
     "CDMX",
     "México"
   );
   // Retorna: { lat: 19.4326, lng: -99.1332, formattedAddress: "..." }
   ```

2. **`geocodeComponents()`** - Geocodifica usando componentes separados (más preciso)
   ```typescript
   const result = await GeocodingService.geocodeComponents({
     route: "Av. Reforma",
     street_number: "123",
     locality: "Ciudad de México",
     administrative_area_level_1: "CDMX",
     country: "México",
     postal_code: "06600"
   });
   ```

3. **`isValidCoordinates()`** - Valida coordenadas
   ```typescript
   const isValid = GeocodingService.isValidCoordinates(19.4326, -99.1332);
   // Retorna: true
   ```

## 🔄 Integración en la API

### `app/api/properties/route.ts` - Método POST

```typescript
// 1. Validar autenticación y datos
if (!userId || !user) {
  return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
}

// 2. Geocodificar dirección automáticamente
let finalCoordinates = coordinates;

if (!coordinates || !GeocodingService.isValidCoordinates(coordinates?.lat, coordinates?.lng)) {
  const geocodeResult = await GeocodingService.geocodeAddress(
    address,
    city,
    state,
    country || 'México'
  );

  if (geocodeResult) {
    finalCoordinates = {
      lat: geocodeResult.lat,
      lng: geocodeResult.lng,
    };
  }
}

// 3. Crear propiedad con coordenadas
const propertyData = {
  // ... otros campos
  coordinates: finalCoordinates || undefined,
};

const newProperty = await createProperty(propertyData);
```

## 🗺️ Visualización en el Mapa

### Componente: `components/properties/property-map.tsx`

- Filtra propiedades que tienen coordenadas
- Muestra marcadores en el mapa
- InfoWindow con preview de la propiedad al hacer clic

```typescript
const propertiesWithCoordinates = properties.filter(
  (property) => property.coordinates?.lat && property.coordinates?.lng
);

{propertiesWithCoordinates.map((property) => (
  <Marker
    position={{
      lat: property.coordinates!.lat,
      lng: property.coordinates!.lng,
    }}
  />
))}
```

## ⚠️ Manejo de Errores

### Casos que maneja el sistema:

1. **API Key no configurada**: Log de error, propiedad sin coordenadas
2. **Geocoding falla** (dirección no válida): Log de warning, propiedad sin coordenadas
3. **Sin resultados**: Log de warning, propiedad sin coordenadas
4. **Coordenadas inválidas**: Intenta geocodificar, fallback sin coordenadas

### Logs en consola:

```
✅ Address geocoded successfully: { lat: 19.4326, lng: -99.1332 }
⚠️ Could not geocode address, property will be created without coordinates
```

## 🎯 Mejores Prácticas

1. **Direcciones completas**: Mientras más detallada sea la dirección, más precisa la geocodificación
2. **Formato consistente**: Usar siempre el mismo formato (calle, número, ciudad, estado, país)
3. **Validación**: El sistema valida automáticamente las coordenadas antes de guardar
4. **Fallback graceful**: Si la geocodificación falla, la propiedad se crea sin coordenadas (no bloquea)

## 📊 Estados de Propiedades

| Estado | Coordenadas | En Mapa | En Grid |
|--------|-------------|---------|---------|
| ✅ Con coordenadas válidas | Sí | ✅ Sí | ✅ Sí |
| ⚠️ Sin coordenadas | No | ❌ No | ✅ Sí |
| ❌ Coordenadas inválidas | No | ❌ No | ✅ Sí |

## 🔍 Debugging

### Ver logs de geocodificación:

```bash
# En la consola del servidor (terminal)
Geocoding address: Av. Reforma 123, Ciudad de México, CDMX, México
Geocoding response status: OK
✅ Address geocoded successfully: { lat: 19.4326, lng: -99.1332 }
Creating property with coordinates: { lat: 19.4326, lng: -99.1332 }
✅ Property created: 507f1f77bcf86cd799439011
```

### Verificar coordenadas en MongoDB:

```javascript
db.properties.findOne({ _id: ObjectId("...") })

// Resultado:
{
  _id: ObjectId("..."),
  title: "Departamento en Reforma",
  coordinates: {
    lat: 19.4326,
    lng: -99.1332
  }
}
```

## 🌐 Endpoints de Google Maps

### Geocoding API
```
GET https://maps.googleapis.com/maps/api/geocode/json
  ?address=Av.+Reforma+123,+Ciudad+de+México,+CDMX,+México
  &key=YOUR_API_KEY
```

### Respuesta
```json
{
  "results": [{
    "geometry": {
      "location": {
        "lat": 19.4326,
        "lng": -99.1332
      }
    },
    "formatted_address": "Av. Paseo de la Reforma 123, ..."
  }],
  "status": "OK"
}
```

## 💡 Notas Importantes

1. **Clean Code**: El servicio sigue el principio de Responsabilidad Única (SRP)
2. **No bloquea**: Si la geocodificación falla, la propiedad se crea igual
3. **Automático**: El usuario no necesita hacer nada, todo es automático
4. **Reutilizable**: El servicio puede usarse en otros lugares del código

## 📝 TODO Futuro

- [ ] Agregar caché de geocodificación para direcciones repetidas
- [ ] Implementar reverse geocoding (coordenadas → dirección)
- [ ] Validar dirección antes de geocodificar (Google Places Autocomplete)
- [ ] Rate limiting para evitar exceder cuota de API
- [ ] Batch geocoding para múltiples propiedades
