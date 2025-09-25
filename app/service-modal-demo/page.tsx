'use client'

import { useState } from 'react'
import ServiceModal from '@/components/ServiceModal'
import { ServiceType } from '@/lib/domain/entities/ServiceOrder'
import { CreateServiceSelectionUseCase } from '@/lib/application/use-cases/CreateServiceSelectionUseCase'

export default function ServiceModalDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>(ServiceType.PHOTOGRAPHY)
  
  const serviceSelectionUseCase = new CreateServiceSelectionUseCase()
  const allServices = serviceSelectionUseCase.getAllServices()

  const handleContinuePayment = (serviceType: ServiceType) => {
    console.log('Continuing with payment for service:', serviceType)
    setIsModalOpen(false)
    // Aquí integrarías con tu sistema de pagos
  }

  const openModalWithService = (serviceType: ServiceType) => {
    setSelectedServiceType(serviceType)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demo del Modal de Servicios
          </h1>
          <p className="text-xl text-gray-600">
            Selecciona un servicio para ver el modal en acción
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {allServices.map(({ serviceType, serviceInfo, price }) => (
            <div
              key={serviceType}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100"
              onClick={() => openModalWithService(serviceType)}
            >
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {serviceInfo.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {serviceInfo.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {price.getCurrencySymbol()}{price.getFormattedAmount()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {serviceInfo.deliveryTime}
                  </span>
                </div>
              </div>
              <ul className="space-y-1">
                {serviceInfo.getIncludedFeatures().slice(0, 3).map((feature) => (
                  <li key={feature.id} className="text-xs text-gray-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {feature.description}
                  </li>
                ))}
                {serviceInfo.getIncludedFeatures().length > 3 && (
                  <li className="text-xs text-gray-400">
                    +{serviceInfo.getIncludedFeatures().length - 3} más...
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => openModalWithService(ServiceType.PHOTOGRAPHY)}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Abrir Modal de Fotografía (Ejemplo Principal)
          </button>
        </div>

        <ServiceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onContinuePayment={handleContinuePayment}
          serviceType={selectedServiceType}
        />
      </div>
    </div>
  )
}