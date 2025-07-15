import { auth } from '@clerk/nextjs/server'
import { OrganizationService } from '../application/services/OrganizationService'
import { MongoOrganizationRepository } from '../infrastructure/repositories/MongoOrganizationRepository'
import { Organization } from '../domain/entities/Organization'

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

  // Get user info from Clerk
  const userEmail = 'user@example.com' // You might want to get this from Clerk user object
  
  // Get or create user's default organization
  const organization = await organizationService.getOrCreateUserDefaultOrganization(userId, userEmail)
  
  return {
    userId,
    userEmail,
    organization
  }
}

export async function requireOrganizationAccess(organizationId: string): Promise<OrganizationContext> {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('User not authenticated')
  }

  const canAccess = await organizationService.canUserAccessOrganization(userId, organizationId)
  
  if (!canAccess) {
    throw new Error('You do not have access to this organization')
  }

  const organization = await organizationService.getOrganizationById(organizationId)
  
  if (!organization) {
    throw new Error('Organization not found')
  }

  return {
    userId,
    userEmail: 'user@example.com', // You might want to get this from Clerk user object
    organization
  }
}