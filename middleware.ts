import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/admin(.*)',
]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Check for impersonation cookie
  const impersonationCookie = req.cookies.get('impersonation');
  
  if (impersonationCookie) {
    try {
      const impersonationData = JSON.parse(impersonationCookie.value);
      
      // Create response with impersonation headers
      const response = NextResponse.next();
      
      // Add custom headers that can be read by server components
      response.headers.set('x-impersonated-user-id', impersonationData.targetUserId);
      response.headers.set('x-impersonated-user-role', impersonationData.targetUserRole);
      response.headers.set('x-original-user-id', impersonationData.originalUserId);
      
      return response;
    } catch (error) {
      console.error('Error parsing impersonation cookie:', error);
    }
  }

  // Protect routes as needed
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Protected dashboard routes
    "/dashboard/(.*)",
  ],
};