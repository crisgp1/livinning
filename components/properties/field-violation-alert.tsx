// ============================================
// LIVINNING - Field Violation Alert Component
// ============================================

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle, Info } from 'lucide-react';
import { PropertyFieldViolation } from '@/types/database';
import { cn } from '@/lib/utils';

interface FieldViolationAlertProps {
  violations: PropertyFieldViolation[];
  fieldName: string;
  className?: string;
}

/**
 * Componente Field Violation Alert
 * Muestra alertas de violación para campos específicos
 */
export function FieldViolationAlert({
  violations,
  fieldName,
  className,
}: FieldViolationAlertProps) {
  // Filtrar violaciones para este campo específico
  const fieldViolations = violations.filter((v) => v.field === fieldName);

  if (fieldViolations.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {fieldViolations.map((violation, index) => {
        const severityConfig = {
          low: {
            icon: Info,
            className: 'border-blue-200 bg-blue-50 text-blue-900',
            badgeClassName: 'bg-blue-100 text-blue-700 border-blue-300',
          },
          medium: {
            icon: AlertTriangle,
            className: 'border-yellow-200 bg-yellow-50 text-yellow-900',
            badgeClassName: 'bg-yellow-100 text-yellow-700 border-yellow-300',
          },
          high: {
            icon: XCircle,
            className: 'border-red-200 bg-red-50 text-red-900',
            badgeClassName: 'bg-red-100 text-red-700 border-red-300',
          },
        };

        const config = severityConfig[violation.severity];
        const Icon = config.icon;

        return (
          <Alert key={index} className={config.className}>
            <Icon className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              Corrección Requerida
              <Badge variant="outline" className={config.badgeClassName}>
                {violation.severity === 'low'
                  ? 'Baja'
                  : violation.severity === 'medium'
                  ? 'Media'
                  : 'Alta'}
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-2 text-sm">
              {violation.message}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
