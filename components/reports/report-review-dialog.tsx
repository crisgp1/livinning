// ============================================
// LIVINNING - Report Review Dialog Component
// ============================================

'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  AlertTriangle,
  Flag,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Report, ReportStatus } from '@/types';
import { REPORT_REASONS } from '@/lib/utils/constants';
import Link from 'next/link';

interface ReportReviewDialogProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewed: () => void;
}

/**
 * Diálogo para revisar reportes
 * Principio de Responsabilidad Única: Solo maneja la revisión de reportes
 */
export function ReportReviewDialog({
  report,
  open,
  onOpenChange,
  onReviewed,
}: ReportReviewDialogProps) {
  const { user } = useUser();
  const [newStatus, setNewStatus] = useState<ReportStatus>('reviewing');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [action, setAction] = useState<'none' | 'suspend_property' | 'suspend_user' | 'suspend_both'>('none');

  if (!report) return null;

  const handleSubmit = async () => {
    if (!reviewNotes.trim() && newStatus !== 'reviewing') {
      toast.error('Por favor agrega notas de revisión');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes,
          action,
          propertyId: report.propertyId,
          agencyId: report.agencyId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        let message = 'Reporte actualizado exitosamente';

        if (action === 'suspend_property') {
          message = 'Reporte actualizado y propiedad suspendida';
        } else if (action === 'suspend_user') {
          message = 'Reporte actualizado y usuario suspendido';
        } else if (action === 'suspend_both') {
          message = 'Reporte actualizado, propiedad y usuario suspendidos';
        }

        toast.success(message);
        onReviewed();
        onOpenChange(false);
        setReviewNotes('');
        setNewStatus('reviewing');
        setAction('none');
      } else {
        toast.error(data.error?.message || 'Error al actualizar el reporte');
      }
    } catch (error) {
      console.error('Error reviewing report:', error);
      toast.error('Error al actualizar el reporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusConfig: Record<ReportStatus, { label: string; icon: any; color: string }> = {
    pending: { label: 'Pendiente', icon: AlertTriangle, color: 'text-yellow-600' },
    reviewing: { label: 'En Revisión', icon: Eye, color: 'text-blue-600' },
    resolved: { label: 'Resuelto', icon: CheckCircle, color: 'text-green-600' },
    dismissed: { label: 'Descartado', icon: XCircle, color: 'text-gray-600' },
  };

  const CurrentStatusIcon = statusConfig[report.status]?.icon || Flag;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Revisar Reporte
          </DialogTitle>
          <DialogDescription>
            ID del reporte: {report.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Estado Actual */}
          <div className="flex items-center gap-2">
            <Label>Estado Actual:</Label>
            <Badge variant="outline" className="flex items-center gap-1">
              <CurrentStatusIcon className={`h-3 w-3 ${statusConfig[report.status]?.color}`} />
              {statusConfig[report.status]?.label}
            </Badge>
          </div>

          <Separator />

          {/* Información del Reporte */}
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Tipo de Reporte</Label>
              <p className="text-lg font-medium">
                {report.type === 'property' ? '🏠 Propiedad' : '🏢 Agencia'}
              </p>
            </div>

            <div>
              <Label className="text-muted-foreground">Elemento Reportado</Label>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium">
                  {report.type === 'property' ? report.propertyTitle : report.agencyName}
                </p>
                {report.type === 'property' && report.propertyId && (
                  <Link
                    href={`/propiedades/${report.propertyId}`}
                    target="_blank"
                    className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Ver propiedad <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Razón del Reporte</Label>
              <Badge variant="secondary" className="text-sm">
                {REPORT_REASONS[report.reason as keyof typeof REPORT_REASONS]}
              </Badge>
            </div>

            <div>
              <Label className="text-muted-foreground">Descripción del Problema</Label>
              <Alert>
                <AlertDescription className="whitespace-pre-wrap">
                  {report.description}
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <Separator />

          {/* Información del Reportante */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Reportado por</Label>
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p>
                <span className="font-medium">Nombre:</span> {report.reporterName || 'Anónimo'}
              </p>
              {report.reporterEmail && (
                <p>
                  <span className="font-medium">Email:</span> {report.reporterEmail}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Fecha: {new Date(report.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Revisión */}
          <div className="space-y-4">
            <h3 className="font-semibold">Acción de Revisión</h3>

            {/* Nuevo Estado */}
            <div className="space-y-2">
              <Label htmlFor="newStatus">Cambiar estado a *</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ReportStatus)}>
                <SelectTrigger id="newStatus">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reviewing">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-blue-600" />
                      En Revisión
                    </div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Resuelto
                    </div>
                  </SelectItem>
                  <SelectItem value="dismissed">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-gray-600" />
                      Descartado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Acciones de Moderación */}
            {(newStatus === 'resolved' || newStatus === 'dismissed') && (
              <div className="space-y-2">
                <Label htmlFor="action">Acción de Moderación</Label>
                <Select value={action} onValueChange={(value: any) => setAction(value)}>
                  <SelectTrigger id="action">
                    <SelectValue placeholder="Selecciona una acción" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin acción adicional</SelectItem>
                    {report.type === 'property' && report.propertyId && (
                      <>
                        <SelectItem value="suspend_property">
                          🚫 Suspender Publicación y Notificar
                        </SelectItem>
                        <SelectItem value="suspend_both">
                          🚫 Suspender Publicación y Usuario
                        </SelectItem>
                      </>
                    )}
                    {report.agencyId && (
                      <SelectItem value="suspend_user">
                        🚫 Suspender Usuario
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {action !== 'none' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Advertencia</AlertTitle>
                    <AlertDescription>
                      {action === 'suspend_property' && 'La propiedad será suspendida y desaparecerá del sitio público. El usuario será notificado.'}
                      {action === 'suspend_user' && 'El usuario será suspendido y no podrá acceder a la plataforma.'}
                      {action === 'suspend_both' && 'La propiedad será suspendida y el usuario será bloqueado completamente.'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Notas de Revisión */}
            <div className="space-y-2">
              <Label htmlFor="reviewNotes">Notas de Revisión *</Label>
              <Textarea
                id="reviewNotes"
                placeholder="Describe la acción tomada y la razón..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Estas notas son para uso interno del equipo
              </p>
            </div>

            {/* Mostrar revisión previa si existe */}
            {report.reviewedBy && (
              <Alert>
                <AlertTitle>Revisión Anterior</AlertTitle>
                <AlertDescription>
                  <p className="text-sm">
                    <span className="font-medium">Revisado por:</span> {report.reviewedByName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Fecha:</span>{' '}
                    {report.reviewedAt && new Date(report.reviewedAt).toLocaleDateString('es-ES')}
                  </p>
                  {report.reviewNotes && (
                    <p className="text-sm mt-2">
                      <span className="font-medium">Notas:</span> {report.reviewNotes}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reviewNotes.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Guardar Revisión
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
