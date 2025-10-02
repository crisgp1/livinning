// ============================================
// LIVINNING - Activity Widget
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  UserPlus,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'ticket_created' | 'ticket_resolved' | 'user_registered' | 'property_approved';
  message: string;
  time: string;
  user?: string;
}

interface ActivityWidgetProps {
  title: string;
  activities: Activity[];
}

export function ActivityWidget({ title, activities }: ActivityWidgetProps) {
  const activityConfig = {
    ticket_created: {
      icon: MessageSquare,
      gradient: 'from-blue-bright to-blue-violet',
      bgClass: 'bg-blue-bright/10',
    },
    ticket_resolved: {
      icon: CheckCircle2,
      gradient: 'from-success-400 to-success-600',
      bgClass: 'bg-success-50',
    },
    user_registered: {
      icon: UserPlus,
      gradient: 'from-purple-vibrant to-pink-vibrant',
      bgClass: 'bg-purple-vibrant/10',
    },
    property_approved: {
      icon: FileText,
      gradient: 'from-gold-yellow to-coral-red',
      bgClass: 'bg-gold-yellow/10',
    },
  };

  return (
    <Card className="card-airbnb">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-neutral-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-medium mb-1">No hay actividad reciente</p>
            <p className="text-sm text-neutral-500">La actividad aparecerá aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;

              return (
                <div key={activity.id} className="relative">
                  {/* Timeline Line */}
                  {index < activities.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-px bg-neutral-200" />
                  )}

                  <div className="flex gap-3">
                    {/* Icon */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        config.bgClass
                      )}
                    >
                      <Icon className={cn('h-5 w-5 bg-gradient-to-br bg-clip-text', config.gradient)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm text-neutral-800 font-medium mb-1">
                        {activity.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Clock className="h-3 w-3" />
                        <span>{activity.time}</span>
                        {activity.user && (
                          <>
                            <span>•</span>
                            <span>{activity.user}</span>
                          </>
                        )}
                      </div>
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
