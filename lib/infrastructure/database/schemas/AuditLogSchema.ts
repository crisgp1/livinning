import mongoose, { Schema } from 'mongoose';

export interface IAuditLog {
  _id?: string;
  eventType: 'user_action' | 'system_action' | 'security_event' | 'data_change' | 'permission_change' | 'role_change';
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userName: string;
  userRole?: string;
  departmentId?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'error';
  details: {
    description: string;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
    affectedUsers?: string[];
    errorMessage?: string;
    stackTrace?: string;
  };
  metadata: {
    organizationId?: string;
    requestId?: string;
    apiEndpoint?: string;
    requestMethod?: string;
    responseTime?: number;
    customAttributes: Record<string, any>;
  };
  tags: string[];
  isRetention: boolean;
  retentionUntil?: Date;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  eventType: {
    type: String,
    required: true,
    enum: ['user_action', 'system_action', 'security_event', 'data_change', 'permission_change', 'role_change'],
    index: true
  },
  action: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  resource: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  resourceId: {
    type: String,
    trim: true,
    maxlength: 100,
    index: true
  },
  userId: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true
  },
  userName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  userRole: {
    type: String,
    trim: true,
    maxlength: 100,
    index: true
  },
  departmentId: {
    type: String,
    trim: true,
    maxlength: 100,
    index: true
  },
  sessionId: {
    type: String,
    trim: true,
    maxlength: 200
  },
  ipAddress: {
    type: String,
    required: true,
    trim: true,
    maxlength: 45, // IPv6 maximum length
    index: true
  },
  userAgent: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['success', 'failure', 'error'],
    index: true
  },
  details: {
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    previousValues: {
      type: Schema.Types.Mixed
    },
    newValues: {
      type: Schema.Types.Mixed
    },
    affectedUsers: [{
      type: String,
      trim: true
    }],
    errorMessage: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    stackTrace: {
      type: String,
      trim: true,
      maxlength: 5000
    }
  },
  metadata: {
    organizationId: {
      type: String,
      trim: true,
      maxlength: 100,
      index: true
    },
    requestId: {
      type: String,
      trim: true,
      maxlength: 100
    },
    apiEndpoint: {
      type: String,
      trim: true,
      maxlength: 200
    },
    requestMethod: {
      type: String,
      trim: true,
      maxlength: 10,
      uppercase: true
    },
    responseTime: {
      type: Number,
      min: 0
    },
    customAttributes: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 50
  }],
  isRetention: {
    type: Boolean,
    default: true
  },
  retentionUntil: {
    type: Date,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true,
  collection: 'audit_logs',
  capped: { size: 100000000, max: 1000000 } // 100MB cap, max 1M documents
});

// Compound indexes for efficient querying
AuditLogSchema.index({ eventType: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ severity: 1, status: 1, createdAt: -1 });
AuditLogSchema.index({ 'metadata.organizationId': 1, createdAt: -1 });
AuditLogSchema.index({ tags: 1 });
AuditLogSchema.index({ createdAt: -1 });

// Text index for searching descriptions
AuditLogSchema.index({
  'details.description': 'text',
  action: 'text',
  resource: 'text',
  userName: 'text'
});

// TTL index for automatic cleanup
AuditLogSchema.index({ retentionUntil: 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware to set retention date
AuditLogSchema.pre('save', function(next) {
  if (this.isNew && !this.retentionUntil) {
    // Default retention: 7 years for critical/high, 3 years for medium, 1 year for low
    let retentionYears: number;
    switch (this.severity) {
      case 'critical':
      case 'high':
        retentionYears = 7;
        break;
      case 'medium':
        retentionYears = 3;
        break;
      default:
        retentionYears = 1;
    }

    this.retentionUntil = new Date();
    this.retentionUntil.setFullYear(this.retentionUntil.getFullYear() + retentionYears);
  }
  next();
});

// Static methods for creating audit entries
AuditLogSchema.statics.createUserAction = function(
  action: string,
  resource: string,
  userId: string,
  userName: string,
  ipAddress: string,
  userAgent: string,
  details: IAuditLog['details'],
  options?: Partial<IAuditLog>
) {
  return new this({
    eventType: 'user_action',
    action,
    resource,
    userId,
    userName,
    ipAddress,
    userAgent,
    severity: 'low',
    status: 'success',
    details,
    tags: [],
    ...options
  });
};

AuditLogSchema.statics.createSecurityEvent = function(
  action: string,
  userId: string,
  userName: string,
  ipAddress: string,
  userAgent: string,
  details: IAuditLog['details'],
  severity: IAuditLog['severity'] = 'high'
) {
  return new this({
    eventType: 'security_event',
    action,
    resource: 'security',
    userId,
    userName,
    ipAddress,
    userAgent,
    severity,
    status: details.errorMessage ? 'error' : 'success',
    details,
    tags: ['security']
  });
};

AuditLogSchema.statics.createDataChange = function(
  resource: string,
  resourceId: string,
  userId: string,
  userName: string,
  ipAddress: string,
  userAgent: string,
  previousValues: any,
  newValues: any,
  description: string
) {
  return new this({
    eventType: 'data_change',
    action: 'update',
    resource,
    resourceId,
    userId,
    userName,
    ipAddress,
    userAgent,
    severity: 'medium',
    status: 'success',
    details: {
      description,
      previousValues,
      newValues
    },
    tags: ['data_change']
  });
};

export { AuditLogSchema };
export default mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);