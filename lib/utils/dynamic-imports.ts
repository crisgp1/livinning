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

// Heavy libraries lazy loading
export const Html2CanvasLazy = dynamic(() => import('html2canvas'), {
  ssr: false,
  loading: () => null
})

export const JsPdfLazy = dynamic(() => import('jspdf'), {
  ssr: false,
  loading: () => null
})

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

// GSAP lazy loading utility
export const loadGSAP = async () => {
  if (typeof window !== 'undefined') {
    const [gsap, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger')
    ])
    gsap.default.registerPlugin(ScrollTrigger)
    return { gsap: gsap.default, ScrollTrigger }
  }
  return null
}