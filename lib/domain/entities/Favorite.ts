import { v4 as uuidv4 } from 'uuid'

export class Favorite {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly propertyId: string,
    public readonly createdAt: Date = new Date()
  ) {
    if (!userId.trim()) throw new Error('User ID is required')
    if (!propertyId.trim()) throw new Error('Property ID is required')
  }

  static create(
    userId: string,
    propertyId: string
  ): Favorite {
    return new Favorite(
      uuidv4(),
      userId,
      propertyId
    )
  }

  belongsToUser(userId: string): boolean {
    return this.userId === userId
  }

  isForProperty(propertyId: string): boolean {
    return this.propertyId === propertyId
  }
}