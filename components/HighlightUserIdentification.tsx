'use client';

import { useUser } from '@clerk/nextjs';
import { H } from '@highlight-run/next/client';
import { useEffect, useRef } from 'react';

/**
 * Component that automatically identifies users to Highlight.io when they authenticate
 * Integrates with Clerk authentication system
 */
export function HighlightUserIdentification() {
  const { user, isLoaded } = useUser();
  const lastIdentifiedUser = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (user && user.id !== lastIdentifiedUser.current) {
      // User is authenticated - identify them to Highlight
      try {
        const metadata = user.publicMetadata as any;
        const privateMetadata = (user as any).privateMetadata as any;

        // Determine user role
        const userRole = metadata?.role || privateMetadata?.role || 'user';

        // Basic user identification using correct API
        H.identify(user.id, {
          // Core user data
          highlightDisplayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses?.[0]?.emailAddress || 'Unknown User',
          email: user.emailAddresses?.[0]?.emailAddress,
          first_name: user.firstName,
          last_name: user.lastName,

          // Authentication data
          created_at: user.createdAt?.toISOString(),
          last_sign_in: user.lastSignInAt?.toISOString(),

          // Role and permissions
          role: userRole,
          is_super_admin: metadata?.isSuperAdmin === true || userRole === 'superadmin',
          is_agent: userRole === 'agent' || metadata?.isAgency === true,
          is_provider: userRole === 'provider' || userRole === 'supplier',
          is_helpdesk: userRole === 'helpdesk',

          // Organization data
          organization_id: metadata?.organizationId,
          has_organization: !!metadata?.organizationId,

          // Provider-specific data
          provider_access: metadata?.providerAccess === true,
          helpdesk_access: metadata?.helpdeskAccess === true,

          // Additional context
          phone_number: user.phoneNumbers?.[0]?.phoneNumber,
          image_url: user.imageUrl,
          username: user.username,

          // Platform data
          platform: 'web',
          service: 'livinning-app'
        });

        // Track sign-in event with additional context
        H.track('User Signed In', {
          user_id: user.id,
          role: userRole,
          method: 'clerk',
          timestamp: new Date().toISOString(),
          is_first_sign_in: user.createdAt?.getTime() === user.lastSignInAt?.getTime(),
          email: user.emailAddresses?.[0]?.emailAddress,
          organization_id: metadata?.organizationId,
          is_super_admin: metadata?.isSuperAdmin === true || userRole === 'superadmin',
          is_agent: userRole === 'agent' || metadata?.isAgency === true,
          is_provider: userRole === 'provider' || userRole === 'supplier',
          is_helpdesk: userRole === 'helpdesk',
          service: 'livinning-app'
        });

        lastIdentifiedUser.current = user.id;

        console.log('Highlight: User identified', {
          userId: user.id,
          role: userRole,
          email: user.emailAddresses?.[0]?.emailAddress
        });

      } catch (error) {
        console.error('Highlight: Failed to identify user', error);
        H.consumeError(error as Error, 'User Identification Error', {
          errorType: 'user_identification_error',
          userId: user.id,
          service: 'livinning-app'
        });
      }
    } else if (!user && lastIdentifiedUser.current) {
      // User logged out - clear identification
      try {
        H.track('User Signed Out', {
          user_id: lastIdentifiedUser.current,
          timestamp: new Date().toISOString(),
          method: 'clerk',
          service: 'livinning-app'
        });

        lastIdentifiedUser.current = null;

        console.log('Highlight: User signed out');

      } catch (error) {
        console.error('Highlight: Failed to handle user sign out', error);
      }
    }
  }, [user, isLoaded]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook for manually tracking user actions with proper context
 */
export function useHighlightTracking() {
  const { user } = useUser();

  const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
    try {
      H.track(eventName, {
        ...properties,
        user_id: user?.id,
        timestamp: new Date().toISOString(),
        service: 'livinning-app'
      });
    } catch (error) {
      console.error('Highlight: Failed to track event', error);
    }
  };

  const recordError = (error: Error, context: Record<string, any> = {}) => {
    try {
      H.consumeError(error, 'Custom Error', {
        ...context,
        user_id: user?.id,
        service: 'livinning-app',
        timestamp: new Date().toISOString()
      });
    } catch (highlightError) {
      console.error('Highlight: Failed to record error', highlightError);
    }
  };

  return {
    trackEvent,
    recordError
  };
}