import { Favorite } from '../../domain/entities/Favorite'
import { Property } from '../../domain/entities/Property'
import { FavoriteRepository } from '../../domain/repositories/FavoriteRepository'

export class FavoriteService {
  constructor(private favoriteRepository: FavoriteRepository) {}

  async addFavorite(userId: string, propertyId: string): Promise<Favorite> {
    // Check if favorite already exists
    const existingFavorite = await this.favoriteRepository.findByUserAndProperty(userId, propertyId)
    
    if (existingFavorite) {
      throw new Error('Property is already in favorites')
    }

    const favorite = Favorite.create(userId, propertyId)
    return await this.favoriteRepository.save(favorite)
  }

  async removeFavorite(userId: string, propertyId: string): Promise<void> {
    const favorite = await this.favoriteRepository.findByUserAndProperty(userId, propertyId)
    
    if (!favorite) {
      throw new Error('Favorite not found')
    }

    if (!favorite.belongsToUser(userId)) {
      throw new Error('You are not authorized to remove this favorite')
    }

    await this.favoriteRepository.deleteByUserAndProperty(userId, propertyId)
  }

  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    return await this.favoriteRepository.findByUserId(userId)
  }

  async getFavoritePropertiesByUser(userId: string): Promise<Property[]> {
    return await this.favoriteRepository.getFavoritePropertiesByUser(userId)
  }

  async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    const favorite = await this.favoriteRepository.findByUserAndProperty(userId, propertyId)
    return favorite !== null
  }

  async getFavoritesCount(userId: string): Promise<number> {
    return await this.favoriteRepository.count(userId)
  }

  async toggleFavorite(userId: string, propertyId: string): Promise<{ isFavorite: boolean }> {
    const existingFavorite = await this.favoriteRepository.findByUserAndProperty(userId, propertyId)
    
    if (existingFavorite) {
      await this.favoriteRepository.deleteByUserAndProperty(userId, propertyId)
      return { isFavorite: false }
    } else {
      await this.addFavorite(userId, propertyId)
      return { isFavorite: true }
    }
  }
}