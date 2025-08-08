import mongoose from 'mongoose'
import { ServiceTrackingSchema, IServiceTracking } from '../schemas/ServiceTrackingSchema'

let ServiceTrackingModel: mongoose.Model<IServiceTracking>

try {
  ServiceTrackingModel = mongoose.model<IServiceTracking>('ServiceTracking')
} catch {
  ServiceTrackingModel = mongoose.model<IServiceTracking>('ServiceTracking', ServiceTrackingSchema)
}

export { ServiceTrackingModel }