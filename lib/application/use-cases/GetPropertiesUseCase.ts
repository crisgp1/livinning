import { Property } from '../../domain/entities/Property'
import { PropertyRepository, PropertyFilters } from '../../domain/repositories/PropertyRepository'

export interface GetPropertiesRequest {
  filters?: PropertyFilters
  page?: number
  limit?: number
}

export interface GetPropertiesResponse {
  properties: Property[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class GetPropertiesUseCase {
  constructor(private propertyRepository: PropertyRepository) {}

  async execute(request: GetPropertiesRequest = {}): Promise<GetPropertiesResponse> {
    try {
      const { filters, page = 1, limit = 1000 } = request
      const offset = (page - 1) * limit

      const [properties, total] = await Promise.all([
        this.propertyRepository.findAll(filters, limit, offset),
        this.propertyRepository.count(filters)
      ])

      const totalPages = Math.ceil(total / limit)

      return {
        properties,
        total,
        page,
        limit,
        totalPages
      }
    } catch (error) {
      throw new Error(`Failed to get properties: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}