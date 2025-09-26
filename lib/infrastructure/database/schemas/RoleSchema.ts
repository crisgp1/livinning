import mongoose, { Schema } from 'mongoose';

export interface IRole {
  _id?: string;
  name: string;
  displayName: string;
  description: string;
  department: string;
  level: 'system' | 'department' | 'custom';
  hierarchy: number;
  isActive: boolean;
  permissions: string[];
  metadata: {
    createdBy: string;
    updatedBy?: string;
    parentRole?: string;
    organizationId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z_]+$/,
    minlength: 2,
    maxlength: 50
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  department: {
    type: String,
    required: true,
    enum: ['finance', 'sales', 'marketing', 'legal', 'operations', 'customer_service', 'superadmin', 'helpdesk'],
    lowercase: true
  },
  level: {
    type: String,
    required: true,
    enum: ['system', 'department', 'custom'],
    default: 'custom'
  },
  hierarchy: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 50
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  permissions: [{
    type: String,
    required: true,
    trim: true
  }],
  metadata: {
    createdBy: {
      type: String,
      required: true
    },
    updatedBy: {
      type: String
    },
    parentRole: {
      type: String
    },
    organizationId: {
      type: String
    }
  }
}, {
  timestamps: true,
  collection: 'roles',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
RoleSchema.index({ name: 1 }, { unique: true });
RoleSchema.index({ department: 1 });
RoleSchema.index({ hierarchy: 1 });
RoleSchema.index({ isActive: 1 });
RoleSchema.index({ 'metadata.organizationId': 1 });

// Virtual for permission count
RoleSchema.virtual('permissionCount').get(function() {
  return this.permissions.length;
});

// Methods
RoleSchema.methods.hasPermission = function(permission: string): boolean {
  return this.permissions.includes(permission);
};

RoleSchema.methods.addPermission = function(permission: string): void {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
};

RoleSchema.methods.removePermission = function(permission: string): void {
  this.permissions = this.permissions.filter((p: string) => p !== permission);
};

export { RoleSchema };
export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);