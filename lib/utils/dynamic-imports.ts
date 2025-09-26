import dynamic from 'next/dynamic'
import React from 'react'

// Heavy components dynamic loading  
export const PhotoGallery = dynamic(() => import('@/components/PhotoGallery'), {
  ssr: true,
  loading: () => React.createElement('div', { className: 'w-full h-64 bg-gray-100 animate-pulse rounded-lg' })
})

export const ServiceModal = dynamic(() => import('@/components/ServiceModal'), {
  ssr: false,
  loading: () => null
})

// Heavy libraries lazy loading - removed dynamic imports due to type conflicts

// Utility for conditional loading
export const loadHeavyLibs = async () => {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ])
  return { html2canvas, jsPDF }
}

// Debounce utility
export const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// GSAP removed - using Framer Motion instead