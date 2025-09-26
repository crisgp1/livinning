import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { highlightMiddleware } from "@highlight-run/next/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/admin(.*)',
  '/helpdesk(.*)',
  '/api/helpdesk(.*)',
  '/provider-dashboard(.*)',
  '/superadmin(.*)',
  '/api/superadmin(.*)',
]);

const isServerAction = (req: NextRequest) => {
  return (
    req.method === 'POST' &&
    (req.headers.get('content-type')?.includes('text/plain') ||
     req.headers.get('next-action') !== null)
  );
};

// Combined middleware for authentication and monitoring
export default clerkMiddleware(async (auth, req) => {
  // Initialize Highlight middleware for session tracking
  await highlightMiddleware(req);

  // Don't intercept server actions - let them handle auth internally
  if (isServerAction(req)) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes but exclude server actions
    "/(api|trpc)(.*)",
    // Protected dashboard routes
    "/dashboard/(.*)",
    // Protected helpdesk routes
    "/helpdesk/(.*)",
    // Protected provider dashboard routes
    "/provider-dashboard/(.*)",
    // Protected superadmin routes
    "/superadmin/(.*)",
  ],
};