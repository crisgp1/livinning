import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';

interface ImpersonationData {
  originalUserId: string;
  originalUserName: string;
  originalUserImageUrl?: string;
  targetUserId: string;
  targetUserName: string;
  targetUserEmail: string;
  targetUserImageUrl?: string;
  targetUserRole: string;
  impersonatedAt: string;
}

export async function getEffectiveUser() {
  try {
    // Check for impersonation cookie
    const cookieStore = await cookies();
    const impersonationCookie = cookieStore.get('impersonation');
    
    if (impersonationCookie) {
      const impersonationData: ImpersonationData = JSON.parse(impersonationCookie.value);
      
      // Get the target user from Clerk
      const clerk = await clerkClient();
      const targetUser = await clerk.users.getUser(impersonationData.targetUserId);
      
      // Return the impersonated user with additional metadata
      return {
        user: targetUser,
        isImpersonating: true,
        originalUserId: impersonationData.originalUserId,
        impersonationData
      };
    }
    
    // No impersonation, return the current user
    const user = await currentUser();
    return {
      user,
      isImpersonating: false,
      originalUserId: null,
      impersonationData: null
    };
  } catch (error) {
    console.error('Error getting effective user:', error);
    // Fallback to current user
    const user = await currentUser();
    return {
      user,
      isImpersonating: false,
      originalUserId: null,
      impersonationData: null
    };
  }
}

export async function getEffectiveUserId() {
  const { user } = await getEffectiveUser();
  return user?.id || null;
}

export async function getEffectiveUserRole() {
  const { user, impersonationData } = await getEffectiveUser();
  
  if (impersonationData) {
    return impersonationData.targetUserRole;
  }
  
  return (user?.publicMetadata?.role as string) || 'user';
}

// Helper function to get impersonation data from request
export function getImpersonationFromRequest(request: NextRequest): ImpersonationData | null {
  try {
    const impersonationCookie = request.cookies.get('impersonation');
    if (impersonationCookie) {
      return JSON.parse(impersonationCookie.value);
    }
  } catch (error) {
    console.error('Error parsing impersonation cookie from request:', error);
  }
  return null;
}