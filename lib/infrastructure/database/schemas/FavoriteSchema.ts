import mongoose, { Schema, Document } from 'mongoose'

export interface FavoriteDocument extends Document {
  _id: string
  userId: string
  propertyId: string
  createdAt: Date
}

const FavoriteSchema = new Schema({
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  propertyId: { type: String, required: true },
}, {
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false
})

// Indexes for better query performance
FavoriteSchema.index({ userId: 1 })
FavoriteSchema.index({ propertyId: 1 })
FavoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true }) // Prevent duplicate favorites
FavoriteSchema.index({ createdAt: -1 })

export const FavoriteModel = mongoose.models.Favorite || mongoose.model<FavoriteDocument>('Favorite', FavoriteSchema)