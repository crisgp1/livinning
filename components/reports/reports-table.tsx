// ============================================
// LIVINNING - Reports Table Component
// ============================================

'use client';

import { Report } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { REPORT_REASONS } from '@/lib/utils/constants';
import { Eye, Flag, CheckCircle, XCircle, AlertTriangle, Ban, Bell, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface ReportsTableProps {
  reports: Report[];
  onReview: (report: Report) => void;
}

/**
 * Tabla de reportes
 * Principio de Responsabilidad Única: Solo muestra la tabla de reportes
 */
export function ReportsTable({ reports, onReview }: ReportsTableProps) {
  const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    pending: {
      label: 'Pendiente',
      className: 'bg-yellow-100 text-yellow-700',
      icon: AlertTriangle,
    },
    reviewing: {
      label: 'En Revisión',
      className: 'bg-blue-100 text-blue-700',
      icon: Eye,
    },
    resolved: {
      label: 'Resuelto',
      className: 'bg-green-100 text-green-700',
      icon: CheckCircle,
    },
    dismissed: {
      label: 'Descartado',
      className: 'bg-gray-100 text-gray-700',
      icon: XCircle,
    },
  };

  const actionConfig: Record<string, { label: string; className: string; icon: any }> = {
    none: {
      label: 'Sin acción',
      className: 'bg-gray-100 text-gray-600',
      icon: Flag,
    },
    suspend_property: {
      label: 'Publicación suspendida',
      className: 'bg-orange-100 text-orange-700',
      icon: ShieldAlert,
    },
    suspend_user: {
      label: 'Usuario suspendido',
      className: 'bg-red-100 text-red-700',
      icon: Ban,
    },
    suspend_both: {
      label: 'Ambos suspendidos',
      className: 'bg-red-100 text-red-700',
      icon: Ban,
    },
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Reportado</TableHead>
            <TableHead>Razón</TableHead>
            <TableHead>Reportante</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acción tomada</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => {
            const StatusIcon = statusConfig[report.status]?.icon || Flag;
            const action = report.moderationAction || 'none';
            const ActionIcon = actionConfig[action]?.icon || Flag;

            return (
              <TableRow key={report.id}>
                {/* Tipo */}
                <TableCell>
                  <Badge variant="outline">
                    {report.type === 'property' ? 'Propiedad' : 'Agencia'}
                  </Badge>
                </TableCell>

                {/* Reportado */}
                <TableCell>
                  <div>
                    <p className="font-medium truncate max-w-xs">
                      {report.type === 'property' ? report.propertyTitle : report.agencyName}
                    </p>
                    {report.type === 'property' && report.propertyId && (
                      <Link
                        href={`/propiedades/${report.propertyId}`}
                        className="text-xs text-blue-600 hover:underline"
                        target="_blank"
                      >
                        Ver propiedad
                      </Link>
                    )}
                  </div>
                </TableCell>

                {/* Razón */}
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">
                      {REPORT_REASONS[report.reason as keyof typeof REPORT_REASONS]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-xs">
                      {report.description}
                    </p>
                  </div>
                </TableCell>

                {/* Reportante */}
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium">{report.reporterName || 'Anónimo'}</p>
                    {report.reporterEmail && (
                      <p className="text-xs text-muted-foreground">{report.reporterEmail}</p>
                    )}
                  </div>
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusConfig[report.status]?.className || ''}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[report.status]?.label || report.status}
                  </Badge>
                </TableCell>

                {/* Acción tomada */}
                <TableCell>
                  <Badge
                    variant="outline"
                    className={actionConfig[action]?.className || ''}
                  >
                    <ActionIcon className="h-3 w-3 mr-1" />
                    {actionConfig[action]?.label}
                  </Badge>
                </TableCell>

                {/* Fecha */}
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(report.createdAt).toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onReview(report)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Revisar
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
