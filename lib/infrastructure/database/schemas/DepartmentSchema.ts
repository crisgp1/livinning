import mongoose, { Schema } from 'mongoose';

export interface ISubdepartment {
  _id?: string;
  name: string;
  displayName: string;
  description: string;
  manager?: string;
  isActive: boolean;
  permissions: string[];
  metadata: Record<string, any>;
}

export interface IDepartment {
  _id?: string;
  name: string;
  displayName: string;
  description: string;
  code: string;
  manager: string;
  isActive: boolean;
  subdepartments: ISubdepartment[];
  roles: string[];
  permissions: string[];
  budgetLimit?: number;
  settings: {
    autoAssignment: boolean;
    requireApproval: boolean;
    escalationRules: {
      timeLimit: number;
      escalateTo: string;
    }[];
  };
  metrics: {
    activeEmployees: number;
    completedTasks: number;
    pendingTasks: number;
    averageResponseTime: number;
  };
  metadata: {
    createdBy: string;
    updatedBy?: string;
    organizationId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SubdepartmentSchema = new Schema<ISubdepartment>({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 50
  },
  displayName: {
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
  manager: {
    type: String,
    trim: true
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
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  _id: true,
  timestamps: true
});

const DepartmentSchema = new Schema<IDepartment>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    enum: ['finance', 'sales', 'marketing', 'legal', 'operations', 'customer_service'],
    maxlength: 50
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: /^[A-Z]{2,5}$/,
    maxlength: 5
  },
  manager: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true
  },
  subdepartments: [SubdepartmentSchema],
  roles: [{
    type: String,
    trim: true
  }],
  permissions: [{
    type: String,
    required: true,
    trim: true
  }],
  budgetLimit: {
    type: Number,
    min: 0,
    default: null
  },
  settings: {
    autoAssignment: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: true
    },
    escalationRules: [{
      timeLimit: {
        type: Number,
        required: true,
        min: 1
      },
      escalateTo: {
        type: String,
        required: true,
        trim: true
      }
    }]
  },
  metrics: {
    activeEmployees: {
      type: Number,
      default: 0,
      min: 0
    },
    completedTasks: {
      type: Number,
      default: 0,
      min: 0
    },
    pendingTasks: {
      type: Number,
      default: 0,
      min: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0,
      min: 0
    }
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
  collection: 'departments',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
DepartmentSchema.index({ name: 1 }, { unique: true });
DepartmentSchema.index({ code: 1 }, { unique: true });
DepartmentSchema.index({ manager: 1 });
DepartmentSchema.index({ isActive: 1 });
DepartmentSchema.index({ 'metadata.organizationId': 1 });

// Virtuals
DepartmentSchema.virtual('totalEmployees').get(function() {
  return this.metrics.activeEmployees;
});

DepartmentSchema.virtual('taskCompletionRate').get(function() {
  const total = this.metrics.completedTasks + this.metrics.pendingTasks;
  return total > 0 ? (this.metrics.completedTasks / total) * 100 : 0;
});

// Methods
DepartmentSchema.methods.addSubdepartment = function(subdepartment: Omit<ISubdepartment, '_id'>): void {
  this.subdepartments.push(subdepartment);
};

DepartmentSchema.methods.removeSubdepartment = function(subdepartmentId: string): void {
  this.subdepartments = this.subdepartments.filter(sub => sub._id?.toString() !== subdepartmentId);
};

DepartmentSchema.methods.updateMetrics = function(metrics: Partial<IDepartment['metrics']>): void {
  this.metrics = { ...this.metrics, ...metrics };
};

export { DepartmentSchema, SubdepartmentSchema };
export default mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);