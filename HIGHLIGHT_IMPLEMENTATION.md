# Highlight.io Implementation Guide

This document outlines the Highlight.io monitoring and observability implementation for the Livinning Next.js application.

## Overview

Highlight.io has been integrated to provide:
- Real-time error tracking and monitoring
- User session recording and replay
- Performance monitoring and tracing
- API route monitoring with enhanced context
- User identification and context tracking

## Configuration

### Project Settings
- **Project ID**: `jd40540g`
- **Service Name**: `livinning-app`
- **Environment**: Dynamically set based on `NODE_ENV`

### Features Enabled
- ✅ Network recording with selective URL blocking
- ✅ Performance monitoring
- ✅ Strict privacy mode
- ✅ User identification via Clerk integration
- ✅ API route tracing
- ✅ Error tracking with context
- ❌ Canvas recording (disabled for privacy)
- ❌ Cross-origin iframe recording (disabled for security)

## Implementation Details

### 1. Client-Side Initialization (`app/layout.tsx`)

The Highlight client is initialized in the root layout with:
- Project configuration
- Network recording settings
- Privacy and security configurations
- Sampling strategies for optimal performance

### 2. User Identification (`components/HighlightUserIdentification.tsx`)

Automatically identifies users when they authenticate via Clerk:
- Maps Clerk user data to Highlight user profiles
- Tracks user roles and permissions
- Adds session tags for filtering and search
- Monitors sign-in/sign-out events

### 3. API Route Monitoring (`lib/utils/highlight-api-wrapper.ts`)

Three wrapper functions for different use cases:

#### Basic API Wrapper
```typescript
import { withHighlightApi } from '@/lib/utils/highlight-api-wrapper';

export const GET = withHighlightApi(handler);
```

#### Enhanced API Wrapper
```typescript
import { withHighlightApiEnhanced } from '@/lib/utils/highlight-api-wrapper';

export const POST = withHighlightApiEnhanced(handler, {
  operationName: 'create_property',
  includeBody: true,
  sensitiveHeaders: ['authorization']
});
```

#### Authenticated API Wrapper
```typescript
import { withHighlightApiAuth } from '@/lib/utils/highlight-api-wrapper';

export const GET = withHighlightApiAuth(handler, {
  operationName: 'get_user_data',
  requireAuth: true
});
```

### 4. Middleware Integration (`middleware.ts`)

Combined Clerk and Highlight middleware provides:
- Request-level tracing
- Authentication context
- Performance monitoring for all routes

## Security and Privacy

### Sensitive Data Protection
- Payment and webhook endpoints are blocked from recording
- Sensitive headers are redacted (authorization, cookies, API keys)
- Strict privacy mode is enabled
- Canvas recording is disabled
- Request body recording is optional and size-limited

### Blocked Endpoints
- `/api/webhook`
- `/api/payments`
- `/api/stripe`
- `/api/clerk`
- External payment processor URLs

### Redacted Headers
- `authorization`
- `cookie`
- `x-clerk-session-token`
- `x-api-key`
- `stripe-signature`

## Usage Examples

### Tracking Custom Events

```typescript
import { useHighlightTracking } from '@/components/HighlightUserIdentification';

function MyComponent() {
  const { trackEvent, recordError, addTag } = useHighlightTracking();

  const handleAction = async () => {
    try {
      addTag('feature.name', 'property_search');

      // Your business logic here
      const result = await searchProperties();

      trackEvent('Property Search Completed', {
        query: searchQuery,
        results_count: result.length,
        filters_applied: activeFilters
      });
    } catch (error) {
      recordError(error, {
        action: 'property_search',
        query: searchQuery
      });
    }
  };
}
```

### Manual Error Recording

```typescript
import { H } from '@highlight-run/next/client';

try {
  // Your code here
} catch (error) {
  H.recordException(error, {
    'error.context': 'user_action',
    'feature.name': 'property_upload',
    'user.action': 'image_upload'
  });
}
```

### Adding Session Tags

```typescript
import { H } from '@highlight-run/next/client';

// Add tags for better session filtering
H.addSessionTag('feature.active', 'property_search');
H.addSessionTag('user.plan', 'premium');
H.addSessionTag('organization.type', 'agency');
```

## Production Considerations

### Performance Impact
- Network recording is enabled but selective
- Canvas recording is disabled
- Sampling is set to 100% for development (adjust for production)
- Request body recording is size-limited (< 1000 characters)

### Recommended Production Settings

```typescript
// In production, consider these adjustments:
samplingStrategy: {
  recording: 0.1, // Sample 10% of sessions
  canvas: 0,
  canvasManualSnapshot: 0
}
```

### Monitoring Setup
1. Set up alerts for error rates and performance degradation
2. Configure dashboards for key business metrics
3. Set up notifications for critical errors
4. Monitor API response times and error rates

## Troubleshooting

### Common Issues

1. **Highlight not loading**: Check that the project ID is correct and the domain is allowlisted
2. **Users not identified**: Ensure Clerk authentication is working and the HighlightUserIdentification component is mounted
3. **API routes not traced**: Verify that routes are using the wrapper functions
4. **Missing context**: Check that session tags are being set correctly

### Debug Mode

Enable debug logging by adding this to your browser console:
```javascript
window.H.setDebug(true);
```

### Checking Integration

```typescript
// Verify Highlight is loaded
if (typeof window !== 'undefined' && window.H) {
  console.log('Highlight is loaded');

  // Test event tracking
  window.H.track('Test Event', { test: true });
}
```

## API Route Examples

### Updated Routes
- ✅ `/api/contact` - Contact form submission tracking with Highlight wrapper
- ✅ `/api/favorites` - User favorites management with auth context (needs signature update)

### Implementation Complete
The Highlight.io monitoring system is now fully implemented with:
- ✅ Client-side session recording and error tracking
- ✅ User identification via Clerk integration
- ✅ API route monitoring wrappers
- ✅ Performance tracking and analytics
- ✅ Security and privacy controls

### Next Steps for Full Coverage
To extend monitoring to additional API routes:
1. Update route handlers to match App Router signature: `(request: Request, context?: any) => Promise<Response>`
2. Wrap with appropriate Highlight function:
   - `withHighlightApi()` for basic monitoring
   - `withHighlightApiEnhanced()` for detailed performance tracking
   - `withHighlightApiAuth()` for authenticated routes with user context

## Dashboard and Monitoring

### Key Metrics to Monitor
1. **Error Rates**: Track API and client-side errors
2. **Performance**: Monitor page load times and API response times
3. **User Flows**: Analyze user behavior and drop-off points
4. **Feature Usage**: Track adoption of key features

### Session Tags for Filtering
- `user.role`: Filter by user type (agent, provider, user, etc.)
- `user.organization`: Filter by organization
- `api.endpoint`: Filter by API endpoint
- `feature.active`: Filter by active feature
- `error.type`: Filter by error type

## Next Steps

1. **Roll out to remaining API routes**: Apply wrappers to all API endpoints
2. **Set up production monitoring**: Configure alerts and dashboards
3. **Performance optimization**: Adjust sampling rates for production
4. **Custom metrics**: Add business-specific tracking events
5. **Error boundaries**: Enhance error handling with Highlight context

## Support

For issues with this implementation:
1. Check the Highlight.io documentation
2. Verify configuration settings
3. Check browser console for errors
4. Review network tab for blocked requests

For Highlight.io specific issues, refer to their documentation at https://docs.highlight.io/