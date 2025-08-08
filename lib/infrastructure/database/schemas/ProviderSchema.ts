import mongoose, { Schema, Document } from 'mongoose'
import { 
  Provider, 
  ProviderStatus, 
  ProviderTier, 
  ServiceCapability, 
  ProviderLocation, 
  ProviderRating, 
  ProviderSchedule 
} from '@/lib/domain/entities/Provider'
import { ServiceType } from '@/lib/domain/entities/ServiceOrder'

interface IProvider extends Document {
  _id: string
  userId: string
  businessName: string
  description: string
  serviceCapabilities: ServiceCapability[]
  location: ProviderLocation
  status: ProviderStatus
  tier: ProviderTier
  rating: ProviderRating
  schedule: ProviderSchedule
  isVerified: boolean
  profileImageUrl?: string
  portfolioImages: string[]
  certifications: string[]
  completedJobs: number
  responseTime: number
  lastActive: Date
  createdAt: Date
  updatedAt: Date
}

const ServiceCapabilitySchema = new Schema({
  serviceType: {
    type: String,
    enum: [
      'photography',
      'legal',
      'virtual-tour',
      'home-staging',
      'market-analysis',
      'documentation',
      'highlight',
      'cleaning',
      'maintenance',
      'gardening',
      'electrical',
      'carpentry',
      'plumbing',
      'painting',
      'air-conditioning'
    ],
    required: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'MXN'
  },
  estimatedDuration: {
    type: String,
    required: true
  },
  availableSlots: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false })

const ProviderLocationSchema = new Schema({
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'México'
  },
  serviceRadius: {
    type: Number,
    required: true,
    min: 1,
    default: 25 // 25 km radius
  }
}, { _id: false })

const ProviderRatingSchema = new Schema({
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  fiveStars: {
    type: Number,
    default: 0,
    min: 0
  },
  fourStars: {
    type: Number,
    default: 0,
    min: 0
  },
  threeStars: {
    type: Number,
    default: 0,
    min: 0
  },
  twoStars: {
    type: Number,
    default: 0,
    min: 0
  },
  oneStar: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false })

const WorkingHoursSchema = new Schema({
  monday: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    available: { type: Boolean, default: true }
  },
  tuesday: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    available: { type: Boolean, default: true }
  },
  wednesday: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    available: { type: Boolean, default: true }
  },
  thursday: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    available: { type: Boolean, default: true }
  },
  friday: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '18:00' },
    available: { type: Boolean, default: true }
  },
  saturday: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '15:00' },
    available: { type: Boolean, default: false }
  },
  sunday: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '15:00' },
    available: { type: Boolean, default: false }
  }
}, { _id: false })

const ProviderScheduleSchema = new Schema({
  timezone: {
    type: String,
    required: true,
    default: 'America/Mexico_City'
  },
  workingHours: {
    type: WorkingHoursSchema,
    required: true,
    default: () => ({})
  },
  blockedDates: [{
    type: String, // ISO date strings
    validate: {
      validator: function(date: string) {
        return !isNaN(Date.parse(date))
      },
      message: 'Invalid date format'
    }
  }]
}, { _id: false })

const ProviderSchema = new Schema<IProvider>({
  _id: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  serviceCapabilities: {
    type: [ServiceCapabilitySchema],
    required: true,
    validate: {
      validator: function(capabilities: ServiceCapability[]) {
        return capabilities.length > 0
      },
      message: 'At least one service capability is required'
    }
  },
  location: {
    type: ProviderLocationSchema,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(ProviderStatus),
    default: ProviderStatus.AVAILABLE,
    index: true
  },
  tier: {
    type: String,
    enum: Object.values(ProviderTier),
    default: ProviderTier.BASIC,
    index: true
  },
  rating: {
    type: ProviderRatingSchema,
    default: () => ({})
  },
  schedule: {
    type: ProviderScheduleSchema,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  profileImageUrl: {
    type: String,
    trim: true
  },
  portfolioImages: [{
    type: String,
    trim: true
  }],
  certifications: [{
    type: String,
    trim: true
  }],
  completedJobs: {
    type: Number,
    default: 0,
    min: 0
  },
  responseTime: {
    type: Number,
    default: 30, // minutes
    min: 1
  },
  lastActive: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  versionKey: false
})

// Indexes for performance
ProviderSchema.index({ 'location.latitude': 1, 'location.longitude': 1 }) // For geospatial queries
ProviderSchema.index({ 'serviceCapabilities.serviceType': 1 }) // For service type filtering
ProviderSchema.index({ status: 1, isVerified: 1 }) // For availability filtering
ProviderSchema.index({ 'rating.averageRating': -1 }) // For rating sorting
ProviderSchema.index({ tier: 1, 'rating.averageRating': -1 }) // For tier and rating sorting
ProviderSchema.index({ lastActive: -1 }) // For online status

// Instance methods
ProviderSchema.methods.toDomainEntity = function(): Provider {
  return new Provider(
    this._id,
    this.userId,
    this.businessName,
    this.description,
    this.serviceCapabilities,
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
    this.updatedAt
  )
}

// Define interface for static methods
interface IProviderModel extends mongoose.Model<IProvider> {
  fromDomainEntity(provider: Provider): IProvider
  findAvailableForService(
    serviceType: ServiceType,
    latitude?: number,
    longitude?: number,
    maxDistance?: number
  ): mongoose.Aggregate<any[]>
  findOnlineProviders(): mongoose.Query<IProvider[], IProvider>
}

// Static methods
ProviderSchema.statics.fromDomainEntity = function(provider: Provider) {
  return new this({
    _id: provider.id,
    userId: provider.userId,
    businessName: provider.businessName,
    description: provider.description,
    serviceCapabilities: provider.serviceCapabilities,
    location: provider.location,
    status: provider.status,
    tier: provider.tier,
    rating: provider.rating,
    schedule: provider.schedule,
    isVerified: provider.isVerified,
    profileImageUrl: provider.profileImageUrl,
    portfolioImages: provider.portfolioImages,
    certifications: provider.certifications,
    completedJobs: provider.completedJobs,
    responseTime: provider.responseTime,
    lastActive: provider.lastActive,
    createdAt: provider.createdAt,
    updatedAt: provider.updatedAt
  })
}

// Find available providers for a service type within a radius
ProviderSchema.statics.findAvailableForService = function(
  serviceType: ServiceType,
  latitude?: number,
  longitude?: number,
  maxDistance?: number
) {
  const query: any = {
    status: ProviderStatus.AVAILABLE,
    isVerified: true,
    'serviceCapabilities.serviceType': serviceType
  }

  let aggregationPipeline: any[] = [
    { $match: query }
  ]

  // Add geospatial filtering if location is provided
  if (latitude && longitude && maxDistance) {
    aggregationPipeline.push({
      $addFields: {
        distance: {
          $sqrt: {
            $add: [
              {
                $pow: [
                  { $multiply: [{ $subtract: ['$location.latitude', latitude] }, 111.32] }, // Convert degrees to km
                  2
                ]
              },
              {
                $pow: [
                  { 
                    $multiply: [
                      { $subtract: ['$location.longitude', longitude] },
                      { $multiply: [111.32, { $cos: { $multiply: [latitude, Math.PI / 180] } }] }
                    ]
                  },
                  2
                ]
              }
            ]
          }
        }
      }
    })
    
    aggregationPipeline.push({
      $match: {
        distance: { $lte: maxDistance }
      }
    })
  }

  // Sort by tier (elite first), then by rating, then by response time
  aggregationPipeline.push({
    $sort: {
      tier: 1, // ProviderTier enum order: basic=0, premium=1, elite=2 (reverse for elite first)
      'rating.averageRating': -1,
      responseTime: 1,
      lastActive: -1
    }
  })

  return this.aggregate(aggregationPipeline)
}

// Find online providers (active in the last 15 minutes)
ProviderSchema.statics.findOnlineProviders = function() {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
  return this.find({
    status: ProviderStatus.AVAILABLE,
    lastActive: { $gte: fifteenMinutesAgo }
  })
}

// Force recreation of the model to update enum values
let ProviderModel: mongoose.Model<IProvider>

try {
  // Try to delete the existing model to force recreation with updated schema
  if (mongoose.models.Provider) {
    delete mongoose.models.Provider
  }
  ProviderModel = mongoose.model<IProvider>('Provider', ProviderSchema)
} catch {
  ProviderModel = mongoose.models.Provider || mongoose.model<IProvider>('Provider', ProviderSchema)
}

export { ProviderModel }