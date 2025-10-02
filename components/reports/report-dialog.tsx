// ============================================
// LIVINNING - Report Dialog Component
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { REPORT_REASONS } from '@/lib/utils/constants';
import { ReportType, ReportReason } from '@/types';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ReportType;
  propertyId?: string;
  agencyId?: string;
  title?: string; // Título de la propiedad o nombre de la agencia
}

/**
 * Diálogo para crear reportes
 * Principio de Responsabilidad Única: Solo maneja la creación de reportes
 */
export function ReportDialog({
  open,
  onOpenChange,
  type,
  propertyId,
  agencyId,
  title,
}: ReportDialogProps) {
  const { user, isLoaded } = useUser();
  const [reason, setReason] = useState<ReportReason>('fraudulent');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoggedIn = isLoaded && !!user;

  const handleSubmit = async () => {
    // Validaciones
    if (!description.trim()) {
      toast.error('Por favor describe el problema');
      return;
    }

    if (!isLoggedIn && (!reporterName.trim() || !reporterEmail.trim())) {
      toast.error('Por favor ingresa tu nombre y email');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          reason,
          description,
          propertyId,
          agencyId,
          reporterName: !isLoggedIn ? reporterName : undefined,
          reporterEmail: !isLoggedIn ? reporterEmail : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.data.message);
        onOpenChange(false);
        // Reset form
        setDescription('');
        setReason('fraudulent');
        setReporterName('');
        setReporterEmail('');
      } else {
        toast.error(data.error?.message || 'Error al enviar el reporte');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Error al enviar el reporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reportar {type === 'property' ? 'Propiedad' : 'Agencia'}</DialogTitle>
          <DialogDescription>
            {title && (
              <span className="font-medium text-foreground">
                {type === 'property' ? 'Propiedad: ' : 'Agencia: '}
                {title}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Alert informativo */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Los reportes son revisados por nuestro equipo. Proporciona la mayor cantidad de
              detalles posible.
            </AlertDescription>
          </Alert>

          {/* Razón del reporte */}
          <div className="space-y-2">
            <Label htmlFor="reason">Razón del reporte *</Label>
            <Select value={reason} onValueChange={(value) => setReason(value as ReportReason)}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Selecciona una razón" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(REPORT_REASONS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción del problema *</Label>
            <Textarea
              id="description"
              placeholder="Describe detalladamente el problema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo 10 caracteres ({description.length}/10)
            </p>
          </div>

          {/* Campos para usuarios no logueados */}
          {!isLoggedIn && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reporterName">Tu nombre *</Label>
                <Input
                  id="reporterName"
                  type="text"
                  placeholder="Nombre completo"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterEmail">Tu email *</Label>
                <Input
                  id="reporterEmail"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Te contactaremos si necesitamos más información
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || description.length < 10}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Reporte'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
