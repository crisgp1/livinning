import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import { ServiceTrackingModel } from '@/lib/infrastructure/database/models/ServiceTrackingModel'
import { v4 as uuidv4 } from 'uuid'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    await connectDB()

    const resolvedParams = await params
    const tracking = await ServiceTrackingModel.findById(resolvedParams.trackingId)
    if (!tracking) {
      return NextResponse.json(
        { error: 'Registro de seguimiento no encontrado' },
        { status: 404 }
      )
    }

    if (tracking.providerId !== userId && tracking.clientId !== userId) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver este seguimiento' },
        { status: 403 }
      )
    }

    const isProvider = tracking.providerId === userId
    if (isProvider) {
      tracking.metadata.viewedByProvider = new Date()
      tracking.communications.unreadByProvider = 0
    } else {
      tracking.metadata.viewedByClient = new Date()
      tracking.communications.unreadByClient = 0
    }
    await tracking.save()

    return NextResponse.json({
      success: true,
      data: tracking
    })
  } catch (error) {
    console.error('Error fetching tracking details:', error)
    return NextResponse.json(
      { error: 'Error al obtener los detalles del seguimiento' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { action, data } = body

    await connectDB()

    const resolvedParams = await params
    const tracking = await ServiceTrackingModel.findById(resolvedParams.trackingId)
    if (!tracking) {
      return NextResponse.json(
        { error: 'Registro de seguimiento no encontrado' },
        { status: 404 }
      )
    }

    const isProvider = tracking.providerId === userId
    const isClient = tracking.clientId === userId

    if (!isProvider && !isClient) {
      return NextResponse.json(
        { error: 'No tienes permisos para actualizar este seguimiento' },
        { status: 403 }
      )
    }

    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Usuario'

    switch (action) {
      case 'ADD_UPDATE':
        if (!isProvider) {
          return NextResponse.json(
            { error: 'Solo los proveedores pueden agregar actualizaciones' },
            { status: 403 }
          )
        }

        const newUpdate = {
          id: uuidv4(),
          type: data.type || 'comment',
          title: data.title,
          description: data.description,
          attachments: data.attachments || [],
          images: data.images || [],
          createdBy: userId,
          createdByName: userName,
          createdAt: new Date(),
          status: data.status,
          priority: data.priority,
          tags: data.tags || []
        }

        tracking.updates.push(newUpdate)
        tracking.communications.unreadByClient += 1
        tracking.metadata.lastActivityAt = new Date()

        if (data.type === 'progress' && data.progressPercentage !== undefined) {
          tracking.progress.percentage = Math.min(100, Math.max(0, data.progressPercentage))
          tracking.progress.lastUpdated = new Date()
        }

        if (data.type === 'incident') {
          tracking.qualityMetrics.totalIssues = (tracking.qualityMetrics.totalIssues || 0) + 1
        }

        break

      case 'UPDATE_STATUS':
        if (!isProvider) {
          return NextResponse.json(
            { error: 'Solo los proveedores pueden actualizar el estado' },
            { status: 403 }
          )
        }

        tracking.status = data.status
        if (data.phase) {
          tracking.phase = data.phase
        }

        if (data.status === 'in_progress' && !tracking.startDate) {
          tracking.startDate = new Date()
        }

        if (data.status === 'completed') {
          tracking.actualCompletionDate = new Date()
          tracking.phase = 'post_service'
          tracking.progress.percentage = 100
        }

        tracking.updates.push({
          id: uuidv4(),
          type: 'milestone',
          title: 'Cambio de estado',
          description: `Estado actualizado a: ${data.status}`,
          createdBy: userId,
          createdByName: userName,
          createdAt: new Date()
        })

        break

      case 'ADD_COMMENT':
        const comment = {
          id: uuidv4(),
          type: 'comment' as const,
          title: 'Comentario',
          description: data.comment,
          createdBy: userId,
          createdByName: userName,
          createdAt: new Date()
        }

        tracking.updates.push(comment)
        
        if (isProvider) {
          tracking.communications.unreadByClient += 1
        } else {
          tracking.communications.unreadByProvider += 1
        }
        
        tracking.communications.lastMessageAt = new Date()
        tracking.metadata.lastActivityAt = new Date()

        break

      case 'UPDATE_MILESTONE':
        if (!isProvider) {
          return NextResponse.json(
            { error: 'Solo los proveedores pueden actualizar hitos' },
            { status: 403 }
          )
        }

        const milestoneIndex = tracking.progress.milestones.findIndex(
          m => m.name === data.milestoneName
        )

        if (milestoneIndex === -1) {
          tracking.progress.milestones.push({
            name: data.milestoneName,
            description: data.description || '',
            targetDate: data.targetDate ? new Date(data.targetDate) : new Date(),
            completedDate: data.completed ? new Date() : undefined,
            status: data.completed ? 'completed' : 'in_progress'
          })
        } else {
          const milestone = tracking.progress.milestones[milestoneIndex]
          milestone.status = data.status || milestone.status
          if (data.completed) {
            milestone.completedDate = new Date()
            milestone.status = 'completed'
          }
        }

        const completedMilestones = tracking.progress.milestones.filter(
          m => m.status === 'completed'
        ).length
        const totalMilestones = tracking.progress.milestones.length
        
        if (totalMilestones > 0) {
          tracking.progress.percentage = Math.round(
            (completedMilestones / totalMilestones) * 100
          )
        }

        break

      case 'SET_FINAL_RESULTS':
        if (!isProvider) {
          return NextResponse.json(
            { error: 'Solo los proveedores pueden establecer resultados finales' },
            { status: 403 }
          )
        }

        tracking.finalResults = {
          summary: data.summary,
          deliverables: data.deliverables || [],
          recommendations: data.recommendations || [],
          warranty: data.warranty,
          beforeImages: data.beforeImages || [],
          afterImages: data.afterImages || [],
          documentation: data.documentation || []
        }

        tracking.status = 'completed'
        tracking.phase = 'post_service'
        tracking.actualCompletionDate = new Date()
        tracking.progress.percentage = 100

        tracking.updates.push({
          id: uuidv4(),
          type: 'completion',
          title: 'Servicio Completado',
          description: data.summary,
          createdBy: userId,
          createdByName: userName,
          createdAt: new Date()
        })

        break

      case 'RATE_SERVICE':
        if (!isClient) {
          return NextResponse.json(
            { error: 'Solo los clientes pueden calificar el servicio' },
            { status: 403 }
          )
        }

        tracking.qualityMetrics.clientSatisfaction = data.rating
        tracking.qualityMetrics.qualityScore = data.qualityScore || data.rating * 20

        break

      case 'RESOLVE_INCIDENT':
        if (!isProvider) {
          return NextResponse.json(
            { error: 'Solo los proveedores pueden resolver incidentes' },
            { status: 403 }
          )
        }

        const updateIndex = tracking.updates.findIndex(u => u.id === data.updateId)
        if (updateIndex !== -1 && tracking.updates[updateIndex].type === 'incident') {
          tracking.updates[updateIndex].status = 'resolved'
          tracking.qualityMetrics.issuesResolved = (tracking.qualityMetrics.issuesResolved || 0) + 1
        }

        break

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        )
    }

    await tracking.save()

    return NextResponse.json({
      success: true,
      data: tracking
    })
  } catch (error) {
    console.error('Error updating tracking:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el seguimiento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ trackingId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const user = await currentUser()
    const metadata = user?.publicMetadata as any
    const isAdmin = metadata?.role === 'admin' || metadata?.isSuperAdmin

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Solo los administradores pueden eliminar registros de seguimiento' },
        { status: 403 }
      )
    }

    await connectDB()

    const resolvedParams = await params
    const tracking = await ServiceTrackingModel.findByIdAndDelete(resolvedParams.trackingId)
    if (!tracking) {
      return NextResponse.json(
        { error: 'Registro de seguimiento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Registro de seguimiento eliminado exitosamente'
    })
  } catch (error) {
    console.error('Error deleting tracking:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el seguimiento' },
      { status: 500 }
    )
  }
}