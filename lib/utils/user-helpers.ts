import { auth, currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import OrganizationModel from '@/lib/infrastructure/database/models/OrganizationModel'

export interface UserOrganizationInfo {
  hasOrganization: boolean
  organization?: {
    id: string
    name: string
    slug: string
    plan: string
    status: string
  }
  isAgency: boolean
}

/**
 * Check if the current user has an organization
 * First checks Clerk metadata, then falls back to database
 */
export async function getUserOrganizationInfo(): Promise<UserOrganizationInfo> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { hasOrganization: false, isAgency: false }
    }

    // First, check Clerk metadata for faster response
    const user = await currentUser()
    
    if (user?.publicMetadata?.isAgency && user?.publicMetadata?.organizationId) {
      return {
        hasOrganization: true,
        organization: {
          id: user.publicMetadata.organizationId as string,
          name: user.publicMetadata.organizationName as string,
          slug: user.publicMetadata.organizationSlug as string,
          plan: user.publicMetadata.organizationPlan as string,
          status: 'active'
        },
        isAgency: true
      }
    }

    // Fallback to database check
    await connectDB()
    const organization = await OrganizationModel.findOne({ ownerId: userId })
    
    if (organization) {
      // Update Clerk metadata for future requests
      // This is done asynchronously to not block the response
      updateUserMetadataAsync(userId, organization)
      
      return {
        hasOrganization: true,
        organization: {
          id: organization._id,
          name: organization.name,
          slug: organization.slug,
          plan: organization.plan,
          status: organization.status
        },
        isAgency: true
      }
    }

    return { hasOrganization: false, isAgency: false }
  } catch (error) {
    console.error('Error checking user organization:', error)
    return { hasOrganization: false, isAgency: false }
  }
}

/**
 * Get organization by user ID
 */
export async function getOrganizationByUserId(userId: string) {
  try {
    await connectDB()
    const organization = await OrganizationModel.findOne({ ownerId: userId })
    return organization
  } catch (error) {
    console.error('Error fetching organization:', error)
    return null
  }
}

/**
 * Update user metadata asynchronously
 */
async function updateUserMetadataAsync(userId: string, organization: any) {
  try {
    const { clerkClient } = await import('@clerk/nextjs/server')
    const clerk = await clerkClient()
    
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        organizationId: organization._id,
        organizationName: organization.name,
        organizationSlug: organization.slug,
        organizationPlan: organization.plan,
        isAgency: true,
        agencyUpgradedAt: organization.metadata?.upgradedAt || organization.createdAt
      }
    })
  } catch (error) {
    console.error('Error updating user metadata async:', error)
  }
}