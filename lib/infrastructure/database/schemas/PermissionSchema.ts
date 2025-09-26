import mongoose, { Schema } from 'mongoose';

export interface IPermission {
  _id?: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  scope: 'organization' | 'department' | 'personal' | 'system';
  isSystem: boolean;
  metadata: {
    createdBy: string;
    updatedBy?: string;
    organizationId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z_:]+$/,
    minlength: 3,
    maxlength: 100
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: [
      'user_management', 'role_management', 'department_management',
      'property_management', 'service_management', 'financial_management',
      'marketing_management', 'legal_management', 'operations_management',
      'customer_service', 'reporting', 'system_administration'
    ],
    lowercase: true
  },
  resource: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 50
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'read', 'update', 'delete', 'execute', 'manage', 'assign'],
    lowercase: true
  },
  scope: {
    type: String,
    required: true,
    enum: ['organization', 'department', 'personal', 'system'],
    default: 'department'
  },
  isSystem: {
    type: Boolean,
    required: true,
    default: false
  },
  metadata: {
    createdBy: {
      type: String,
      required: true
    },
    updatedBy: {
      type: String
    },
    organizationId: {
      type: String
    }
  }
}, {
  timestamps: true,
  collection: 'permissions',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
PermissionSchema.index({ name: 1 }, { unique: true });
PermissionSchema.index({ category: 1 });
PermissionSchema.index({ resource: 1, action: 1 });
PermissionSchema.index({ scope: 1 });
PermissionSchema.index({ isSystem: 1 });
PermissionSchema.index({ 'metadata.organizationId': 1 });

// Virtual for full permission identifier
PermissionSchema.virtual('fullName').get(function() {
  return `${this.resource}:${this.action}`;
});

export { PermissionSchema };
export default mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema);