import dynamic from 'next/dynamic'

// Lazy load heavy dependencies
export const Html2CanvasLazy = dynamic(() => import('html2canvas'), {
  ssr: false,
  loading: () => null
})

export const JsPdfLazy = dynamic(() => import('jspdf'), {
  ssr: false,
  loading: () => null
})

// Lazy load motion components for mobile optimization
export const MotionDiv = dynamic(
  () => import('framer-motion').then((mod) => ({ default: mod.motion.div })),
  { 
    ssr: false,
    loading: () => <div />
  }
)

export const MotionSection = dynamic(
  () => import('framer-motion').then((mod) => ({ default: mod.motion.section })),
  {
    ssr: false, 
    loading: () => <section />
  }
)

// Utility for conditional loading
export const loadHeavyLibs = async () => {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf')
  ])
  
  return { html2canvas, jsPDF }
}