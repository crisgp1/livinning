import mongoose, { Schema } from 'mongoose';

export interface ITaskAttachment {
  _id?: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ITaskComment {
  _id?: string;
  content: string;
  authorId: string;
  authorName: string;
  isInternal: boolean;
  attachments: ITaskAttachment[];
  createdAt: Date;
}

export interface ITaskAssignment {
  userId: string;
  userName: string;
  role: 'assignee' | 'reviewer' | 'watcher';
  assignedBy: string;
  assignedAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
}

export interface ITask {
  _id?: string;
  title: string;
  description: string;
  type: 'property_management' | 'service_request' | 'financial' | 'legal' | 'marketing' | 'operations' | 'customer_service' | 'internal';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  status: 'draft' | 'open' | 'in_progress' | 'pending_review' | 'completed' | 'cancelled' | 'blocked';
  departmentId: string;
  subdepartmentId?: string;
  assignments: ITaskAssignment[];
  createdBy: string;
  requestedBy?: string;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  relatedEntities: {
    entityType: 'property' | 'service_order' | 'organization' | 'user';
    entityId: string;
    relationship: string;
  }[];
  checklist: {
    _id?: string;
    item: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: Date;
  }[];
  comments: ITaskComment[];
  attachments: ITaskAttachment[];
  workflow: {
    currentStep: string;
    steps: {
      name: string;
      status: 'pending' | 'in_progress' | 'completed' | 'skipped';
      assignee?: string;
      dueDate?: Date;
      completedAt?: Date;
      notes?: string;
    }[];
    autoAdvance: boolean;
  };
  metrics: {
    timeToFirstResponse?: number;
    timeToCompletion?: number;
    reassignmentCount: number;
    escalationCount: number;
  };
  metadata: {
    organizationId?: string;
    customFields: Record<string, any>;
    integrationData: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TaskAttachmentSchema = new Schema<ITaskAttachment>({
  fileName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  originalName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  mimeType: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  uploadedBy: {
    type: String,
    required: true,
    trim: true
  },
  uploadedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  _id: true,
  timestamps: false
});

const TaskCommentSchema = new Schema<ITaskComment>({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  authorId: {
    type: String,
    required: true,
    trim: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  isInternal: {
    type: Boolean,
    default: false
  },
  attachments: [TaskAttachmentSchema]
}, {
  _id: true,
  timestamps: true
});

const TaskAssignmentSchema = new Schema<ITaskAssignment>({
  userId: {
    type: String,
    required: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['assignee', 'reviewer', 'watcher']
  },
  assignedBy: {
    type: String,
    required: true,
    trim: true
  },
  assignedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  acceptedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  _id: false,
  timestamps: false
});

const TaskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  type: {
    type: String,
    required: true,
    enum: ['property_management', 'service_request', 'financial', 'legal', 'marketing', 'operations', 'customer_service', 'internal']
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'open', 'in_progress', 'pending_review', 'completed', 'cancelled', 'blocked'],
    default: 'open'
  },
  departmentId: {
    type: String,
    required: true,
    trim: true
  },
  subdepartmentId: {
    type: String,
    trim: true
  },
  assignments: [TaskAssignmentSchema],
  createdBy: {
    type: String,
    required: true,
    trim: true
  },
  requestedBy: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  relatedEntities: [{
    entityType: {
      type: String,
      required: true,
      enum: ['property', 'service_order', 'organization', 'user']
    },
    entityId: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      trim: true
    }
  }],
  checklist: [{
    item: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedBy: {
      type: String,
      trim: true
    },
    completedAt: {
      type: Date
    }
  }],
  comments: [TaskCommentSchema],
  attachments: [TaskAttachmentSchema],
  workflow: {
    currentStep: {
      type: String,
      required: true,
      trim: true
    },
    steps: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      status: {
        type: String,
        required: true,
        enum: ['pending', 'in_progress', 'completed', 'skipped'],
        default: 'pending'
      },
      assignee: {
        type: String,
        trim: true
      },
      dueDate: {
        type: Date
      },
      completedAt: {
        type: Date
      },
      notes: {
        type: String,
        trim: true,
        maxlength: 1000
      }
    }],
    autoAdvance: {
      type: Boolean,
      default: false
    }
  },
  metrics: {
    timeToFirstResponse: {
      type: Number,
      min: 0
    },
    timeToCompletion: {
      type: Number,
      min: 0
    },
    reassignmentCount: {
      type: Number,
      default: 0,
      min: 0
    },
    escalationCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  metadata: {
    organizationId: {
      type: String,
      trim: true
    },
    customFields: {
      type: Schema.Types.Mixed,
      default: {}
    },
    integrationData: {
      type: Schema.Types.Mixed,
      default: {}
    }
  }
}, {
  timestamps: true,
  collection: 'tasks',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
TaskSchema.index({ departmentId: 1, status: 1 });
TaskSchema.index({ 'assignments.userId': 1, status: 1 });
TaskSchema.index({ priority: 1, dueDate: 1 });
TaskSchema.index({ type: 1, createdAt: -1 });
TaskSchema.index({ tags: 1 });
TaskSchema.index({ 'metadata.organizationId': 1 });
TaskSchema.index({ createdAt: -1 });

// Text index for search
TaskSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text'
});

// Virtuals
TaskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && new Date() > this.dueDate && !['completed', 'cancelled'].includes(this.status);
});

TaskSchema.virtual('assigneeCount').get(function() {
  return this.assignments.filter(a => a.role === 'assignee').length;
});

TaskSchema.virtual('completionPercentage').get(function() {
  if (this.checklist.length === 0) return 0;
  const completed = this.checklist.filter(item => item.completed).length;
  return Math.round((completed / this.checklist.length) * 100);
});

// Methods
TaskSchema.methods.assignUser = function(userId: string, userName: string, role: 'assignee' | 'reviewer' | 'watcher', assignedBy: string): void {
  // Remove existing assignment if it exists
  this.assignments = this.assignments.filter(a => a.userId !== userId);

  // Add new assignment
  this.assignments.push({
    userId,
    userName,
    role,
    assignedBy,
    assignedAt: new Date()
  });
};

TaskSchema.methods.addComment = function(content: string, authorId: string, authorName: string, isInternal = false): void {
  this.comments.push({
    content,
    authorId,
    authorName,
    isInternal,
    attachments: [],
    createdAt: new Date()
  });
};

TaskSchema.methods.updateStatus = function(newStatus: ITask['status'], userId: string): void {
  const previousStatus = this.status;
  this.status = newStatus;

  // Update workflow step if needed
  const currentStepIndex = this.workflow.steps.findIndex(s => s.name === this.workflow.currentStep);
  if (currentStepIndex >= 0) {
    this.workflow.steps[currentStepIndex].status = newStatus === 'completed' ? 'completed' : 'in_progress';
    if (newStatus === 'completed') {
      this.workflow.steps[currentStepIndex].completedAt = new Date();
    }
  }

  // Update assignments completion
  if (newStatus === 'completed') {
    this.assignments.forEach(assignment => {
      if (assignment.role === 'assignee' && assignment.userId === userId) {
        assignment.completedAt = new Date();
      }
    });
  }

  // Add status change comment
  this.addComment(`Status changed from ${previousStatus} to ${newStatus}`, userId, 'System', true);
};

export { TaskSchema, TaskAttachmentSchema, TaskCommentSchema, TaskAssignmentSchema };
export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);