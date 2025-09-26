import mongoose, { Schema } from 'mongoose';

export interface IUserRoleAssignment {
  _id?: string;
  userId: string;
  clerkUserId: string;
  roleId: string;
  departmentId?: string;
  subdepartmentId?: string;
  assignedBy: string;
  isActive: boolean;
  effectiveFrom: Date;
  effectiveUntil?: Date;
  scope: 'organization' | 'department' | 'subdepartment' | 'personal';
  permissions: string[];
  restrictions: string[];
  metadata: {
    assignmentReason: string;
    organizationId?: string;
    territoryId?: string;
    budgetLimit?: number;
    customAttributes: Record<string, any>;
  };
  auditLog: {
    action: 'assigned' | 'updated' | 'suspended' | 'revoked';
    performedBy: string;
    timestamp: Date;
    reason?: string;
    previousValues?: Record<string, any>;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema({
  action: {
    type: String,
    required: true,
    enum: ['assigned', 'updated', 'suspended', 'revoked']
  },
  performedBy: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  reason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  previousValues: {
    type: Schema.Types.Mixed
  }
}, {
  _id: false
});

const UserRoleAssignmentSchema = new Schema<IUserRoleAssignment>({
  userId: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  clerkUserId: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  roleId: {
    type: String,
    required: true,
    trim: true
  },
  departmentId: {
    type: String,
    trim: true
  },
  subdepartmentId: {
    type: String,
    trim: true
  },
  assignedBy: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  effectiveFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  effectiveUntil: {
    type: Date,
    validate: {
      validator: function(this: IUserRoleAssignment, value: Date) {
        return !value || value > this.effectiveFrom;
      },
      message: 'Effective until date must be after effective from date'
    }
  },
  scope: {
    type: String,
    required: true,
    enum: ['organization', 'department', 'subdepartment', 'personal'],
    default: 'department'
  },
  permissions: [{
    type: String,
    required: true,
    trim: true
  }],
  restrictions: [{
    type: String,
    trim: true
  }],
  metadata: {
    assignmentReason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    organizationId: {
      type: String,
      trim: true
    },
    territoryId: {
      type: String,
      trim: true
    },
    budgetLimit: {
      type: Number,
      min: 0
    },
    customAttributes: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  auditLog: [AuditLogSchema]
}, {
  timestamps: true,
  collection: 'user_role_assignments',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
UserRoleAssignmentSchema.index({ userId: 1, roleId: 1 });
UserRoleAssignmentSchema.index({ clerkUserId: 1 });
UserRoleAssignmentSchema.index({ departmentId: 1, isActive: 1 });
UserRoleAssignmentSchema.index({ effectiveFrom: 1, effectiveUntil: 1 });
UserRoleAssignmentSchema.index({ isActive: 1, effectiveFrom: 1, effectiveUntil: 1 });
UserRoleAssignmentSchema.index({ 'metadata.organizationId': 1 });

// Virtual for checking if assignment is currently effective
UserRoleAssignmentSchema.virtual('isCurrentlyEffective').get(function() {
  const now = new Date();
  const isWithinTimeframe = now >= this.effectiveFrom && (!this.effectiveUntil || now <= this.effectiveUntil);
  return this.isActive && isWithinTimeframe;
});

// Methods
UserRoleAssignmentSchema.methods.addAuditEntry = function(
  action: 'assigned' | 'updated' | 'suspended' | 'revoked',
  performedBy: string,
  reason?: string,
  previousValues?: Record<string, any>
): void {
  this.auditLog.push({
    action,
    performedBy,
    timestamp: new Date(),
    reason,
    previousValues
  });
};

UserRoleAssignmentSchema.methods.suspend = function(performedBy: string, reason: string): void {
  this.isActive = false;
  this.addAuditEntry('suspended', performedBy, reason);
};

UserRoleAssignmentSchema.methods.revoke = function(performedBy: string, reason: string): void {
  this.isActive = false;
  this.effectiveUntil = new Date();
  this.addAuditEntry('revoked', performedBy, reason);
};

UserRoleAssignmentSchema.methods.hasPermission = function(permission: string): boolean {
  return this.permissions.includes(permission);
};

// Pre-save middleware
UserRoleAssignmentSchema.pre('save', function(next) {
  if (this.isNew) {
    this.addAuditEntry('assigned', this.assignedBy, this.metadata.assignmentReason);
  }
  next();
});

export { UserRoleAssignmentSchema };
export default mongoose.models.UserRoleAssignment || mongoose.model<IUserRoleAssignment>('UserRoleAssignment', UserRoleAssignmentSchema);