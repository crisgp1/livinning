// LIVINNING - Credit Requests Table Component

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
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface CreditRequest {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  amount: number;
  reason: string;
  justification: string;
  status: string;
  createdAt: number;
  reviewedAt?: number;
  reviewedByName?: string;
  reviewNotes?: string;
}

interface CreditRequestsTableProps {
  requests: CreditRequest[];
  onReview: (request: CreditRequest) => void;
}

export function CreditRequestsTable({ requests, onReview }: CreditRequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay solicitudes de credito
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 gap-1">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600 gap-1">
            <CheckCircle className="h-3 w-3" />
            Aprobada
          </Badge>
        );
      case 'counter_offer':
        return (
          <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 gap-1">
            <CheckCircle className="h-3 w-3" />
            Contraoferta
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rechazada
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Partner</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Razon</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{request.partnerName}</div>
                  <div className="text-sm text-muted-foreground">
                    {request.partnerEmail}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-semibold text-lg text-green-600">
                  ${request.amount.toLocaleString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <p className="text-sm font-medium">{request.reason}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {request.justification}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {new Date(request.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                {request.reviewedAt && (
                  <div className="text-xs text-muted-foreground">
                    Revisado: {new Date(request.reviewedAt).toLocaleDateString('es-ES')}
                  </div>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReview(request)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {request.status === 'pending' ? 'Revisar' : 'Ver'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
