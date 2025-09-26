import { AppRouterHighlight } from "@highlight-run/next/server";

// Initialize Highlight for API route wrapping
const withAppRouterHighlight = AppRouterHighlight({
  projectID: 'jd40540g',
});

/**
 * Basic wrapper for API routes that adds Highlight.io monitoring and error tracking
 * Matches App Router expected signature
 */
export function withHighlightApi(
  handler: (request: Request, context?: any) => Promise<Response>
) {
  return withAppRouterHighlight(handler);
}

/**
 * Enhanced wrapper for API routes with additional logging and monitoring
 * Includes request/response timing and custom metrics
 */
export function withHighlightApiEnhanced(
  handler: (request: Request, context?: any) => Promise<Response>,
  options: {
    operationName?: string;
  } = {}
) {
  const { operationName } = options;

  return withAppRouterHighlight(async (request: Request, context?: any) => {
    const startTime = Date.now();

    try {
      // Track API request event
      if (typeof window === 'undefined') {
        try {
          const { H } = await import('@highlight-run/next/client');
          const url = new URL(request.url);

          H.track('API Request Enhanced', {
            endpoint: url.pathname,
            method: request.method,
            operation: operationName || url.pathname,
            service: 'livinning-app',
            startTime: startTime,
            queryParams: url.searchParams.toString() || undefined,
            userAgent: request.headers.get('user-agent') || undefined
          });
        } catch (highlightError) {
          // Ignore highlight errors
        }
      }

      const response = await handler(request, context);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Track response with performance metrics
      if (typeof window === 'undefined') {
        try {
          const { H } = await import('@highlight-run/next/client');

          H.track('API Response Enhanced', {
            endpoint: new URL(request.url).pathname,
            method: request.method,
            operation: operationName || new URL(request.url).pathname,
            status: response.status,
            duration_ms: duration,
            service: 'livinning-app',
            endTime: endTime,
            isSlowRequest: duration > 1000,
            isVerySlowRequest: duration > 5000
          });
        } catch (highlightError) {
          // Ignore highlight errors
        }
      }

      return response;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Record error with enhanced context
      if (typeof window === 'undefined') {
        try {
          const { H } = await import('@highlight-run/next/client');

          H.consumeError(error as Error, 'Enhanced API Error', {
            endpoint: new URL(request.url).pathname,
            method: request.method,
            operation: operationName || new URL(request.url).pathname,
            duration_ms: duration.toString(),
            errorType: 'api_error',
            service: 'livinning-app',
            timestamp: new Date().toISOString()
          });
        } catch (highlightError) {
          console.error('Failed to report error to Highlight:', highlightError);
        }
      }

      throw error;
    }
  });
}

/**
 * Wrapper specifically for Clerk-authenticated API routes
 * Automatically includes user context in monitoring
 */
export function withHighlightApiAuth(
  handler: (request: Request, context?: any) => Promise<Response>,
  options: {
    operationName?: string;
    requireAuth?: boolean;
  } = {}
) {
  const { operationName, requireAuth = false } = options;

  return withAppRouterHighlight(async (request: Request, context?: any) => {
    // Import Clerk server-side
    const { auth } = await import('@clerk/nextjs/server');

    try {
      const { userId, orgId } = await auth();

      // Add authentication context tracking
      if (typeof window === 'undefined') {
        try {
          const { H } = await import('@highlight-run/next/client');

          if (userId) {
            H.identify(userId, {
              user_id: userId,
              organization_id: orgId || undefined,
              service: 'livinning-app'
            });

            H.track('Authenticated API Request', {
              endpoint: new URL(request.url).pathname,
              method: request.method,
              operation: operationName || new URL(request.url).pathname,
              userId: userId,
              organizationId: orgId || undefined,
              authenticated: true,
              service: 'livinning-app'
            });
          } else {
            H.track('Unauthenticated API Request', {
              endpoint: new URL(request.url).pathname,
              method: request.method,
              operation: operationName || new URL(request.url).pathname,
              authenticated: false,
              requireAuth: requireAuth,
              service: 'livinning-app'
            });

            if (requireAuth) {
              H.track('Authentication Required Error', {
                endpoint: new URL(request.url).pathname,
                errorType: 'missing_authentication',
                service: 'livinning-app'
              });
            }
          }
        } catch (highlightError) {
          // Ignore highlight errors
        }
      }

      return await handler(request, context);
    } catch (authError) {
      // Record authentication errors
      if (typeof window === 'undefined') {
        try {
          const { H } = await import('@highlight-run/next/client');
          H.consumeError(authError as Error, 'Authentication Error', {
            errorType: 'authentication_error',
            endpoint: new URL(request.url).pathname,
            service: 'livinning-app'
          });
        } catch (highlightError) {
          console.error('Failed to report auth error to Highlight:', highlightError);
        }
      }
      throw authError;
    }
  });
}