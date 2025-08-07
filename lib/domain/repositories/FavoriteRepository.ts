import { Favorite } from '../entities/Favorite'
import { Property } from '../entities/Property'

export interface FavoriteRepository {
  save(favorite: Favorite): Promise<Favorite>
  findById(id: string): Promise<Favorite | null>
  findByUserId(userId: string): Promise<Favorite[]>
  findByUserAndProperty(userId: string, propertyId: string): Promise<Favorite | null>
  getFavoritePropertiesByUser(userId: string): Promise<Property[]>
  delete(id: string): Promise<void>
  deleteByUserAndProperty(userId: string, propertyId: string): Promise<void>
  count(userId: string): Promise<number>
}