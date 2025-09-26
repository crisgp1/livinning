import { Schema, Document } from 'mongoose'

export interface IServiceUpdate {
  id: string
  type: 'progress' | 'incident' | 'comment' | 'milestone' | 'completion'
  title: string
  description: string
  attachments?: string[]
  images?: string[]
  createdBy: string
  createdByName: string
  createdAt: Date
  status?: 'pending' | 'in_progress' | 'resolved' | 'escalated'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
}

export interface IServiceTracking extends Document {
  serviceOrderId: string
  providerId: string
  providerName: string
  providerEmail: string
  clientId: string
  clientName: string
  clientEmail: string
  
  serviceType: string
  serviceName: string
  propertyAddress: string
  
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'cancelled'
  phase: 'pre_service' | 'during_service' | 'post_service' | 'warranty'
  
  startDate?: Date
  estimatedCompletionDate?: Date
  actualCompletionDate?: Date
  
  progress: {
    percentage: number
    lastUpdated: Date
    milestones: {
      name: string
      description: string
      targetDate: Date
      completedDate?: Date
      status: 'pending' | 'in_progress' | 'completed' | 'skipped'
    }[]
  }
  
  updates: IServiceUpdate[]
  
  qualityMetrics: {
    clientSatisfaction?: number
    qualityScore?: number
    completionRate?: number
    onTimeDelivery?: boolean
    issuesResolved?: number
    totalIssues?: number
  }
  
  finalResults?: {
    summary: string
    deliverables: string[]
    recommendations: string[]
    warranty?: {
      startDate: Date
      endDate: Date
      terms: string
    }
    beforeImages?: string[]
    afterImages?: string[]
    documentation?: string[]
  }
  
  communications: {
    unreadByClient: number
    unreadByProvider: number
    lastMessageAt?: Date
  }
  
  permissions: {
    isInvitedProvider: boolean
    invitationId?: string
    invitedAt?: Date
    acceptedAt?: Date
  }
  
  metadata: {
    createdAt: Date
    updatedAt: Date
    lastActivityAt: Date
    viewedByClient?: Date
    viewedByProvider?: Date
  }
}

const ServiceUpdateSchema = new Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['progress', 'incident', 'comment', 'milestone', 'completion'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  attachments: [String],
  images: [String],
  createdBy: { type: String, required: true },
  createdByName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'resolved', 'escalated']
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical']
  },
  tags: [String]
}, { _id: false })

export const ServiceTrackingSchema = new Schema<IServiceTracking>({
  serviceOrderId: { type: String, required: true, index: true },
  providerId: { type: String, required: true, index: true },
  providerName: { type: String, required: true },
  providerEmail: { type: String, required: true },
  clientId: { type: String, required: true, index: true },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true },
  
  serviceType: { type: String, required: true },
  serviceName: { type: String, required: true },
  propertyAddress: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'paused', 'completed', 'cancelled'],
    default: 'not_started'
  },
  phase: { 
    type: String, 
    enum: ['pre_service', 'during_service', 'post_service', 'warranty'],
    default: 'pre_service'
  },
  
  startDate: Date,
  estimatedCompletionDate: Date,
  actualCompletionDate: Date,
  
  progress: {
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    lastUpdated: { type: Date, default: Date.now },
    milestones: [{
      name: String,
      description: String,
      targetDate: Date,
      completedDate: Date,
      status: { 
        type: String, 
        enum: ['pending', 'in_progress', 'completed', 'skipped'],
        default: 'pending'
      }
    }]
  },
  
  updates: [ServiceUpdateSchema],
  
  qualityMetrics: {
    clientSatisfaction: { type: Number, min: 1, max: 5 },
    qualityScore: { type: Number, min: 0, max: 100 },
    completionRate: { type: Number, min: 0, max: 100 },
    onTimeDelivery: Boolean,
    issuesResolved: { type: Number, default: 0 },
    totalIssues: { type: Number, default: 0 }
  },
  
  finalResults: {
    summary: String,
    deliverables: [String],
    recommendations: [String],
    warranty: {
      startDate: Date,
      endDate: Date,
      terms: String
    },
    beforeImages: [String],
    afterImages: [String],
    documentation: [String]
  },
  
  communications: {
    unreadByClient: { type: Number, default: 0 },
    unreadByProvider: { type: Number, default: 0 },
    lastMessageAt: Date
  },
  
  permissions: {
    isInvitedProvider: { type: Boolean, default: false },
    invitationId: String,
    invitedAt: Date,
    acceptedAt: Date
  },
  
  metadata: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    viewedByClient: Date,
    viewedByProvider: Date
  }
})

ServiceTrackingSchema.index({ 'metadata.createdAt': -1 })
ServiceTrackingSchema.index({ 'metadata.lastActivityAt': -1 })
ServiceTrackingSchema.index({ status: 1, phase: 1 })
ServiceTrackingSchema.index({ 'permissions.isInvitedProvider': 1, providerId: 1 })

ServiceTrackingSchema.pre('save', function(next) {
  this.metadata.updatedAt = new Date()
  this.metadata.lastActivityAt = new Date()
  next()
})