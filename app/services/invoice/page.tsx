'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Download, ArrowLeft, Loader2 } from 'lucide-react'
import Navigation from '@/components/Navigation'
import InvoiceTemplate from '@/components/InvoiceTemplate'
// Import these only if available
let html2canvas: any
let jsPDF: any

if (typeof window !== 'undefined') {
  try {
    html2canvas = require('html2canvas')
    jsPDF = require('jspdf').jsPDF || require('jspdf')
  } catch (e) {
    console.warn('PDF generation libraries not available')
  }
}

function InvoicePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [invoiceData, setInvoiceData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      router.push('/dashboard/services')
      return
    }

    fetchInvoiceData(orderId)
  }, [searchParams, router])

  const fetchInvoiceData = async (orderId: string) => {
    try {
      const response = await fetch(`/api/services/invoice?orderId=${orderId}`)
      
      if (response.ok) {
        const data = await response.json()
        setInvoiceData(data.invoice)
      } else {
        console.error('Error fetching invoice data')
        router.push('/dashboard/services')
      }
    } catch (error) {
      console.error('Error:', error)
      router.push('/dashboard/services')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!invoiceRef.current) return

    // Check if PDF libraries are available
    if (!html2canvas || !jsPDF) {
      // Fallback: print the invoice
      window.print()
      return
    }

    setIsGeneratingPDF(true)
    
    try {
      // Create a temporary container for the invoice
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      tempDiv.style.width = '816px' // A4 width at 96 DPI
      document.body.appendChild(tempDiv)

      // Clone the invoice content
      const clonedInvoice = invoiceRef.current.cloneNode(true) as HTMLElement
      tempDiv.appendChild(clonedInvoice)

      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100))

      // Generate canvas from the cloned element
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      })

      // Remove temporary container
      document.body.removeChild(tempDiv)

      // Generate PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      // Add image to PDF, handling multiple pages if needed
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Download the PDF
      pdf.save(`Factura-${invoiceData.invoiceNumber}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error al generar el PDF. Por favor, intente nuevamente.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!invoiceData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="no-print">
        <Navigation />
      </div>
      
      <main className="pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header Actions */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8 no-print"
          >
            <button
              onClick={() => router.push('/dashboard/services')}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a Servicios
            </button>
            
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="btn-primary inline-flex items-center gap-2"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Descargar Factura
                </>
              )}
            </button>
          </motion.div>

          {/* Invoice Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div ref={invoiceRef}>
              <InvoiceTemplate data={invoiceData} />
            </div>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center text-sm text-gray-600"
          >
            <p>Esta factura es un comprobante de pago válido.</p>
            <p>Para cualquier aclaración, contacte a soporte@livinning.com</p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0.5in;
          }
        }
      `}</style>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }>
        <InvoicePageContent />
      </Suspense>
    </>
  )
}