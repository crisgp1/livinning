import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceProviderApplicationModel from '@/lib/infrastructure/database/models/ServiceProviderApplicationModel'
import ServiceModel from '@/lib/infrastructure/database/models/ServiceModel'

// PUT - Review application (approve/reject) - superadmin only
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
    const { action, reviewNotes } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Acción inválida' },
        { status: 400 }
      )
    }

    await connectDB()

    const application = await ServiceProviderApplicationModel.findById(params.id)

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Aplicación no encontrada' },
        { status: 404 }
      )
    }

    if (application.status !== 'pending' && application.status !== 'under_review') {
      return NextResponse.json(
        { success: false, error: 'Esta aplicación ya ha sido revisada' },
        { status: 400 }
      )
    }

    const updateData: any = {
      reviewedBy: userId,
      reviewNotes: reviewNotes || '',
      updatedAt: new Date()
    }

    if (action === 'approve') {
      // Check if service has reached max providers
      const service = await ServiceModel.findById(application.serviceId)
      if (!service) {
        return NextResponse.json(
          { success: false, error: 'Servicio no encontrado' },
          { status: 404 }
        )
      }

      if (service.currentProviders >= service.maxProviders) {
        return NextResponse.json(
          { success: false, error: 'El servicio ya alcanzó el máximo de proveedores' },
          { status: 400 }
        )
      }

      updateData.status = 'approved'
      updateData.approvedAt = new Date()

      // Increment current providers count
      await ServiceModel.findByIdAndUpdate(
        application.serviceId,
        { $inc: { currentProviders: 1 } }
      )

    } else {
      updateData.status = 'rejected'
      updateData.rejectedAt = new Date()
    }

    const updatedApplication = await ServiceProviderApplicationModel.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: action === 'approve'
        ? 'Aplicación aprobada exitosamente'
        : 'Aplicación rechazada'
    })

  } catch (error) {
    console.error('Error reviewing application:', error)
    return NextResponse.json(
      { success: false, error: 'Error al revisar aplicación' },
      { status: 500 }
    )
  }
}