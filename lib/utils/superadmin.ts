import { clerkClient } from '@clerk/nextjs/server'

// Define superadmin user IDs or emails here
const SUPERADMIN_USER_IDS: string[] = [
  'user_30ZlLWXqsFyb944mJWOnD7wqQsV', // User with isSuperAdmin metadata
  // Add your Clerk user ID here
  // You can get it from the Clerk dashboard or by logging into your app and checking the user object
]

const SUPERADMIN_EMAILS: string[] = [
  'cristiangp2001@gmail.com', // Add your email here
  // Add other superadmin emails as needed
]

export function isSuperAdmin(user: any): boolean {
  if (!user) return false
  
  // Primary check: user metadata for superadmin status (dynamic)
  if (user.publicMetadata?.isSuperAdmin === true) {
    return true
  }
  
  // Secondary check: role-based superadmin (dynamic)
  if (user.publicMetadata?.role === 'superadmin') {
    return true
  }
  
  // Fallback: hardcoded lists (only as emergency access)
  if (SUPERADMIN_USER_IDS.includes(user.id)) {
    return true
  }
  
  const userEmails = user.emailAddresses?.map((email: any) => email.emailAddress) || []
  return SUPERADMIN_EMAILS.some(adminEmail => userEmails.includes(adminEmail))
}

export async function isSuperAdminById(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    return isSuperAdmin(user)
  } catch (error) {
    console.error('Error checking superadmin status:', error)
    return false
  }
}

export function requireSuperAdmin(user: any): void {
  if (!isSuperAdmin(user)) {
    throw new Error('Unauthorized: Superadmin access required')
  }
}

// Middleware helper
export function checkSuperAdminAccess(user: any) {
  if (!user) {
    return { authorized: false, reason: 'Not authenticated' }
  }
  
  if (!isSuperAdmin(user)) {
    return { authorized: false, reason: 'Insufficient permissions' }
  }
  
  return { authorized: true }
}