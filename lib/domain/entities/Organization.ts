import { v4 as uuidv4 } from 'uuid'

export enum OrganizationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

export enum OrganizationPlan {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export class Organization {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly ownerId: string,
    public readonly status: OrganizationStatus = OrganizationStatus.ACTIVE,
    public readonly plan: OrganizationPlan = OrganizationPlan.FREE,
    public readonly settings: OrganizationSettings = new OrganizationSettings(),
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    if (!name.trim()) throw new Error('Organization name is required')
    if (!slug.trim()) throw new Error('Organization slug is required')
    if (!ownerId.trim()) throw new Error('Owner ID is required')
    if (!this.isValidSlug(slug)) throw new Error('Invalid organization slug format')
  }

  static create(
    name: string,
    slug: string,
    description: string,
    ownerId: string,
    plan: OrganizationPlan = OrganizationPlan.FREE
  ): Organization {
    return new Organization(
      uuidv4(),
      name,
      slug,
      description,
      ownerId,
      OrganizationStatus.ACTIVE,
      plan
    )
  }

  private isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50
  }

  updateDetails(name?: string, description?: string): Organization {
    return new Organization(
      this.id,
      name ?? this.name,
      this.slug,
      description ?? this.description,
      this.ownerId,
      this.status,
      this.plan,
      this.settings,
      this.createdAt,
      new Date()
    )
  }

  updateSettings(settings: OrganizationSettings): Organization {
    return new Organization(
      this.id,
      this.name,
      this.slug,
      this.description,
      this.ownerId,
      this.status,
      this.plan,
      settings,
      this.createdAt,
      new Date()
    )
  }

  changePlan(plan: OrganizationPlan): Organization {
    return new Organization(
      this.id,
      this.name,
      this.slug,
      this.description,
      this.ownerId,
      this.status,
      plan,
      this.settings,
      this.createdAt,
      new Date()
    )
  }

  suspend(): Organization {
    return new Organization(
      this.id,
      this.name,
      this.slug,
      this.description,
      this.ownerId,
      OrganizationStatus.SUSPENDED,
      this.plan,
      this.settings,
      this.createdAt,
      new Date()
    )
  }

  activate(): Organization {
    return new Organization(
      this.id,
      this.name,
      this.slug,
      this.description,
      this.ownerId,
      OrganizationStatus.ACTIVE,
      this.plan,
      this.settings,
      this.createdAt,
      new Date()
    )
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId
  }

  isActive(): boolean {
    return this.status === OrganizationStatus.ACTIVE
  }

  canCreateProperties(): boolean {
    return this.isActive()
  }

  getMaxPropertiesLimit(): number {
    switch (this.plan) {
      case OrganizationPlan.FREE:
        return 5
      case OrganizationPlan.BASIC:
        return 50
      case OrganizationPlan.PREMIUM:
        return 200
      case OrganizationPlan.ENTERPRISE:
        return -1 // Unlimited
      default:
        return 5
    }
  }
}

export class OrganizationSettings {
  constructor(
    public readonly allowPublicProperties: boolean = true,
    public readonly requireApproval: boolean = false,
    public readonly customDomain?: string,
    public readonly branding?: OrganizationBranding,
    public readonly notifications?: OrganizationNotifications
  ) {}
}

export class OrganizationBranding {
  constructor(
    public readonly logoUrl?: string,
    public readonly primaryColor?: string,
    public readonly secondaryColor?: string,
    public readonly customCss?: string
  ) {}
}

export class OrganizationNotifications {
  constructor(
    public readonly emailNotifications: boolean = true,
    public readonly newPropertyNotifications: boolean = true,
    public readonly inquiryNotifications: boolean = true
  ) {}
}