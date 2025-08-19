'use client'

import { useEffect, useRef } from 'react'
import logger from '@/lib/utils/logger'

interface UseLoggerOptions {
  component: string
  logMount?: boolean
  logUnmount?: boolean
  logRenders?: boolean
  logProps?: boolean
}

export function useLogger(options: UseLoggerOptions) {
  const {
    component,
    logMount = true,
    logUnmount = true,
    logRenders = false,
    logProps = false
  } = options

  const renderCount = useRef(0)
  const mountTime = useRef<number>(0)

  // Log component mount
  useEffect(() => {
    if (logMount) {
      mountTime.current = performance.now()
      logger.debug(component, 'Component mounted')
    }

    // Log component unmount
    return () => {
      if (logUnmount) {
        const mountDuration = mountTime.current 
          ? performance.now() - mountTime.current 
          : 0
        logger.debug(component, 'Component unmounted', {
          mountDuration: `${mountDuration.toFixed(2)}ms`,
          renderCount: renderCount.current
        })
      }
    }
  }, [component, logMount, logUnmount])

  // Log renders
  useEffect(() => {
    if (logRenders) {
      renderCount.current++
      logger.debug(component, `Component rendered (count: ${renderCount.current})`)
    }
  })

  return {
    logUserAction: (action: string, data?: any) => {
      logger.user(component, action, data)
    },
    logError: (message: string, error?: any) => {
      logger.error(component, message, error)
    },
    logInfo: (message: string, data?: any) => {
      logger.info(component, message, data)
    },
    logPerformance: (operation: string, data?: any) => {
      logger.performance(component, operation, data)
    },
    startTimer: (label: string) => logger.startTimer(`${component}-${label}`)
  }
}

// Hook for logging user interactions
export function useUserInteractionLogger(component: string) {
  const logClick = (elementType: string, elementId?: string, additionalData?: any) => {
    logger.user(component, `Click: ${elementType}`, {
      elementId,
      timestamp: new Date().toISOString(),
      ...additionalData
    })
  }

  const logFormSubmit = (formType: string, formData?: any) => {
    logger.user(component, `Form Submit: ${formType}`, {
      formData: formData ? Object.keys(formData) : undefined,
      timestamp: new Date().toISOString()
    })
  }

  const logFormChange = (fieldName: string, value?: any) => {
    logger.debug(component, `Form Change: ${fieldName}`, {
      hasValue: value !== undefined && value !== '',
      valueType: typeof value
    })
  }

  const logNavigation = (destination: string, method?: string) => {
    logger.navigation(component, `Navigate to ${destination}`, {
      method: method || 'unknown',
      timestamp: new Date().toISOString()
    })
  }

  return {
    logClick,
    logFormSubmit,
    logFormChange,
    logNavigation
  }
}

// Hook for API call logging
export function useApiLogger(component: string) {
  const logApiCall = async <T>(
    method: string,
    url: string,
    data?: any,
    apiCall?: () => Promise<T>
  ): Promise<T | undefined> => {
    const timer = logger.startTimer(`API-${method}-${url}`)
    logger.api(component, method, url, data ? { hasData: true, dataKeys: Object.keys(data) } : undefined)

    if (!apiCall) {
      timer()
      return undefined
    }

    try {
      const result = await apiCall()
      timer()
      logger.api(component, method, url, { 
        status: 'Success',
        responseType: typeof result,
        hasData: !!result
      })
      return result
    } catch (error) {
      timer()
      logger.error(component, `API call failed: ${method} ${url}`, error)
      throw error
    }
  }

  return { logApiCall }
}

export default useLogger;