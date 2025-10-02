// ============================================
// LIVINNING - Middleware with Clerk
// ============================================

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define protected routes - all dashboard routes require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
])

// Define public routes that don't require authentication check
const isPublicRoute = createRouteMatcher([
  '/',
  '/propiedades(.*)',
  '/suspended',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Protect dashboard routes
  if (isProtectedRoute(req)) {
    await auth.protect()
  }

  // Check if user is suspended (only for authenticated users not on suspended page)
  if (userId && !req.nextUrl.pathname.startsWith('/suspended')) {
    try {
      const { sessionClaims } = await auth()
      const publicMetadata = sessionClaims?.public_metadata as any
      const isSuspended = publicMetadata?.isSuspended as boolean

      // If user is suspended, redirect to suspended page
      if (isSuspended) {
        const suspendedUrl = new URL('/suspended', req.url)
        return NextResponse.redirect(suspendedUrl)
      }
    } catch (error) {
      console.error('Error checking suspension status:', error)
    }
  }

  // If user is on suspended page but not suspended, redirect to dashboard
  if (userId && req.nextUrl.pathname === '/suspended') {
    try {
      const { sessionClaims } = await auth()
      const publicMetadata = sessionClaims?.public_metadata as any
      const isSuspended = publicMetadata?.isSuspended as boolean

      if (!isSuspended) {
        const role = (publicMetadata?.role as string)?.toLowerCase() || 'user'
        const dashboardUrl = new URL(`/dashboard/${role}`, req.url)
        return NextResponse.redirect(dashboardUrl)
      }
    } catch (error) {
      console.error('Error checking suspension status:', error)
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
