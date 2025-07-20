import { v4 as uuidv4 } from 'uuid'

export enum ServiceOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ServiceType {
  PHOTOGRAPHY = 'photography',
  LEGAL = 'legal',
  VIRTUAL_TOUR = 'virtual-tour',
  HOME_STAGING = 'home-staging',
  MARKET_ANALYSIS = 'market-analysis',
  DOCUMENTATION = 'documentation'
}

export class ServiceOrder {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly serviceType: ServiceType,
    public readonly serviceName: string,
    public readonly serviceDescription: string,
    public readonly propertyAddress: string,
    public readonly contactPhone: string,
    public readonly preferredDate: string,
    public readonly specialRequests: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: ServiceOrderStatus = ServiceOrderStatus.PENDING,
    public readonly stripePaymentIntentId?: string,
    public readonly stripeSessionId?: string,
    public readonly customerEmail?: string,
    public readonly estimatedDelivery?: string,
    public readonly actualDelivery?: Date,
    public readonly assignedTo?: string,
    public readonly deliverables: string[] = [],
    public readonly notes: string[] = [],
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    if (!userId.trim()) throw new Error('User ID is required')
    if (!serviceType) throw new Error('Service type is required')
    if (!serviceName.trim()) throw new Error('Service name is required')
    if (!propertyAddress.trim()) throw new Error('Property address is required')
    if (!contactPhone.trim()) throw new Error('Contact phone is required')
    if (amount <= 0) throw new Error('Amount must be greater than 0')
  }

  static create(
    userId: string,
    serviceType: ServiceType,
    serviceName: string,
    serviceDescription: string,
    propertyAddress: string,
    contactPhone: string,
    preferredDate: string,
    specialRequests: string,
    amount: number,
    currency: string,
    customerEmail?: string,
    stripePaymentIntentId?: string,
    stripeSessionId?: string
  ): ServiceOrder {
    return new ServiceOrder(
      uuidv4(),
      userId,
      serviceType,
      serviceName,
      serviceDescription,
      propertyAddress,
      contactPhone,
      preferredDate,
      specialRequests,
      amount,
      currency,
      ServiceOrderStatus.PENDING,
      stripePaymentIntentId,
      stripeSessionId,
      customerEmail
    )
  }

  confirm(): ServiceOrder {
    return new ServiceOrder(
      this.id,
      this.userId,
      this.serviceType,
      this.serviceName,
      this.serviceDescription,
      this.propertyAddress,
      this.contactPhone,
      this.preferredDate,
      this.specialRequests,
      this.amount,
      this.currency,
      ServiceOrderStatus.CONFIRMED,
      this.stripePaymentIntentId,
      this.stripeSessionId,
      this.customerEmail,
      this.estimatedDelivery,
      this.actualDelivery,
      this.assignedTo,
      this.deliverables,
      this.notes,
      this.createdAt,
      new Date()
    )
  }

  startProgress(): ServiceOrder {
    return new ServiceOrder(
      this.id,
      this.userId,
      this.serviceType,
      this.serviceName,
      this.serviceDescription,
      this.propertyAddress,
      this.contactPhone,
      this.preferredDate,
      this.specialRequests,
      this.amount,
      this.currency,
      ServiceOrderStatus.IN_PROGRESS,
      this.stripePaymentIntentId,
      this.stripeSessionId,
      this.customerEmail,
      this.estimatedDelivery,
      this.actualDelivery,
      this.assignedTo,
      this.deliverables,
      this.notes,
      this.createdAt,
      new Date()
    )
  }

  complete(deliverables: string[] = []): ServiceOrder {
    return new ServiceOrder(
      this.id,
      this.userId,
      this.serviceType,
      this.serviceName,
      this.serviceDescription,
      this.propertyAddress,
      this.contactPhone,
      this.preferredDate,
      this.specialRequests,
      this.amount,
      this.currency,
      ServiceOrderStatus.COMPLETED,
      this.stripePaymentIntentId,
      this.stripeSessionId,
      this.customerEmail,
      this.estimatedDelivery,
      new Date(),
      this.assignedTo,
      [...this.deliverables, ...deliverables],
      this.notes,
      this.createdAt,
      new Date()
    )
  }

  cancel(): ServiceOrder {
    return new ServiceOrder(
      this.id,
      this.userId,
      this.serviceType,
      this.serviceName,
      this.serviceDescription,
      this.propertyAddress,
      this.contactPhone,
      this.preferredDate,
      this.specialRequests,
      this.amount,
      this.currency,
      ServiceOrderStatus.CANCELLED,
      this.stripePaymentIntentId,
      this.stripeSessionId,
      this.customerEmail,
      this.estimatedDelivery,
      this.actualDelivery,
      this.assignedTo,
      this.deliverables,
      this.notes,
      this.createdAt,
      new Date()
    )
  }

  addNote(note: string): ServiceOrder {
    return new ServiceOrder(
      this.id,
      this.userId,
      this.serviceType,
      this.serviceName,
      this.serviceDescription,
      this.propertyAddress,
      this.contactPhone,
      this.preferredDate,
      this.specialRequests,
      this.amount,
      this.currency,
      this.status,
      this.stripePaymentIntentId,
      this.stripeSessionId,
      this.customerEmail,
      this.estimatedDelivery,
      this.actualDelivery,
      this.assignedTo,
      this.deliverables,
      [...this.notes, note],
      this.createdAt,
      new Date()
    )
  }

  assignTo(assignedTo: string, estimatedDelivery?: string): ServiceOrder {
    return new ServiceOrder(
      this.id,
      this.userId,
      this.serviceType,
      this.serviceName,
      this.serviceDescription,
      this.propertyAddress,
      this.contactPhone,
      this.preferredDate,
      this.specialRequests,
      this.amount,
      this.currency,
      this.status,
      this.stripePaymentIntentId,
      this.stripeSessionId,
      this.customerEmail,
      estimatedDelivery || this.estimatedDelivery,
      this.actualDelivery,
      assignedTo,
      this.deliverables,
      this.notes,
      this.createdAt,
      new Date()
    )
  }

  isActive(): boolean {
    return [ServiceOrderStatus.PENDING, ServiceOrderStatus.CONFIRMED, ServiceOrderStatus.IN_PROGRESS].includes(this.status)
  }

  isCompleted(): boolean {
    return this.status === ServiceOrderStatus.COMPLETED
  }

  isCancelled(): boolean {
    return this.status === ServiceOrderStatus.CANCELLED
  }

  getStatusColor(): string {
    switch (this.status) {
      case ServiceOrderStatus.PENDING:
        return 'yellow'
      case ServiceOrderStatus.CONFIRMED:
        return 'blue'
      case ServiceOrderStatus.IN_PROGRESS:
        return 'orange'
      case ServiceOrderStatus.COMPLETED:
        return 'green'
      case ServiceOrderStatus.CANCELLED:
        return 'red'
      default:
        return 'gray'
    }
  }

  getStatusText(): string {
    switch (this.status) {
      case ServiceOrderStatus.PENDING:
        return 'Pendiente'
      case ServiceOrderStatus.CONFIRMED:
        return 'Confirmado'
      case ServiceOrderStatus.IN_PROGRESS:
        return 'En Progreso'
      case ServiceOrderStatus.COMPLETED:
        return 'Completado'
      case ServiceOrderStatus.CANCELLED:
        return 'Cancelado'
      default:
        return 'Desconocido'
    }
  }
}