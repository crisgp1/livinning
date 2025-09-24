import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: any
}

export class ApiError extends Error {
  public statusCode: number
  public details?: any

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }
}

/**
 * Standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message })
  }

  return NextResponse.json(response, { status })
}

/**
 * Standardized error response
 */
export function createErrorResponse(
  error: string | Error | ApiError,
  status: number = 500,
  details?: any
): NextResponse {
  let errorMessage: string
  let errorDetails: any = details

  if (error instanceof ApiError) {
    errorMessage = error.message
    status = error.statusCode
    errorDetails = error.details || details
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else {
    errorMessage = error
  }

  const response: ApiResponse = {
    success: false,
    error: errorMessage,
    ...(errorDetails && { details: errorDetails })
  }

  return NextResponse.json(response, { status })
}

/**
 * Handle authentication errors consistently
 */
export function createUnauthorizedResponse(message: string = 'Authentication required'): NextResponse {
  return createErrorResponse(message, 401)
}

/**
 * Handle validation errors consistently
 */
export function createValidationErrorResponse(message: string, details?: any): NextResponse {
  return createErrorResponse(message, 400, details)
}

/**
 * Handle not found errors consistently
 */
export function createNotFoundResponse(message: string = 'Resource not found'): NextResponse {
  return createErrorResponse(message, 404)
}

/**
 * Handle server errors consistently
 */
export function createServerErrorResponse(message: string = 'Internal server error', details?: any): NextResponse {
  return createErrorResponse(message, 500, details)
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandling(
  handler: (request: Request, params?: any) => Promise<NextResponse>
) {
  return async (request: Request, params?: any): Promise<NextResponse> => {
    try {
      return await handler(request, params)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof ApiError) {
        return createErrorResponse(error)
      }

      if (error instanceof Error) {
        return createServerErrorResponse(error.message)
      }

      return createServerErrorResponse('An unexpected error occurred')
    }
  }
}