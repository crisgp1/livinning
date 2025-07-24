'use client'

import { useState } from 'react'
import { X, Camera, Scale, Video, Check } from 'lucide-react'
import { ServiceInfo } from '@/lib/domain/value-objects/ServiceInfo'
import { Price } from '@/lib/domain/value-objects/Price'
import { ServiceType } from '@/lib/domain/entities/ServiceOrder'

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onContinuePayment: (serviceType: ServiceType) => void
  serviceType?: ServiceType
}

const getServiceIcon = (iconName: string) => {
  switch (iconName) {
    case 'camera':
      return <Camera className="w-6 h-6" />
    case 'scale':
      return <Scale className="w-6 h-6" />
    case 'video':
      return <Video className="w-6 h-6" />
    default:
      return <Camera className="w-6 h-6" />
  }
}

const getServicePrice = (serviceType: ServiceType): Price => {
  switch (serviceType) {
    case ServiceType.PHOTOGRAPHY:
      return new Price(2499, 'MXN')
    case ServiceType.LEGAL:
      return new Price(1999, 'MXN')
    case ServiceType.VIRTUAL_TOUR:
      return new Price(3499, 'MXN')
    default:
      return new Price(2499, 'MXN')
  }
}

const getServiceInfo = (serviceType: ServiceType): ServiceInfo => {
  switch (serviceType) {
    case ServiceType.PHOTOGRAPHY:
      return ServiceInfo.createPhotographyService()
    case ServiceType.LEGAL:
      return ServiceInfo.createLegalService()
    case ServiceType.VIRTUAL_TOUR:
      return ServiceInfo.createVirtualTourService()
    default:
      return ServiceInfo.createPhotographyService()
  }
}

export default function ServiceModal({ 
  isOpen, 
  onClose, 
  onContinuePayment,
  serviceType = ServiceType.PHOTOGRAPHY 
}: ServiceModalProps) {
  if (!isOpen) return null

  const serviceInfo = getServiceInfo(serviceType)
  const price = getServicePrice(serviceType)
  const { amount, symbol } = price.getDisplayPrice()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-5 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full relative shadow-xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-lg border-none flex items-center justify-center cursor-pointer text-slate-600 hover:bg-slate-200 transition-all z-10"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <div className="text-blue-600">
              {getServiceIcon(serviceInfo.icon)}
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              {serviceInfo.title}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {serviceInfo.description}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Características incluidas:
          </h3>
          <ul className="space-y-2">
            {serviceInfo.getIncludedFeatures().map((feature) => (
              <li key={feature.id} className="flex items-center text-sm text-gray-600">
                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Check size={10} className="text-white font-bold" />
                </div>
                {feature.description}
              </li>
            ))}
          </ul>
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-200 mx-6 mb-4"></div>

        {/* Pricing */}
        <div className="px-6 pb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm text-gray-600 mb-1">Precio del servicio</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-900">
                  {symbol}{amount}
                </span>
                <span className="text-sm text-gray-600">
                  {price.currency} por sesión
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-gray-600 leading-tight">
              Tiempo de entrega<br />
              <strong>{serviceInfo.deliveryTime}</strong>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-medium cursor-pointer border border-gray-200 bg-slate-50 text-gray-700 hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => onContinuePayment(serviceType)}
              className="flex-1 py-3 px-4 rounded-xl text-sm font-medium cursor-pointer border-none bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-px transition-all flex items-center justify-center gap-2"
            >
              Continuar con el Pago →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}