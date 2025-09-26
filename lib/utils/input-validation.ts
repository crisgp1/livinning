import { z } from 'zod'

/**
 * Sanitizes input to prevent NoSQL injection attacks
 * Removes potentially dangerous operators and values
 */
export function sanitizeMongoInput(input: any): any {
  if (typeof input === 'string') {
    // Remove MongoDB operators and dangerous characters
    return input.replace(/[\$\{\}]/g, '')
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeMongoInput)
  }

  if (input !== null && typeof input === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      // Skip MongoDB operators
      if (key.startsWith('$')) {
        continue
      }
      // Sanitize key and value
      const cleanKey = key.replace(/[\$\{\}\.]/g, '')
      sanitized[cleanKey] = sanitizeMongoInput(value)
    }
    return sanitized
  }

  return input
}

/**
 * Validates and sanitizes query parameters
 */
export function validateQueryParams(searchParams: URLSearchParams, schema: z.ZodSchema) {
  const params: Record<string, any> = {}

  for (const [key, value] of searchParams.entries()) {
    params[key] = sanitizeMongoInput(value)
  }

  try {
    return schema.parse(params)
  } catch (error) {
    throw new Error(`Invalid query parameters: ${error}`)
  }
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  pagination: z.object({
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    offset: z.string().optional().transform(val => val ? parseInt(val, 10) : 0),
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  }),

  sorting: z.object({
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),

  filters: z.object({
    status: z.string().optional(),
    category: z.string().optional(),
    userId: z.string().optional(),
  }),

  mongoId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid MongoDB ID'),
}

/**
 * Validates MongoDB ObjectId format
 */
export function isValidMongoId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id)
}

/**
 * Validates request body against schema and sanitizes input
 */
export function validateAndSanitizeBody<T>(body: any, schema: z.ZodSchema<T>): T {
  const sanitizedBody = sanitizeMongoInput(body)
  return schema.parse(sanitizedBody)
}

/**
 * Creates a safe MongoDB query object
 */
export function createSafeQuery(baseQuery: Record<string, any>, additionalFilters?: Record<string, any>): Record<string, any> {
  const query = { ...sanitizeMongoInput(baseQuery) }

  if (additionalFilters) {
    Object.assign(query, sanitizeMongoInput(additionalFilters))
  }

  // Remove any remaining MongoDB operators that might have slipped through
  const cleanQuery: Record<string, any> = {}
  for (const [key, value] of Object.entries(query)) {
    if (!key.startsWith('$') && value !== undefined && value !== null) {
      cleanQuery[key] = value
    }
  }

  return cleanQuery
}

/**
 * Error handler for validation errors
 */
export function handleValidationError(error: any) {
  if (error instanceof z.ZodError) {
    return {
      error: 'Validation failed',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      }))
    }
  }

  return {
    error: 'Invalid input',
    message: error.message || 'Please check your input and try again'
  }
}