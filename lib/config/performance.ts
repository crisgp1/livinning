// Mobile-first performance configuration
export const PERFORMANCE_CONFIG = {
  // Critical performance thresholds
  CORE_WEB_VITALS: {
    LCP_THRESHOLD: 2500, // ms
    FID_THRESHOLD: 100,  // ms  
    CLS_THRESHOLD: 0.1,  // unitless
    TTI_THRESHOLD: 3800  // ms
  },

  // Image optimization settings
  IMAGES: {
    DEFAULT_QUALITY: 85,
    PRIORITY_QUALITY: 95,
    MOBILE_QUALITY: 75,
    BLUR_DATA_URL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bvKixzacqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJc=",
    RESPONSIVE_SIZES: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  },

  // Glassmorphism mobile optimization 
  GLASS: {
    MOBILE_BLUR: 0,      // No blur on mobile
    DESKTOP_BLUR: 8,     // Light blur on desktop
    MOBILE_OPACITY: 0.9, // Higher opacity for mobile
    DESKTOP_OPACITY: 0.7
  },

  // Animation settings
  ANIMATIONS: {
    REDUCE_ON_MOBILE: true,
    USE_CSS_INSTEAD_OF_JS: true,
    INTERSECTION_THRESHOLD: 0.1
  },

  // Lazy loading thresholds
  LAZY_LOADING: {
    ROOT_MARGIN: '50px',
    IMAGE_THRESHOLD: 0.1,
    COMPONENT_THRESHOLD: 0.1
  }
}

// Device detection utilities
export const isMobile = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

export const isLowEndDevice = () => {
  if (typeof navigator === 'undefined') return false
  return (navigator as any).hardwareConcurrency < 4
}