import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository'
import { Organization, OrganizationStatus, OrganizationPlan, OrganizationSettings, OrganizationBranding, OrganizationNotifications } from '../../domain/entities/Organization'
import { OrganizationModel, OrganizationDocument } from '../database/schemas/OrganizationSchema'
import connectDB from '../database/connection'

export class MongoOrganizationRepository implements OrganizationRepository {
  private async ensureConnection(): Promise<void> {
    await connectDB()
  }

  private toDomain(doc: OrganizationDocument): Organization {
    const branding = doc.settings.branding ? new OrganizationBranding(
      doc.settings.branding.logoUrl,
      doc.settings.branding.primaryColor,
      doc.settings.branding.secondaryColor,
      doc.settings.branding.customCss
    ) : undefined

    const notifications = doc.settings.notifications ? new OrganizationNotifications(
      doc.settings.notifications.emailNotifications,
      doc.settings.notifications.newPropertyNotifications,
      doc.settings.notifications.inquiryNotifications
    ) : undefined

    const settings = new OrganizationSettings(
      doc.settings.allowPublicProperties,
      doc.settings.requireApproval,
      doc.settings.customDomain,
      branding,
      notifications
    )

    return new Organization(
      doc._id,
      doc.name,
      doc.slug,
      doc.description,
      doc.ownerId,
      doc.status as OrganizationStatus,
      doc.plan as OrganizationPlan,
      settings,
      doc.createdAt,
      doc.updatedAt
    )
  }

  private toDocument(organization: Organization): Partial<OrganizationDocument> {
    return {
      _id: organization.id,
      name: organization.name,
      slug: organization.slug,
      description: organization.description,
      ownerId: organization.ownerId,
      status: organization.status,
      plan: organization.plan,
      settings: {
        allowPublicProperties: organization.settings.allowPublicProperties,
        requireApproval: organization.settings.requireApproval,
        customDomain: organization.settings.customDomain,
        branding: organization.settings.branding ? {
          logoUrl: organization.settings.branding.logoUrl,
          primaryColor: organization.settings.branding.primaryColor,
          secondaryColor: organization.settings.branding.secondaryColor,
          customCss: organization.settings.branding.customCss
        } : undefined,
        notifications: organization.settings.notifications ? {
          emailNotifications: organization.settings.notifications.emailNotifications,
          newPropertyNotifications: organization.settings.notifications.newPropertyNotifications,
          inquiryNotifications: organization.settings.notifications.inquiryNotifications
        } : undefined
      }
    }
  }

  async save(organization: Organization): Promise<Organization> {
    await this.ensureConnection()
    
    const doc = new OrganizationModel(this.toDocument(organization))
    const savedDoc = await doc.save()
    
    return this.toDomain(savedDoc)
  }

  async findById(id: string): Promise<Organization | null> {
    await this.ensureConnection()
    
    const doc = await OrganizationModel.findById(id)
    return doc ? this.toDomain(doc) : null
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    await this.ensureConnection()
    
    const doc = await OrganizationModel.findOne({ slug })
    return doc ? this.toDomain(doc) : null
  }

  async findByOwnerId(ownerId: string): Promise<Organization[]> {
    await this.ensureConnection()
    
    const docs = await OrganizationModel.find({ ownerId }).sort({ createdAt: -1 })
    return docs.map(doc => this.toDomain(doc))
  }

  async update(organization: Organization): Promise<Organization> {
    await this.ensureConnection()
    
    const updateData = this.toDocument(organization)
    delete updateData._id
    
    const doc = await OrganizationModel.findByIdAndUpdate(
      organization.id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )

    if (!doc) {
      throw new Error('Organization not found')
    }

    return this.toDomain(doc)
  }

  async delete(id: string): Promise<void> {
    await this.ensureConnection()
    
    const result = await OrganizationModel.findByIdAndDelete(id)
    
    if (!result) {
      throw new Error('Organization not found')
    }
  }

  async isSlugAvailable(slug: string): Promise<boolean> {
    await this.ensureConnection()
    
    const existing = await OrganizationModel.findOne({ slug })
    return !existing
  }
}