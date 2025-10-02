// ============================================
// LIVINNING - Servicio de Geocodificación
// ============================================

/**
 * Servicio para geocodificar direcciones usando Google Maps Geocoding API
 * Principio de Responsabilidad Única: Solo maneja geocodificación
 */

interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress?: string;
}

interface GoogleGeocodeResponse {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    formatted_address: string;
  }>;
  status: string;
  error_message?: string;
}

export class GeocodingService {
  private static readonly API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  private static readonly GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

  /**
   * Geocodifica una dirección completa
   */
  static async geocodeAddress(
    address: string,
    city: string,
    state: string,
    country: string = 'México'
  ): Promise<GeocodeResult | null> {
    try {
      if (!this.API_KEY) {
        console.error('Google Maps API key no configurada');
        return null;
      }

      // Construir dirección completa
      const fullAddress = `${address}, ${city}, ${state}, ${country}`;

      console.log('Geocoding address:', fullAddress);

      // Hacer request a Google Geocoding API
      const url = new URL(this.GEOCODE_URL);
      url.searchParams.append('address', fullAddress);
      url.searchParams.append('key', this.API_KEY);

      const response = await fetch(url.toString());
      const data: GoogleGeocodeResponse = await response.json();

      console.log('Geocoding response status:', data.status);

      // Verificar si fue exitoso
      if (data.status !== 'OK') {
        console.warn('Geocoding failed:', data.status, data.error_message);
        return null;
      }

      // Verificar si hay resultados
      if (!data.results || data.results.length === 0) {
        console.warn('No geocoding results found');
        return null;
      }

      // Obtener el primer resultado (más relevante)
      const result = data.results[0];
      const { lat, lng } = result.geometry.location;

      console.log('✅ Geocoding successful:', { lat, lng });

      return {
        lat,
        lng,
        formattedAddress: result.formatted_address,
      };
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Geocodifica usando componentes separados (más preciso)
   */
  static async geocodeComponents(components: {
    route?: string; // Calle
    street_number?: string; // Número
    locality: string; // Ciudad
    administrative_area_level_1: string; // Estado
    country: string; // País
    postal_code?: string; // Código postal
  }): Promise<GeocodeResult | null> {
    try {
      if (!this.API_KEY) {
        console.error('Google Maps API key no configurada');
        return null;
      }

      // Construir componentes
      const componentParts: string[] = [];

      if (components.route) {
        componentParts.push(`route:${components.route}`);
      }
      if (components.street_number) {
        componentParts.push(`street_number:${components.street_number}`);
      }
      componentParts.push(`locality:${components.locality}`);
      componentParts.push(`administrative_area:${components.administrative_area_level_1}`);
      componentParts.push(`country:${components.country}`);
      if (components.postal_code) {
        componentParts.push(`postal_code:${components.postal_code}`);
      }

      const componentsString = componentParts.join('|');

      console.log('Geocoding components:', componentsString);

      // Hacer request a Google Geocoding API
      const url = new URL(this.GEOCODE_URL);
      url.searchParams.append('components', componentsString);
      url.searchParams.append('key', this.API_KEY);

      const response = await fetch(url.toString());
      const data: GoogleGeocodeResponse = await response.json();

      console.log('Geocoding response status:', data.status);

      // Verificar si fue exitoso
      if (data.status !== 'OK') {
        console.warn('Geocoding failed:', data.status, data.error_message);
        return null;
      }

      // Verificar si hay resultados
      if (!data.results || data.results.length === 0) {
        console.warn('No geocoding results found');
        return null;
      }

      // Obtener el primer resultado
      const result = data.results[0];
      const { lat, lng } = result.geometry.location;

      console.log('✅ Geocoding successful:', { lat, lng });

      return {
        lat,
        lng,
        formattedAddress: result.formatted_address,
      };
    } catch (error) {
      console.error('Error geocoding components:', error);
      return null;
    }
  }

  /**
   * Valida si las coordenadas son válidas
   */
  static isValidCoordinates(lat?: number, lng?: number): boolean {
    if (lat === undefined || lng === undefined) {
      return false;
    }

    // Validar rangos válidos
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}
