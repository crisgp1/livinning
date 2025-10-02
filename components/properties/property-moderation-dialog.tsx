// ============================================
// LIVINNING - Property Moderation Dialog
// ============================================

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Property } from '@/types';
import { PropertyFieldViolation } from '@/types/database';

interface PropertyModerationDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModerated: () => void;
}

const PROPERTY_FIELDS = [
  { value: 'title', label: 'Título' },
  { value: 'description', label: 'Descripción' },
  { value: 'price', label: 'Precio' },
  { value: 'address', label: 'Dirección' },
  { value: 'city', label: 'Ciudad' },
  { value: 'images', label: 'Imágenes' },
  { value: 'propertyType', label: 'Tipo de Propiedad' },
  { value: 'bedrooms', label: 'Recámaras' },
  { value: 'bathrooms', label: 'Baños' },
  { value: 'area', label: 'Área' },
  { value: 'other', label: 'Otro' },
];

/**
 * Componente Property Moderation Dialog
 * Permite a los administradores moderar propiedades
 */
export function PropertyModerationDialog({
  property,
  open,
  onOpenChange,
  onModerated,
}: PropertyModerationDialogProps) {
  const [action, setAction] = useState<'approve' | 'reject' | 'request_corrections' | null>(null);
  const [fieldViolations, setFieldViolations] = useState<PropertyFieldViolation[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const addViolation = () => {
    setFieldViolations([
      ...fieldViolations,
      { field: '', message: '', severity: 'medium' },
    ]);
  };

  const removeViolation = (index: number) => {
    setFieldViolations(fieldViolations.filter((_, i) => i !== index));
  };

  const updateViolation = (index: number, updates: Partial<PropertyFieldViolation>) => {
    setFieldViolations(
      fieldViolations.map((v, i) => (i === index ? { ...v, ...updates } : v))
    );
  };

  const handleModerate = async () => {
    if (!property || !action) return;

    // Validar que si es request_corrections o reject, haya al menos una violación o nota general
    if ((action === 'request_corrections' || action === 'reject') && fieldViolations.length === 0 && !generalNotes.trim()) {
      toast.error('Debes agregar al menos una violación o nota general');
      return;
    }

    // Validar que todas las violaciones tengan campo y mensaje
    const invalidViolations = fieldViolations.filter(v => !v.field || !v.message.trim());
    if (invalidViolations.length > 0) {
      toast.error('Todas las violaciones deben tener campo y mensaje');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`/api/admin/properties/${property.id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          fieldViolations: fieldViolations.length > 0 ? fieldViolations : undefined,
          generalNotes: generalNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          action === 'approve'
            ? 'Propiedad aprobada'
            : action === 'reject'
            ? 'Propiedad rechazada'
            : 'Correcciones solicitadas'
        );
        onOpenChange(false);
        onModerated();
        // Reset form
        setAction(null);
        setFieldViolations([]);
        setGeneralNotes('');
      } else {
        toast.error(data.error?.message || 'Error al moderar propiedad');
      }
    } catch (error) {
      console.error('Error moderating property:', error);
      toast.error('Error al moderar propiedad');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!property) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Moderar Propiedad</DialogTitle>
          <DialogDescription>
            {property.title} - {property.ownerName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6 py-4">
            {/* Property Info */}
            <div className="space-y-2">
              <h3 className="font-semibold">Información de la Propiedad</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Título:</span>
                  <p className="font-medium">{property.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Precio:</span>
                  <p className="font-medium">${property.price.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Ubicación:</span>
                  <p className="font-medium">{property.city}, {property.state}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <p className="font-medium">{property.propertyType}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Selection */}
            <div className="space-y-4">
              <Label>Acción de Moderación *</Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={action === 'approve' ? 'default' : 'outline'}
                  className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
                  onClick={() => setAction('approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar
                </Button>
                <Button
                  variant={action === 'request_corrections' ? 'default' : 'outline'}
                  className={action === 'request_corrections' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                  onClick={() => setAction('request_corrections')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Solicitar Correcciones
                </Button>
                <Button
                  variant={action === 'reject' ? 'default' : 'outline'}
                  className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
                  onClick={() => setAction('reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            </div>

            {/* Field Violations (only for request_corrections or reject) */}
            {(action === 'request_corrections' || action === 'reject') && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Violaciones por Campo</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addViolation}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Violación
                    </Button>
                  </div>

                  {fieldViolations.map((violation, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-3 bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Violación {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeViolation(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Campo *</Label>
                          <Select
                            value={violation.field}
                            onValueChange={(value) =>
                              updateViolation(index, { field: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar campo" />
                            </SelectTrigger>
                            <SelectContent>
                              {PROPERTY_FIELDS.map((field) => (
                                <SelectItem key={field.value} value={field.value}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Severidad *</Label>
                          <Select
                            value={violation.severity}
                            onValueChange={(value: any) =>
                              updateViolation(index, { severity: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">
                                <Badge variant="outline" className="bg-green-100 text-green-700">
                                  Baja
                                </Badge>
                              </SelectItem>
                              <SelectItem value="medium">
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
                                  Media
                                </Badge>
                              </SelectItem>
                              <SelectItem value="high">
                                <Badge variant="outline" className="bg-red-100 text-red-700">
                                  Alta
                                </Badge>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Mensaje *</Label>
                        <Textarea
                          value={violation.message}
                          onChange={(e) =>
                            updateViolation(index, { message: e.target.value })
                          }
                          placeholder="Describe el problema en este campo..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}

                  {fieldViolations.length === 0 && (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No hay violaciones agregadas. Click en "Agregar Violación" para comenzar.
                    </div>
                  )}
                </div>
              </>
            )}

            <Separator />

            {/* General Notes */}
            <div className="space-y-2">
              <Label>Notas Generales</Label>
              <Textarea
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                placeholder="Notas adicionales sobre la moderación..."
                rows={4}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleModerate}
            disabled={!action || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : (
              'Confirmar Moderación'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
