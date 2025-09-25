import { v4 as uuidv4 } from 'uuid'
import { ServiceType } from './ServiceOrder'

export enum ProviderStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  OFFLINE = 'offline',
  SUSPENDED = 'suspended'
}

export enum ProviderTier {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ELITE = 'elite'
}

export interface ServiceCapability {
  serviceType: ServiceType
  basePrice: number
  currency: string
  estimatedDuration: string // "2-4 horas", "1-2 días"
  availableSlots: number // número de servicios que puede tomar simultáneamente
  description: string
}

export interface ProviderLocation {
  latitude: number
  longitude: number
  city: string
  state: string
  country: string
  serviceRadius: number // radio de servicio en km
}

export interface ProviderRating {
  averageRating: number
  totalReviews: number
  fiveStars: number
  fourStars: number
  threeStars: number
  twoStars: number
  oneStar: number
}

export interface ProviderSchedule {
  timezone: string
  workingHours: {
    monday: { start: string, end: string, available: boolean }
    tuesday: { start: string, end: string, available: boolean }
    wednesday: { start: string, end: string, available: boolean }
    thursday: { start: string, end: string, available: boolean }
    friday: { start: string, end: string, available: boolean }
    saturday: { start: string, end: string, available: boolean }
    sunday: { start: string, end: string, available: boolean }
  }
  blockedDates: string[] // array de fechas ISO string
}

export class Provider {
  constructor(
    public readonly id: string,
    public readonly userId: string, // Clerk user ID
    public readonly businessName: string,
    public readonly description: string,
    public readonly serviceCapabilities: ServiceCapability[],
    public readonly location: ProviderLocation,
    public readonly status: ProviderStatus = ProviderStatus.AVAILABLE,
    public readonly tier: ProviderTier = ProviderTier.BASIC,
    public readonly rating: ProviderRating = {
      averageRating: 0,
      totalReviews: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0
    },
    public readonly schedule: ProviderSchedule,
    public readonly isVerified: boolean = false,
    public readonly profileImageUrl?: string,
    public readonly portfolioImages: string[] = [],
    public readonly certifications: string[] = [],
    public readonly completedJobs: number = 0,
    public readonly responseTime: number = 30, // minutos promedio de respuesta
    public readonly lastActive: Date = new Date(),
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    if (!userId.trim()) throw new Error('User ID is required')
    if (!businessName.trim()) throw new Error('Business name is required')
    if (serviceCapabilities.length === 0) throw new Error('At least one service capability is required')
  }

  static create(
    userId: string,
    businessName: string,
    description: string,
    serviceCapabilities: ServiceCapability[],
    location: ProviderLocation,
    schedule: ProviderSchedule
  ): Provider {
    return new Provider(
      uuidv4(),
      userId,
      businessName,
      description,
      serviceCapabilities,
      location,
      ProviderStatus.AVAILABLE,
      ProviderTier.BASIC,
      {
        averageRating: 0,
        totalReviews: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStar: 0
      },
      schedule
    )
  }

  updateStatus(status: ProviderStatus): Provider {
    return new Provider(
      this.id,
      this.userId,
      this.businessName,
      this.description,
      this.serviceCapabilities,
      this.location,
      status,
      this.tier,
      this.rating,
      this.schedule,
      this.isVerified,
      this.profileImageUrl,
      this.portfolioImages,
      this.certifications,
      this.completedJobs,
      this.responseTime,
      new Date(), // Update lastActive
      this.createdAt,
      new Date()
    )
  }

  updateLocation(location: ProviderLocation): Provider {
    return new Provider(
      this.id,
      this.userId,
      this.businessName,
      this.description,
      this.serviceCapabilities,
      location,
      this.status,
      this.tier,
      this.rating,
      this.schedule,
      this.isVerified,
      this.profileImageUrl,
      this.portfolioImages,
      this.certifications,
      this.completedJobs,
      this.responseTime,
      this.lastActive,
      this.createdAt,
      new Date()
    )
  }

  addServiceCapability(capability: ServiceCapability): Provider {
    return new Provider(
      this.id,
      this.userId,
      this.businessName,
      this.description,
      [...this.serviceCapabilities, capability],
      this.location,
      this.status,
      this.tier,
      this.rating,
      this.schedule,
      this.isVerified,
      this.profileImageUrl,
      this.portfolioImages,
      this.certifications,
      this.completedJobs,
      this.responseTime,
      this.lastActive,
      this.createdAt,
      new Date()
    )
  }

  removeServiceCapability(serviceType: ServiceType): Provider {
    return new Provider(
      this.id,
      this.userId,
      this.businessName,
      this.description,
      this.serviceCapabilities.filter(cap => cap.serviceType !== serviceType),
      this.location,
      this.status,
      this.tier,
      this.rating,
      this.schedule,
      this.isVerified,
      this.profileImageUrl,
      this.portfolioImages,
      this.certifications,
      this.completedJobs,
      this.responseTime,
      this.lastActive,
      this.createdAt,
      new Date()
    )
  }

  updateRating(newRating: number): Provider {
    const updatedRating = { ...this.rating }
    
    // Add the new rating
    switch (Math.floor(newRating)) {
      case 5: updatedRating.fiveStars++; break
      case 4: updatedRating.fourStars++; break
      case 3: updatedRating.threeStars++; break
      case 2: updatedRating.twoStars++; break
      case 1: updatedRating.oneStar++; break
    }
    
    updatedRating.totalReviews++
    
    // Recalculate average
    const totalScore = (updatedRating.fiveStars * 5) + 
                      (updatedRating.fourStars * 4) + 
                      (updatedRating.threeStars * 3) + 
                      (updatedRating.twoStars * 2) + 
                      (updatedRating.oneStar * 1)
    
    updatedRating.averageRating = totalScore / updatedRating.totalReviews

    return new Provider(
      this.id,
      this.userId,
      this.businessName,
      this.description,
      this.serviceCapabilities,
      this.location,
      this.status,
      this.tier,
      updatedRating,
      this.schedule,
      this.isVerified,
      this.profileImageUrl,
      this.portfolioImages,
      this.certifications,
      this.completedJobs + 1,
      this.responseTime,
      this.lastActive,
      this.createdAt,
      new Date()
    )
  }

  canProvideService(serviceType: ServiceType): boolean {
    return this.serviceCapabilities.some(cap => cap.serviceType === serviceType) && 
           this.status === ProviderStatus.AVAILABLE
  }

  getServicePrice(serviceType: ServiceType): number | null {
    const capability = this.serviceCapabilities.find(cap => cap.serviceType === serviceType)
    return capability ? capability.basePrice : null
  }

  isAvailableAtTime(dateTime: Date): boolean {
    if (this.status !== ProviderStatus.AVAILABLE) {
      return false
    }

    // Check if date is blocked
    const dateString = dateTime.toISOString().split('T')[0]
    if (this.schedule.blockedDates.includes(dateString)) {
      return false
    }

    // Check working hours for the day
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayOfWeek = dayNames[dateTime.getDay()] as keyof typeof this.schedule.workingHours
    const daySchedule = this.schedule.workingHours[dayOfWeek]
    
    if (!daySchedule.available) {
      return false
    }

    // Check if time is within working hours
    const timeString = dateTime.toTimeString().substring(0, 5) // HH:MM format
    return timeString >= daySchedule.start && timeString <= daySchedule.end
  }

  getDistanceFrom(latitude: number, longitude: number): number {
    // Haversine formula to calculate distance
    const R = 6371 // Earth's radius in km
    const dLat = this.toRad(latitude - this.location.latitude)
    const dLon = this.toRad(longitude - this.location.longitude)
    const lat1Rad = this.toRad(this.location.latitude)
    const lat2Rad = this.toRad(latitude)

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * 
              Math.cos(lat1Rad) * Math.cos(lat2Rad)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  canServiceLocation(latitude: number, longitude: number): boolean {
    const distance = this.getDistanceFrom(latitude, longitude)
    return distance <= this.location.serviceRadius
  }

  isOnline(): boolean {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    return this.lastActive > fifteenMinutesAgo && this.status === ProviderStatus.AVAILABLE
  }

  getTierBadgeColor(): string {
    switch (this.tier) {
      case ProviderTier.ELITE:
        return 'gold'
      case ProviderTier.PREMIUM:
        return 'purple'
      default:
        return 'gray'
    }
  }

  getAvailableSlots(serviceType: ServiceType): number {
    const capability = this.serviceCapabilities.find(cap => cap.serviceType === serviceType)
    return capability ? capability.availableSlots : 0
  }
}