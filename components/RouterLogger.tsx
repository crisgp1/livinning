'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import logger from '@/lib/utils/logger'

export default function RouterLogger() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    
    logger.navigation('Router', 'Route change', {
      pathname,
      search: searchParams.toString(),
      fullUrl: url,
      timestamp: new Date().toISOString()
    })

    // Log performance metrics for route changes (only on initial page load)
    if (typeof window !== 'undefined' && window.performance) {
      setTimeout(() => {
        const navigationEntries = performance.getEntriesByType('navigation')
        if (navigationEntries.length > 0) {
          const navigation = navigationEntries[0] as PerformanceNavigationTiming
          if (navigation.loadEventEnd > 0) { // Only log if page has finished loading
            logger.performance('Router', 'Page load performance', {
              loadTime: `${(navigation.loadEventEnd - navigation.loadEventStart).toFixed(2)}ms`,
              domContentLoaded: `${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms`,
              type: navigation.type
            })
          }
        }
      }, 100)
    }

  }, [pathname, searchParams])

  return null
}