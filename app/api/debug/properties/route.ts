import { NextRequest, NextResponse } from 'next/server'
import { PropertyModel } from '@/lib/infrastructure/database/schemas/PropertySchema'
import connectDB from '@/lib/infrastructure/database/connection'
import mongoose from 'mongoose'

export async function GET(request: NextRequest) {
  try {
    // Conectar a MongoDB
    await connectDB()
    
    // Obtener parámetros de la query
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')
    const includeDeleted = searchParams.get('includeDeleted') === 'true'
    const showIndexes = searchParams.get('showIndexes') === 'true'
    const showRaw = searchParams.get('raw') === 'true'
    
    // Construir query
    const query: any = {}
    if (!includeDeleted) {
      query.status = { $ne: 'deleted' }
    }
    
    // Obtener propiedades con .lean() para datos raw
    console.log('Fetching properties with query:', query)
    const properties = await PropertyModel
      .find(query)
      .limit(limit)
      .skip(skip)
      .lean()
      .exec()
    
    // Contar total de documentos
    const totalCount = await PropertyModel.countDocuments(query)
    const totalInDB = await PropertyModel.countDocuments({})
    
    // Obtener información de índices si se solicita
    let indexes = null
    if (showIndexes) {
      try {
        indexes = await PropertyModel.collection.getIndexes()
      } catch (e) {
        console.log('Could not get indexes:', e)
      }
    }
    
    // Construir respuesta de debug
    const debugResponse = {
      success: true,
      debug: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: mongoose.connection.readyState === 1,
        connectionState: mongoose.connection.readyState,
        connectionStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        totalDocuments: totalInDB,
        filteredDocuments: totalCount,
        queryLimit: limit,
        querySkip: skip,
        actualResultsCount: properties.length
      },
      query: {
        filter: query,
        includeDeleted,
        showIndexes,
        showRaw
      },
      sampleStructure: properties.length > 0 ? {
        fields: Object.keys(properties[0]),
        nestedFields: {
          address: properties[0].address ? Object.keys(properties[0].address) : null,
          price: properties[0].price ? Object.keys(properties[0].price) : null,
          features: properties[0].features ? Object.keys(properties[0].features) : null
        },
        types: {
          _id: typeof properties[0]._id,
          title: typeof properties[0].title,
          price: properties[0].price ? {
            amount: typeof properties[0].price.amount,
            currency: typeof properties[0].price.currency
          } : null
        }
      } : null,
      indexes: indexes,
      properties: properties.map((prop: any, index: number) => ({
        index: index,
        _id: prop._id,
        title: prop.title,
        description: prop.description ? 
          (prop.description.length > 100 ? prop.description.substring(0, 100) + '...' : prop.description) 
          : null,
        price: prop.price,
        propertyType: prop.propertyType,
        status: prop.status,
        address: {
          ...prop.address,
          street: prop.address?.displayPrivacy ? '[PRIVATE]' : prop.address?.street
        },
        features: prop.features,
        imagesCount: prop.images ? prop.images.length : 0,
        firstImage: prop.images && prop.images.length > 0 ? prop.images[0] : null,
        ownerId: prop.ownerId,
        organizationId: prop.organizationId,
        createdAt: prop.createdAt,
        updatedAt: prop.updatedAt,
        __v: prop.__v
      })),
      rawData: showRaw ? properties : 'Use ?raw=true to see raw MongoDB data'
    }
    
    return NextResponse.json(debugResponse)
    
  } catch (error) {
    console.error('Debug API Error:', error)
    
    const errorResponse = {
      success: false,
      debug: true,
      timestamp: new Date().toISOString(),
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'UnknownError',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
        mongoConnectionState: mongoose.connection.readyState,
        mongoConnectionStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
        fullError: process.env.NODE_ENV === 'development' ? JSON.stringify(error, Object.getOwnPropertyNames(error)) : undefined
      }
    }
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}