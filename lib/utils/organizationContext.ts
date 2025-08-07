import { auth } from '@clerk/nextjs/server'
import { OrganizationService } from '../application/services/OrganizationService'
import { MongoOrganizationRepository } from '../infrastructure/repositories/MongoOrganizationRepository'
import { Organization } from '../domain/entities/Organization'
import { cookies } from 'next/headers'

const organizationRepository = new MongoOrganizationRepository()
const organizationService = new OrganizationService(organizationRepository)

export interface OrganizationContext {
  userId: string
  userEmail: string
  organization: Organization
}

export async function getOrganizationContext(): Promise<OrganizationContext> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Check for impersonation and use the impersonated user's ID for organization operations
  let effectiveUserId = userId
  try {
    const cookieStore = await cookies()
    const impersonationCookie = cookieStore.get('impersonation')
    if (impersonationCookie) {
      const impersonationData = JSON.parse(impersonationCookie.value)
      effectiveUserId = impersonationData.targetUserId
    }
  } catch (error) {
    console.error('Error parsing impersonation cookie in organizationContext:', error)
  }

  // Get user info from Clerk
  const userEmail = 'user@example.com' // You might want to get this from Clerk user object
  
  // Get or create user's default organization using the effective user ID
  const organization = await organizationService.getOrCreateUserDefaultOrganization(effectiveUserId, userEmail)
  
  return {
    userId: effectiveUserId, // Return the effective user ID for property creation
    userEmail,
    organization
  }
}

export async function requireOrganizationAccess(organizationId: string): Promise<OrganizationContext> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('User not authenticated')
  }

  // Check for impersonation and use the impersonated user's ID for organization access
  let effectiveUserId = userId
  try {
    const cookieStore = await cookies()
    const impersonationCookie = cookieStore.get('impersonation')
    if (impersonationCookie) {
      const impersonationData = JSON.parse(impersonationCookie.value)
      effectiveUserId = impersonationData.targetUserId
    }
  } catch (error) {
    console.error('Error parsing impersonation cookie in requireOrganizationAccess:', error)
  }

  const canAccess = await organizationService.canUserAccessOrganization(effectiveUserId, organizationId)
  
  if (!canAccess) {
    throw new Error('You do not have access to this organization')
  }

  const organization = await organizationService.getOrganizationById(organizationId)
  
  if (!organization) {
    throw new Error('Organization not found')
  }

  return {
    userId: effectiveUserId,
    userEmail: 'user@example.com', // You might want to get this from Clerk user object
    organization
  }
}