import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { isSuperAdmin } from '../utils/superadmin'

export interface AuthenticatedRequest extends NextRequest {
  userId: string
  user: any
}

/**
 * Enhanced authentication middleware with additional security checks
 */
export async function withAuth<T extends any[]>(
  handler: (req: AuthenticatedRequest, ...args: T) => Promise<NextResponse>,
  options: {
    requiredRole?: string | string[]
    requiresOrganization?: boolean
    rateLimitKey?: string
  } = {}
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      // Get authentication info
      const { userId, sessionClaims } = await auth()

      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required', code: 'UNAUTHORIZED' },
          { status: 401 }
        )
      }

      // Check if session is valid and not expired
      if (sessionClaims?.exp && sessionClaims.exp * 1000 < Date.now()) {
        return NextResponse.json(
          { error: 'Session expired', code: 'SESSION_EXPIRED' },
          { status: 401 }
        )
      }

      // Check role requirements
      if (options.requiredRole) {
        const userRole = sessionClaims?.publicMetadata?.role as string
        const roles = Array.isArray(options.requiredRole)
          ? options.requiredRole
          : [options.requiredRole]

        // Get full user object for proper superadmin check
        let isSuperAdminUser = false
        try {
          const client = await clerkClient()
          const user = await client.users.getUser(userId)
          isSuperAdminUser = isSuperAdmin(user)
        } catch (error) {
          console.error('Error checking superadmin status:', error)
        }

        if (!isSuperAdminUser && !roles.includes(userRole)) {
          return NextResponse.json(
            {
              error: 'Insufficient permissions',
              code: 'FORBIDDEN',
              required: roles,
              current: userRole
            },
            { status: 403 }
          )
        }
      }

      // Check organization requirements
      if (options.requiresOrganization) {
        const orgId = sessionClaims?.org_id
        if (!orgId) {
          return NextResponse.json(
            { error: 'Organization membership required', code: 'NO_ORGANIZATION' },
            { status: 403 }
          )
        }
      }

      // Add rate limiting check here if needed
      if (options.rateLimitKey) {
        const rateLimitResult = await checkRateLimit(userId, options.rateLimitKey)
        if (rateLimitResult.exceeded) {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              code: 'RATE_LIMITED',
              retryAfter: rateLimitResult.retryAfter
            },
            { status: 429 }
          )
        }
      }

      // Create authenticated request object
      const authenticatedReq = Object.assign(req, {
        userId,
        user: sessionClaims
      }) as AuthenticatedRequest

      return await handler(authenticatedReq, ...args)

    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication failed', code: 'AUTH_ERROR' },
        { status: 500 }
      )
    }
  }
}

/**
 * Simple in-memory rate limiting (replace with Redis in production)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

async function checkRateLimit(userId: string, key: string): Promise<{ exceeded: boolean; retryAfter?: number }> {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 100 // 100 requests per minute

  const rateLimitKey = `${userId}:${key}`
  const current = rateLimitStore.get(rateLimitKey)

  if (!current || current.resetTime < now) {
    rateLimitStore.set(rateLimitKey, {
      count: 1,
      resetTime: now + windowMs
    })
    return { exceeded: false }
  }

  if (current.count >= maxRequests) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000)
    return { exceeded: true, retryAfter }
  }

  current.count++
  return { exceeded: false }
}

/**
 * Role-based access control helper
 */
export async function hasRole(userId: string, requiredRole: string | string[]): Promise<boolean> {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

  // Get full user object for proper superadmin and role check
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const isSuperAdminUser = isSuperAdmin(user)
    const userRole = user.publicMetadata?.role as string

    return isSuperAdminUser || roles.includes(userRole)
  } catch (error) {
    console.error('Error checking role:', error)
    return false
  }
}

/**
 * Department access helper
 */
export async function hasDepartmentAccess(userId: string, department: string): Promise<boolean> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const userRole = user.publicMetadata?.role as string
    const userDepartments = user.publicMetadata?.departments as string[]
    const isSuperAdminUser = isSuperAdmin(user)

    // SuperAdmins and helpdesk have access to all departments
    if (isSuperAdminUser || userRole === 'helpdesk') {
      return true
    }

    // Check specific department access
    return userDepartments?.includes(department) || userRole === department
  } catch (error) {
    console.error('Error checking department access:', error)
    return false
  }
}

/**
 * Enhanced error responses with proper logging
 */
export function createSecureErrorResponse(error: any, userId?: string) {
  // Log security-related errors
  if (userId) {
    console.warn(`Security warning for user ${userId}:`, error)
  }

  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production'

  return NextResponse.json(
    {
      error: isProduction ? 'Access denied' : error.message,
      code: 'SECURITY_ERROR',
      timestamp: new Date().toISOString()
    },
    { status: 403 }
  )
}