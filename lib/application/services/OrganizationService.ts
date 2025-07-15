import { Organization, OrganizationStatus, OrganizationPlan } from '../../domain/entities/Organization'
import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository'

export class OrganizationService {
  constructor(private organizationRepository: OrganizationRepository) {}

  async createOrganization(
    name: string,
    slug: string,
    description: string,
    ownerId: string,
    plan: OrganizationPlan = OrganizationPlan.FREE
  ): Promise<Organization> {
    // Check if slug is available
    const isSlugAvailable = await this.organizationRepository.isSlugAvailable(slug)
    if (!isSlugAvailable) {
      throw new Error('Organization slug is already taken')
    }

    const organization = Organization.create(name, slug, description, ownerId, plan)
    return await this.organizationRepository.save(organization)
  }

  async getOrganizationById(id: string): Promise<Organization | null> {
    return await this.organizationRepository.findById(id)
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    return await this.organizationRepository.findBySlug(slug)
  }

  async getOrganizationsByOwnerId(ownerId: string): Promise<Organization[]> {
    return await this.organizationRepository.findByOwnerId(ownerId)
  }

  async updateOrganization(
    organizationId: string,
    userId: string,
    updates: { name?: string; description?: string }
  ): Promise<Organization> {
    const organization = await this.organizationRepository.findById(organizationId)
    
    if (!organization) {
      throw new Error('Organization not found')
    }

    if (!organization.isOwnedBy(userId)) {
      throw new Error('You are not authorized to update this organization')
    }

    const updatedOrganization = organization.updateDetails(updates.name, updates.description)
    return await this.organizationRepository.update(updatedOrganization)
  }

  async deleteOrganization(organizationId: string, userId: string): Promise<void> {
    const organization = await this.organizationRepository.findById(organizationId)
    
    if (!organization) {
      throw new Error('Organization not found')
    }

    if (!organization.isOwnedBy(userId)) {
      throw new Error('You are not authorized to delete this organization')
    }

    await this.organizationRepository.delete(organizationId)
  }

  async isSlugAvailable(slug: string): Promise<boolean> {
    return await this.organizationRepository.isSlugAvailable(slug)
  }

  async canUserAccessOrganization(userId: string, organizationId: string): Promise<boolean> {
    const organization = await this.organizationRepository.findById(organizationId)
    if (!organization) {
      return false
    }

    // For now, only organization owner can access
    // In the future, you might want to add members/roles
    return organization.isOwnedBy(userId)
  }

  async getUserDefaultOrganization(userId: string): Promise<Organization | null> {
    const organizations = await this.organizationRepository.findByOwnerId(userId)
    return organizations.length > 0 ? organizations[0] : null
  }

  async getOrCreateUserDefaultOrganization(userId: string, userEmail: string): Promise<Organization> {
    const existingOrganization = await this.getUserDefaultOrganization(userId)
    
    if (existingOrganization) {
      return existingOrganization
    }

    // Create a default organization for the user
    const defaultSlug = `user-${userId.substring(0, 8)}`
    const defaultName = `Mi Organización`
    const defaultDescription = `Organización personal de ${userEmail}`

    return await this.createOrganization(
      defaultName,
      defaultSlug,
      defaultDescription,
      userId,
      OrganizationPlan.FREE
    )
  }
}