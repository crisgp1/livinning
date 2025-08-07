import { auth } from '@clerk/nextjs/server'
import { OrganizationService } from '../application/services/OrganizationService'
import { MongoOrganizationRepository } from '../infrastructure/repositories/MongoOrganizationRepository'
import { Organization } from '../domain/entities/Organization'
import { getEffectiveUserId } from '../auth-utils'

const organizationRepository = new MongoOrganizationRepository()
const organizationService = new OrganizationService(organizationRepository)

export interface OrganizationContext {
  userId: string
  userEmail: string
  organization: Organization
}

export async function getOrganizationContext(): Promise<OrganizationContext> {
  // Check for impersonation first
  const effectiveUserId = await getEffectiveUserId()
  
  if (!effectiveUserId) {
    throw new Error('User not authenticated')
  }

  // Get user info from Clerk
  const userEmail = 'user@example.com' // You might want to get this from Clerk user object
  
  // Get or create user's default organization using the effective user ID
  const organization = await organizationService.getOrCreateUserDefaultOrganization(effectiveUserId, userEmail)
  
  return {
    userId: effectiveUserId,
    userEmail,
    organization
  }
}

export async function requireOrganizationAccess(organizationId: string): Promise<OrganizationContext> {
  // Check for impersonation first
  const effectiveUserId = await getEffectiveUserId()
  
  if (!effectiveUserId) {
    throw new Error('User not authenticated')
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