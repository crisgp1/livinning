// ============================================
// LIVINNING - Tickets Widget (Helpdesk)
// ============================================

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Ticket {
  id: string;
  title: string;
  user: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

interface TicketsWidgetProps {
  title: string;
  tickets: Ticket[];
  filterStatus?: string;
}

export function TicketsWidget({ title, tickets, filterStatus }: TicketsWidgetProps) {
  const priorityConfig = {
    low: { label: 'Baja', className: 'bg-neutral-200 text-neutral-700 hover:bg-neutral-200' },
    medium: {
      label: 'Media',
      className: 'bg-blue-bright/20 text-blue-bright hover:bg-blue-bright/20',
    },
    high: {
      label: 'Alta',
      className: 'bg-coral-red/20 text-coral-red hover:bg-coral-red/20',
    },
    urgent: {
      label: 'Urgente',
      className: 'bg-error-500 text-white hover:bg-error-500',
    },
  };

  const statusConfig = {
    open: { label: 'Abierto', className: 'bg-warning-500 text-white hover:bg-warning-500' },
    in_progress: {
      label: 'En proceso',
      className: 'bg-blue-bright text-white hover:bg-blue-bright',
    },
    resolved: { label: 'Resuelto', className: 'bg-success-500 text-white hover:bg-success-500' },
  };

  return (
    <Card className="card-airbnb overflow-hidden relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-violet to-purple-vibrant opacity-5" />

      <CardHeader className="flex flex-row items-center justify-between pb-4 relative">
        <CardTitle className="text-lg font-semibold text-neutral-800">{title}</CardTitle>
        <Link href="/dashboard/helpdesk/tickets">
          <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-600">
            Ver todos
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="relative">
        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-violet to-purple-vibrant flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <p className="text-neutral-800 font-semibold mb-1">No hay tickets pendientes</p>
            <p className="text-sm text-neutral-500">¡Excelente trabajo!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.slice(0, 5).map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/helpdesk/tickets/${ticket.id}`}
                className="group block"
              >
                <div className="p-4 rounded-xl border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-semibold text-sm text-neutral-800 line-clamp-1 group-hover:text-primary-600 transition-colors flex-1">
                      {ticket.title}
                    </h4>
                    <Badge className={cn('text-xs font-medium', priorityConfig[ticket.priority].className)}>
                      {priorityConfig[ticket.priority].label}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-neutral-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{ticket.user}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{ticket.createdAt}</span>
                    </div>
                    <Badge
                      className={cn('text-xs font-medium', statusConfig[ticket.status].className)}
                    >
                      {statusConfig[ticket.status].label}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
