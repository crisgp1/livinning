export interface ServiceFeature {
  id: string;
  description: string;
  included: boolean;
}

export class ServiceInfo {
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly icon: string,
    public readonly features: ServiceFeature[],
    public readonly deliveryTime: string,
    public readonly deliveryTimeHours: string
  ) {
    if (!title.trim()) throw new Error('Service title is required');
    if (!description.trim()) throw new Error('Service description is required');
    if (!icon.trim()) throw new Error('Service icon is required');
    if (features.length === 0) throw new Error('At least one feature is required');
    if (!deliveryTime.trim()) throw new Error('Delivery time is required');
  }

  static createPhotographyService(): ServiceInfo {
    return new ServiceInfo(
      'Fotografía Profesional',
      'Sesión fotográfica profesional para tu propiedad con equipo de alta calidad',
      'camera',
      [
        { id: '1', description: '20-30 fotos profesionales editadas', included: true },
        { id: '2', description: 'Fotografía con dron incluida', included: true },
        { id: '3', description: 'Edición profesional HDR', included: true },
        { id: '4', description: 'Entrega en 48 horas', included: true },
        { id: '5', description: 'Licencia comercial completa', included: true }
      ],
      '48-72 horas',
      '48-72'
    );
  }

  static createLegalService(): ServiceInfo {
    return new ServiceInfo(
      'Servicios Legales',
      'Asesoría legal especializada en transacciones inmobiliarias',
      'scale',
      [
        { id: '1', description: 'Revisión de contratos', included: true },
        { id: '2', description: 'Verificación de documentos', included: true },
        { id: '3', description: 'Asesoría jurídica completa', included: true },
        { id: '4', description: 'Gestión de trámites', included: true }
      ],
      '24-48 horas',
      '24-48'
    );
  }

  static createVirtualTourService(): ServiceInfo {
    return new ServiceInfo(
      'Tour Virtual 360°',
      'Recorrido virtual inmersivo de alta calidad para tu propiedad',
      'video',
      [
        { id: '1', description: 'Tour virtual 360° interactivo', included: true },
        { id: '2', description: 'Tecnología de última generación', included: true },
        { id: '3', description: 'Integración web completa', included: true },
        { id: '4', description: 'Compatibilidad VR', included: true }
      ],
      '72-96 horas',
      '72-96'
    );
  }

  getIncludedFeatures(): ServiceFeature[] {
    return this.features.filter(feature => feature.included);
  }

  getFeatureCount(): number {
    return this.getIncludedFeatures().length;
  }
}