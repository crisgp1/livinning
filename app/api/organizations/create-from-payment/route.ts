import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/infrastructure/database/connection'
import OrganizationModel from '@/lib/infrastructure/database/models/OrganizationModel'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, slug, ownerId, plan, userEmail, isPaymentUpgrade, sessionId } = await request.json()

    if (!name || !slug || !ownerId || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the requesting user matches the ownerId
    if (userId !== ownerId) {
      return NextResponse.json(
        { error: 'Unauthorized: Cannot create organization for another user' },
        { status: 403 }
      )
    }

    await connectDB()

    console.log(`Creating/updating organization for user ${ownerId} with plan ${plan}`)

    // Check if user already has an organization
    const existingOrg = await OrganizationModel.findOne({ ownerId })
    if (existingOrg) {
      // Upgrade existing organization instead of creating new one
      const upgradedOrg = await upgradeExistingOrganization(existingOrg, plan, userEmail, isPaymentUpgrade)
      
      // Update user metadata in Clerk
      await updateUserMetadata(ownerId, upgradedOrg)
      
      return NextResponse.json({
        success: true,
        data: upgradedOrg,
        message: 'Organization upgraded successfully'
      })
    }

    // Check if slug is available
    const slugExists = await OrganizationModel.findOne({ slug })
    if (slugExists) {
      // Generate a unique slug by appending a number
      const timestamp = Date.now().toString().slice(-4)
      const uniqueSlug = `${slug}-${timestamp}`
      
      const organization = await createOrganization({
        name,
        slug: uniqueSlug,
        ownerId,
        plan,
        userEmail,
        isPaymentUpgrade
      })
      
      // Update user metadata in Clerk
      await updateUserMetadata(ownerId, organization)
      
      return NextResponse.json({
        success: true,
        data: organization,
        message: 'Organization created successfully with modified slug'
      })
    }

    const organization = await createOrganization({
      name,
      slug,
      ownerId,
      plan,
      userEmail,
      isPaymentUpgrade
    })
    
    // Update user metadata in Clerk
    await updateUserMetadata(ownerId, organization)

    return NextResponse.json({
      success: true,
      data: organization
    })

  } catch (error) {
    console.error('Organization creation error:', error)
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create organization',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

async function upgradeExistingOrganization(
  existingOrg: any,
  plan: string,
  userEmail?: string,
  isPaymentUpgrade?: boolean
) {
  // Map plan to organization settings and credits
  const planSettings = {
    basic: {
      maxProperties: 25,
      allowBranding: true,
      allowAnalytics: true,
      allowCustomDomain: false,
      allowAPI: false,
      allowMultiUser: false,
      credits: {
        properties: { total: 25, used: 0, remaining: 25 },
        premiumFeatures: {
          virtualTours: 5,
          professionalPhotos: 3,
          marketAnalysis: 2,
          featuredListings: 10
        },
        serviceCredits: {
          photography: 2,
          legal: 1,
          virtualTour: 2,
          homeStaging: 1,
          marketAnalysis: 3,
          documentation: 5
        }
      }
    },
    premium: {
      maxProperties: 100,
      allowBranding: true,
      allowAnalytics: true,
      allowCustomDomain: true,
      allowAPI: false,
      allowMultiUser: false,
      credits: {
        properties: { total: 100, used: 0, remaining: 100 },
        premiumFeatures: {
          virtualTours: 20,
          professionalPhotos: 10,
          marketAnalysis: 10,
          featuredListings: 50
        },
        serviceCredits: {
          photography: 10,
          legal: 5,
          virtualTour: 10,
          homeStaging: 5,
          marketAnalysis: 10,
          documentation: 20
        }
      }
    },
    enterprise: {
      maxProperties: -1, // unlimited
      allowBranding: true,
      allowAnalytics: true,
      allowCustomDomain: true,
      allowAPI: true,
      allowMultiUser: true,
      credits: {
        properties: { total: -1, used: 0, remaining: -1 },
        premiumFeatures: {
          virtualTours: -1,
          professionalPhotos: -1,
          marketAnalysis: -1,
          featuredListings: -1
        },
        serviceCredits: {
          photography: 50,
          legal: 25,
          virtualTour: 50,
          homeStaging: 25,
          marketAnalysis: 50,
          documentation: 100
        }
      }
    }
  }

  const settings = planSettings[plan as keyof typeof planSettings] || planSettings.basic

  // Update existing organization with new plan
  existingOrg.plan = plan
  existingOrg.settings = {
    ...existingOrg.settings,
    maxProperties: settings.maxProperties,
    allowBranding: settings.allowBranding,
    allowAnalytics: settings.allowAnalytics,
    allowAPI: settings.allowAPI,
    allowMultiUser: settings.allowMultiUser,
    customDomain: settings.allowCustomDomain ? (existingOrg.settings.customDomain || '') : undefined,
    // Ensure branding and notifications objects exist
    branding: existingOrg.settings.branding || {
      logoUrl: '',
      primaryColor: '#ff385c',
      secondaryColor: '#ff6b8a',
      customCss: ''
    },
    notifications: existingOrg.settings.notifications || {
      emailNotifications: true,
      newPropertyNotifications: true,
      inquiryNotifications: true
    }
  }
  // Add or update credits
  existingOrg.credits = settings.credits
  existingOrg.metadata = {
    ...existingOrg.metadata,
    isPaymentUpgrade: isPaymentUpgrade || false,
    upgradedAt: isPaymentUpgrade ? new Date() : existingOrg.metadata?.upgradedAt,
    userEmail: userEmail || existingOrg.metadata?.userEmail,
    planFeatures: settings
  }
  existingOrg.updatedAt = new Date()

  await existingOrg.save()

  // Send upgrade email to user
  if (userEmail && isPaymentUpgrade) {
    console.log(`Sending upgrade email to ${userEmail} for plan ${plan}`)
  }

  return {
    id: existingOrg._id,
    name: existingOrg.name,
    slug: existingOrg.slug,
    plan: existingOrg.plan,
    status: existingOrg.status,
    createdAt: existingOrg.createdAt,
    upgradedAt: existingOrg.metadata?.upgradedAt
  }
}

async function createOrganization({
  name,
  slug,
  ownerId,
  plan,
  userEmail,
  isPaymentUpgrade
}: {
  name: string
  slug: string
  ownerId: string
  plan: string
  userEmail?: string
  isPaymentUpgrade?: boolean
}) {
  // Map plan to organization settings and credits
  const planSettings = {
    basic: {
      maxProperties: 25,
      allowBranding: true,
      allowAnalytics: true,
      allowCustomDomain: false,
      allowAPI: false,
      allowMultiUser: false,
      credits: {
        properties: { total: 25, used: 0, remaining: 25 },
        premiumFeatures: {
          virtualTours: 5,
          professionalPhotos: 3,
          marketAnalysis: 2,
          featuredListings: 10
        },
        serviceCredits: {
          photography: 2,
          legal: 1,
          virtualTour: 2,
          homeStaging: 1,
          marketAnalysis: 3,
          documentation: 5
        }
      }
    },
    premium: {
      maxProperties: 100,
      allowBranding: true,
      allowAnalytics: true,
      allowCustomDomain: true,
      allowAPI: false,
      allowMultiUser: false,
      credits: {
        properties: { total: 100, used: 0, remaining: 100 },
        premiumFeatures: {
          virtualTours: 20,
          professionalPhotos: 10,
          marketAnalysis: 10,
          featuredListings: 50
        },
        serviceCredits: {
          photography: 10,
          legal: 5,
          virtualTour: 10,
          homeStaging: 5,
          marketAnalysis: 10,
          documentation: 20
        }
      }
    },
    enterprise: {
      maxProperties: -1, // unlimited
      allowBranding: true,
      allowAnalytics: true,
      allowCustomDomain: true,
      allowAPI: true,
      allowMultiUser: true,
      credits: {
        properties: { total: -1, used: 0, remaining: -1 },
        premiumFeatures: {
          virtualTours: -1,
          professionalPhotos: -1,
          marketAnalysis: -1,
          featuredListings: -1
        },
        serviceCredits: {
          photography: 50,
          legal: 25,
          virtualTour: 50,
          homeStaging: 25,
          marketAnalysis: 50,
          documentation: 100
        }
      }
    }
  }

  const settings = planSettings[plan as keyof typeof planSettings] || planSettings.basic

  const organization = new OrganizationModel({
    _id: uuidv4(),
    name,
    slug,
    description: `Agencia inmobiliaria profesional - Plan ${plan}`,
    ownerId,
    status: 'active',
    plan,
    settings: {
      allowPublicProperties: true,
      requireApproval: false,
      branding: {
        logoUrl: '',
        primaryColor: '#ff385c',
        secondaryColor: '#ff6b8a',
        customCss: ''
      },
      notifications: {
        emailNotifications: true,
        newPropertyNotifications: true,
        inquiryNotifications: true
      },
      // Extended settings for paid plans
      maxProperties: settings.maxProperties,
      allowBranding: settings.allowBranding,
      allowAnalytics: settings.allowAnalytics,
      allowAPI: settings.allowAPI,
      allowMultiUser: settings.allowMultiUser,
      customDomain: settings.allowCustomDomain ? '' : undefined
    },
    credits: settings.credits,
    metadata: {
      isPaymentUpgrade: isPaymentUpgrade || false,
      upgradedAt: isPaymentUpgrade ? new Date() : undefined,
      userEmail: userEmail,
      planFeatures: settings
    },
    createdAt: new Date(),
    updatedAt: new Date()
  })

  await organization.save()

  // TODO: Send welcome email to user
  if (userEmail && isPaymentUpgrade) {
    console.log(`Sending welcome email to ${userEmail} for plan ${plan}`)
    // You could integrate with SendGrid, Mailgun, etc. here
  }

  return {
    id: organization._id,
    name: organization.name,
    slug: organization.slug,
    plan: organization.plan,
    status: organization.status,
    createdAt: organization.createdAt
  }
}

async function updateUserMetadata(
  userId: string,
  organization: {
    id: string
    name: string
    slug: string
    plan: string
    status: string
    createdAt?: Date
    upgradedAt?: Date
  }
) {
  try {
    const clerk = await clerkClient()
    
    // Get current user metadata to preserve existing data
    const user = await clerk.users.getUser(userId)
    const currentMetadata = user.publicMetadata as any
    
    // Update user's public metadata to include organization info
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        ...currentMetadata,
        organizationId: organization.id,
        organizationName: organization.name,
        organizationSlug: organization.slug,
        organizationPlan: organization.plan,
        isAgency: true,
        role: 'agent', // Set role to agent for paid organizations
        onboardingCompleted: true, // Mark onboarding as completed
        isVerified: true, // Mark as verified for paid plans
        agencyUpgradedAt: organization.upgradedAt || organization.createdAt
      }
    })
    
    console.log(`Updated Clerk metadata for user ${userId} with organization ${organization.id}`)
  } catch (error) {
    console.error('Error updating user metadata in Clerk:', error)
    // Don't throw - this is non-critical
  }
}