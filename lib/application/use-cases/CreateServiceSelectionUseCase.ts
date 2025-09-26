import { ServiceInfo } from '@/lib/domain/value-objects/ServiceInfo'
import { Price } from '@/lib/domain/value-objects/Price'
import { ServiceType } from '@/lib/domain/entities/ServiceOrder'

export interface ServiceSelectionRequest {
  serviceType: ServiceType
  userId?: string
}

export interface ServiceSelectionResponse {
  serviceInfo: ServiceInfo
  price: Price
  error?: string
}

export class CreateServiceSelectionUseCase {
  async execute(request: ServiceSelectionRequest): Promise<ServiceSelectionResponse> {
    try {
      const serviceInfo = this.getServiceInfo(request.serviceType)
      const price = this.getServicePrice(request.serviceType)

      return {
        serviceInfo,
        price
      }
    } catch (error) {
      return {
        serviceInfo: null as any,
        price: null as any,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private getServiceInfo(serviceType: ServiceType): ServiceInfo {
    switch (serviceType) {
      case ServiceType.PHOTOGRAPHY:
        return ServiceInfo.createPhotographyService()
      case ServiceType.LEGAL:
        return ServiceInfo.createLegalService()
      case ServiceType.VIRTUAL_TOUR:
        return ServiceInfo.createVirtualTourService()
      case ServiceType.HOME_STAGING:
        return new ServiceInfo(
          'Home Staging',
          'Decoración y ambientación profesional para maximizar el atractivo de tu propiedad',
          'home',
          [
            { id: '1', description: 'Consultoría de decoración', included: true },
            { id: '2', description: 'Mobiliario temporal premium', included: true },
            { id: '3', description: 'Accesorios y decoración', included: true },
            { id: '4', description: 'Montaje profesional', included: true }
          ],
          '5-7 días',
          '120-168'
        )
      case ServiceType.MARKET_ANALYSIS:
        return new ServiceInfo(
          'Análisis de Mercado',
          'Estudio completo del mercado inmobiliario para tu zona',
          'trending-up',
          [
            { id: '1', description: 'Análisis comparativo de precios', included: true },
            { id: '2', description: 'Tendencias del mercado local', included: true },
            { id: '3', description: 'Proyecciones de valor', included: true },
            { id: '4', description: 'Reporte detallado', included: true }
          ],
          '24-48 horas',
          '24-48'
        )
      case ServiceType.DOCUMENTATION:
        return new ServiceInfo(
          'Documentación Legal',
          'Preparación y revisión completa de documentación inmobiliaria',
          'file-text',
          [
            { id: '1', description: 'Preparación de contratos', included: true },
            { id: '2', description: 'Revisión de títulos', included: true },
            { id: '3', description: 'Gestión de permisos', included: true },
            { id: '4', description: 'Asesoría notarial', included: true }
          ],
          '3-5 días',
          '72-120'
        )
      default:
        throw new Error(`Unsupported service type: ${serviceType}`)
    }
  }

  private getServicePrice(serviceType: ServiceType): Price {
    switch (serviceType) {
      case ServiceType.PHOTOGRAPHY:
        return new Price(2499, 'MXN')
      case ServiceType.LEGAL:
        return new Price(1999, 'MXN')
      case ServiceType.VIRTUAL_TOUR:
        return new Price(3499, 'MXN')
      case ServiceType.HOME_STAGING:
        return new Price(4999, 'MXN')
      case ServiceType.MARKET_ANALYSIS:
        return new Price(999, 'MXN')
      case ServiceType.DOCUMENTATION:
        return new Price(1499, 'MXN')
      default:
        throw new Error(`Unsupported service type: ${serviceType}`)
    }
  }

  getAllServices(): { serviceType: ServiceType; serviceInfo: ServiceInfo; price: Price }[] {
    const services = [
      ServiceType.PHOTOGRAPHY,
      ServiceType.LEGAL,
      ServiceType.VIRTUAL_TOUR,
      ServiceType.HOME_STAGING,
      ServiceType.MARKET_ANALYSIS,
      ServiceType.DOCUMENTATION
    ]

    return services.map(serviceType => ({
      serviceType,
      serviceInfo: this.getServiceInfo(serviceType),
      price: this.getServicePrice(serviceType)
    }))
  }
}