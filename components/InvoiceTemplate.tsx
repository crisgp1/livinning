import React from 'react'

interface InvoiceData {
  invoiceNumber: string
  date: string
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceName: string
  serviceDescription: string
  propertyAddress: string
  amount: number
  currency: string
  paymentMethod: string
  transactionId: string
}

interface InvoiceTemplateProps {
  data: InvoiceData
}

export default function InvoiceTemplate({ data }: InvoiceTemplateProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: data.currency || 'MXN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white" id="invoice-content">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-gray-200">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Livinning</h1>
          <p className="text-sm text-gray-600">Servicios Inmobiliarios Profesionales</p>
          <p className="text-sm text-gray-600">RFC: LIV210415XXX</p>
          <p className="text-sm text-gray-600">Tel: +52 (55) 1234-5678</p>
          <p className="text-sm text-gray-600">Email: facturas@livinning.com</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-semibold mb-2">FACTURA</h2>
          <p className="text-sm text-gray-600">Folio: <span className="font-medium">{data.invoiceNumber}</span></p>
          <p className="text-sm text-gray-600">Fecha: <span className="font-medium">{formatDate(data.date)}</span></p>
        </div>
      </div>

      {/* Client Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Datos del Cliente</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="mb-1"><span className="font-medium">Nombre:</span> {data.customerName}</p>
          <p className="mb-1"><span className="font-medium">Email:</span> {data.customerEmail}</p>
          <p className="mb-1"><span className="font-medium">Teléfono:</span> {data.customerPhone}</p>
          {data.propertyAddress && (
            <p><span className="font-medium">Dirección de la Propiedad:</span> {data.propertyAddress}</p>
          )}
        </div>
      </div>

      {/* Service Details */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Detalle del Servicio</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="text-left p-3 font-medium">Concepto</th>
              <th className="text-right p-3 font-medium">Precio Unitario</th>
              <th className="text-right p-3 font-medium">Cantidad</th>
              <th className="text-right p-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3">
                <p className="font-medium">{data.serviceName}</p>
                <p className="text-sm text-gray-600">{data.serviceDescription}</p>
              </td>
              <td className="text-right p-3">{formatCurrency(data.amount)}</td>
              <td className="text-right p-3">1</td>
              <td className="text-right p-3 font-medium">{formatCurrency(data.amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal:</span>
            <span>{formatCurrency(data.amount / 1.16)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">IVA (16%):</span>
            <span>{formatCurrency(data.amount - (data.amount / 1.16))}</span>
          </div>
          <div className="flex justify-between pt-2 border-t-2 border-gray-300">
            <span className="font-semibold text-lg">Total:</span>
            <span className="font-semibold text-lg">{formatCurrency(data.amount)}</span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-8 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-green-800">Información de Pago</h3>
        <p className="text-sm text-green-700">Estado: <span className="font-medium">PAGADO</span></p>
        <p className="text-sm text-green-700">Método de Pago: <span className="font-medium">{data.paymentMethod}</span></p>
        <p className="text-sm text-green-700">ID de Transacción: <span className="font-medium">{data.transactionId}</span></p>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
        <p className="mb-2">Este documento es una representación impresa de un CFDI</p>
        <p className="mb-2">Livinning S.A. de C.V. - Todos los derechos reservados</p>
        <p>Para cualquier aclaración, contactar a: soporte@livinning.com</p>
      </div>

      {/* QR Code placeholder */}
      <div className="absolute bottom-8 right-8 w-24 h-24 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
        QR Code
      </div>
    </div>
  )
}