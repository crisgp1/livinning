// ============================================
// LIVINNING - Servicio de Geolocalización
// ============================================

/**
 * Servicio para obtener la ubicación del usuario usando HTML5 Geolocation API
 * Principio de Responsabilidad Única: Solo maneja la geolocalización del navegador
 */

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';
  message: string;
}

export class GeolocationService {
  /**
   * Verifica si el navegador soporta geolocalización
   */
  static isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Obtiene la ubicación actual del usuario
   * Requiere permiso del usuario
   */
  static async getCurrentPosition(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      // Verificar soporte
      if (!this.isSupported()) {
        reject({
          code: 'NOT_SUPPORTED',
          message: 'Tu navegador no soporta geolocalización',
        } as GeolocationError);
        return;
      }

      console.log('Requesting user location...');

      // Opciones de geolocalización
      const options: PositionOptions = {
        enableHighAccuracy: true, // Usar GPS si está disponible
        timeout: 10000, // 10 segundos
        maximumAge: 0, // No usar caché
      };

      // Solicitar ubicación
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: UserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          console.log('✅ User location obtained:', userLocation);

          resolve(userLocation);
        },
        (error) => {
          console.error('❌ Geolocation error:', error);

          let geolocationError: GeolocationError;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              geolocationError = {
                code: 'PERMISSION_DENIED',
                message: 'Permiso de ubicación denegado. Permite el acceso a tu ubicación en la configuración del navegador.',
              };
              break;

            case error.POSITION_UNAVAILABLE:
              geolocationError = {
                code: 'POSITION_UNAVAILABLE',
                message: 'No se pudo determinar tu ubicación. Verifica que los servicios de ubicación estén activados.',
              };
              break;

            case error.TIMEOUT:
              geolocationError = {
                code: 'TIMEOUT',
                message: 'Tiempo de espera agotado al obtener tu ubicación. Intenta de nuevo.',
              };
              break;

            default:
              geolocationError = {
                code: 'POSITION_UNAVAILABLE',
                message: 'Error desconocido al obtener tu ubicación.',
              };
          }

          reject(geolocationError);
        },
        options
      );
    });
  }

  /**
   * Observa cambios en la ubicación del usuario (para seguimiento en tiempo real)
   * Retorna un ID para detener el seguimiento
   */
  static watchPosition(
    onSuccess: (location: UserLocation) => void,
    onError: (error: GeolocationError) => void
  ): number | null {
    if (!this.isSupported()) {
      onError({
        code: 'NOT_SUPPORTED',
        message: 'Tu navegador no soporta geolocalización',
      });
      return null;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const userLocation: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onSuccess(userLocation);
      },
      (error) => {
        let geolocationError: GeolocationError;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            geolocationError = {
              code: 'PERMISSION_DENIED',
              message: 'Permiso de ubicación denegado',
            };
            break;

          case error.POSITION_UNAVAILABLE:
            geolocationError = {
              code: 'POSITION_UNAVAILABLE',
              message: 'No se pudo determinar tu ubicación',
            };
            break;

          case error.TIMEOUT:
            geolocationError = {
              code: 'TIMEOUT',
              message: 'Tiempo de espera agotado',
            };
            break;

          default:
            geolocationError = {
              code: 'POSITION_UNAVAILABLE',
              message: 'Error desconocido',
            };
        }

        onError(geolocationError);
      },
      options
    );

    return watchId;
  }

  /**
   * Detiene el seguimiento de la ubicación
   */
  static clearWatch(watchId: number): void {
    if (this.isSupported() && watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      console.log('Geolocation watch cleared');
    }
  }
}
