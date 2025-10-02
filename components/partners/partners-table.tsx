// ============================================
// LIVINNING - Partners Table Component
// ============================================

'use client';

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
import { Eye } from 'lucide-react';
import { SERVICE_TYPES } from '@/lib/utils/constants';

interface Partner {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  servicesOffered: string[];
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalEarnings: number;
  pendingEarnings: number;
  isSuspended: boolean;
  createdAt?: number;
  suspensionReason?: string;
}

interface PartnersTableProps {
  partners: Partner[];
  onViewDetails: (partner: Partner) => void | Promise<void>;
}

export function PartnersTable({ partners, onViewDetails }: PartnersTableProps) {
  if (partners.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay partners registrados
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Partner</TableHead>
            <TableHead>Servicios Ofrecidos</TableHead>
            <TableHead>Órdenes Totales</TableHead>
            <TableHead>Completadas</TableHead>
            <TableHead>Ganancias</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partners.map((partner) => (
            <TableRow key={partner.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{partner.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {partner.companyName || partner.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {partner.servicesOffered.slice(0, 2).map((service, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {SERVICE_TYPES[service as keyof typeof SERVICE_TYPES] || service}
                    </Badge>
                  ))}
                  {partner.servicesOffered.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{partner.servicesOffered.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{partner.totalOrders}</div>
                  <div className="text-xs text-muted-foreground">
                    {partner.pendingOrders} pendientes
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-green-600">
                    {partner.completedOrders}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {partner.totalOrders > 0
                      ? `${((partner.completedOrders / partner.totalOrders) * 100).toFixed(0)}%`
                      : '0%'}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-semibold">
                    ${partner.totalEarnings.toLocaleString()}
                  </div>
                  {partner.pendingEarnings > 0 && (
                    <div className="text-xs text-orange-600">
                      +${partner.pendingEarnings.toLocaleString()} pendiente
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {partner.isSuspended ? (
                  <Badge variant="destructive">Suspendido</Badge>
                ) : (
                  <Badge variant="default">Activo</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(partner)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
