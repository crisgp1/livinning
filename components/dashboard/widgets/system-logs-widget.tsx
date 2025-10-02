// ============================================
// LIVINNING - System Logs Widget (Superadmin)
// ============================================

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertCircle, Info, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  source?: string;
}

interface SystemLogsWidgetProps {
  title: string;
  logs: SystemLog[];
}

export function SystemLogsWidget({ title, logs }: SystemLogsWidgetProps) {
  const levelConfig = {
    info: {
      label: 'Info',
      icon: Info,
      className: 'bg-blue-bright/20 text-blue-bright hover:bg-blue-bright/20',
      iconBg: 'bg-blue-bright/10',
    },
    warning: {
      label: 'Warning',
      icon: AlertCircle,
      className: 'bg-warning-500/20 text-warning-700 hover:bg-warning-500/20',
      iconBg: 'bg-warning-50',
    },
    error: {
      label: 'Error',
      icon: XCircle,
      className: 'bg-error-500/20 text-error-600 hover:bg-error-500/20',
      iconBg: 'bg-error-50',
    },
    success: {
      label: 'Success',
      icon: CheckCircle2,
      className: 'bg-success-500/20 text-success-600 hover:bg-success-500/20',
      iconBg: 'bg-success-50',
    },
  };

  return (
    <Card className="card-airbnb overflow-hidden relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-coral-red to-pink-vibrant opacity-5" />

      <CardHeader className="flex flex-row items-center justify-between pb-4 relative">
        <CardTitle className="text-lg font-semibold text-neutral-800">{title}</CardTitle>
        <Link href="/dashboard/superadmin/logs">
          <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-600">
            Ver todos
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="relative">
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-coral-red to-pink-vibrant flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <p className="text-neutral-800 font-semibold mb-1">No hay logs recientes</p>
            <p className="text-sm text-neutral-500">Los logs del sistema aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.map((log) => {
              const config = levelConfig[log.level];
              const Icon = config.icon;

              return (
                <div
                  key={log.id}
                  className="flex gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  {/* Icon */}
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', config.iconBg)}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-1">
                      <Badge className={cn('text-xs font-medium', config.className)}>
                        {config.label}
                      </Badge>
                      {log.source && (
                        <span className="text-xs text-neutral-500 font-mono">{log.source}</span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-700 font-mono line-clamp-2">{log.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-neutral-500">
                      <Clock className="h-3 w-3" />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
