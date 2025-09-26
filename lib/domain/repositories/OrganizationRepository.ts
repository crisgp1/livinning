import { Organization } from '../entities/Organization'

export interface OrganizationRepository {
  save(organization: Organization): Promise<Organization>
  findById(id: string): Promise<Organization | null>
  findBySlug(slug: string): Promise<Organization | null>
  findByOwnerId(ownerId: string): Promise<Organization[]>
  update(organization: Organization): Promise<Organization>
  delete(id: string): Promise<void>
  isSlugAvailable(slug: string): Promise<boolean>
}