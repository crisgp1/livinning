'use client'

/**
 * Client-side error handler for Server Actions
 * This helps catch and handle fetchServerAction errors gracefully
 */

export interface ServerActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  redirectUrl?: string
}

export async function handleServerAction<T>(
  actionFn: () => Promise<T>,
  errorMessage?: string
): Promise<ServerActionResult<T>> {
  try {
    const result = await actionFn()

    // Handle server actions that return result objects
    if (typeof result === 'object' && result !== null && 'success' in result) {
      return result as ServerActionResult<T>
    }

    // Handle server actions that return data directly
    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('Server Action Error:', error)

    let errorMsg = errorMessage || 'An unexpected error occurred'

    if (error instanceof Error) {
      // Handle specific fetchServerAction errors
      if (error.message.includes('fetchServerAction') ||
          error.message.includes('unexpected response')) {
        errorMsg = 'There was a problem connecting to the server. Please try again.'
      } else {
        errorMsg = error.message
      }
    }

    return {
      success: false,
      error: errorMsg
    }
  }
}

/**
 * Hook for handling server actions in components
 */
export function useServerAction() {
  const executeAction = async <T>(
    actionFn: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: string) => void
  ): Promise<ServerActionResult<T>> => {
    const result = await handleServerAction(actionFn)

    if (result.success && result.data && onSuccess) {
      onSuccess(result.data)
    }

    if (!result.success && result.error && onError) {
      onError(result.error)
    }

    // Handle redirects
    if (result.success && result.redirectUrl) {
      window.location.href = result.redirectUrl
    }

    return result
  }

  return { executeAction }
}