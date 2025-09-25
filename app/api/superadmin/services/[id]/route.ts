import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceModel, { ServiceFeature } from '@/lib/infrastructure/database/models/ServiceModel'

// GET - Get service by ID (superadmin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgRole } = await auth()

    if (!userId || orgRole !== 'org:admin') {
      return NextResponse.json(
        { success: false, error: 'Acceso no autorizado' },
        { status: 401 }
      )
    }

    await connectDB()

    const service = await ServiceModel.findById(params.id).lean()

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: service
    })

  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener servicio' },
      { status: 500 }
    )
  }
}

// PUT - Update service (superadmin)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgRole } = await auth()

    if (!userId || orgRole !== 'org:admin') {
      return NextResponse.json(
        { success: false, error: 'Acceso no autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      basePrice,
      currency,
      duration,
      features,
      isActive,
      requiresApproval,
      maxProviders
    } = body

    await connectDB()

    const existingService = await ServiceModel.findById(params.id)

    if (!existingService) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Update fields if provided
    const updateData: any = {}

    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description.trim()
    if (category !== undefined) {
      const validCategories = ['visual', 'legal', 'consulting', 'staging', 'documentation', 'marketing']
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { success: false, error: 'Categoría inválida' },
          { status: 400 }
        )
      }
      updateData.category = category
    }
    if (basePrice !== undefined) updateData.basePrice = Number(basePrice)
    if (currency !== undefined) updateData.currency = currency
    if (duration !== undefined) updateData.duration = duration.trim()
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)
    if (requiresApproval !== undefined) updateData.requiresApproval = Boolean(requiresApproval)
    if (maxProviders !== undefined) updateData.maxProviders = Number(maxProviders)

    if (features !== undefined) {
      const processedFeatures: ServiceFeature[] = features.map((feature: any) => ({
        id: feature.id || crypto.randomUUID(),
        title: feature.title,
        description: feature.description,
        included: feature.included !== false
      }))
      updateData.features = processedFeatures
    }

    updateData.updatedAt = new Date()

    const updatedService = await ServiceModel.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      data: updatedService,
      message: 'Servicio actualizado exitosamente'
    })

  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar servicio' },
      { status: 500 }
    )
  }
}

// DELETE - Delete service (superadmin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgRole } = await auth()

    if (!userId || orgRole !== 'org:admin') {
      return NextResponse.json(
        { success: false, error: 'Acceso no autorizado' },
        { status: 401 }
      )
    }

    await connectDB()

    const service = await ServiceModel.findById(params.id)

    if (!service) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    await ServiceModel.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar servicio' },
      { status: 500 }
    )
  }
}