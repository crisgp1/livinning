// LIVINNING - Credits Table Component

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
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface Credit {
  id: string;
  amount: number;
  reason: string;
  grantedBy: string;
  grantedByName: string;
  createdAt: number;
  used: boolean;
  usedAt?: number;
  expiresAt?: number;
}

interface CreditsTableProps {
  credits: Credit[];
}

export function CreditsTable({ credits }: CreditsTableProps) {
  if (credits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tienes creditos disponibles
      </div>
    );
  }

  const getStatusBadge = (credit: Credit) => {
    const now = Date.now();

    if (credit.used) {
      return (
        <Badge variant="secondary" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Usado
        </Badge>
      );
    }

    if (credit.expiresAt && credit.expiresAt < now) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Expirado
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600 gap-1">
        <Clock className="h-3 w-3" />
        Disponible
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Credito</TableHead>
            <TableHead>Razon</TableHead>
            <TableHead>Otorgado Por</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {credits.map((credit) => (
            <TableRow key={credit.id}>
              <TableCell>
                <div className="font-semibold text-lg">
                  ${credit.amount.toLocaleString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <p className="text-sm">{credit.reason}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{credit.grantedByName}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {new Date(credit.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                {credit.used && credit.usedAt && (
                  <div className="text-xs text-muted-foreground">
                    Usado: {new Date(credit.usedAt).toLocaleDateString('es-ES')}
                  </div>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(credit)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
