// ============================================
// LIVINNING - Notification Bell Component
// ============================================

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  XCircle,
  Ban,
  Info,
  Loader2,
  Clock,
  Shield,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'warning' | 'violation' | 'suspension' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  readAt?: string;
}

/**
 * Componente Notification Bell
 * Muestra notificaciones del usuario en tiempo real
 */
export function NotificationBell() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications?limit=10');
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notifications || []);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and when popover opens
  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Open notification in dialog
  const openNotification = (notification: Notification) => {
    setSelectedNotification(notification);
    setDialogOpen(true);
    setIsOpen(false); // Cerrar el popover
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Actualizar también la notificación seleccionada si está abierta
        if (selectedNotification?.id === notificationId) {
          setSelectedNotification((prev) =>
            prev ? { ...prev, isRead: true, readAt: new Date().toISOString() } : null
          );
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
        toast.success('Todas las notificaciones marcadas como leídas');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Error al marcar notificaciones como leídas');
    }
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      warning: { icon: AlertTriangle, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
      violation: { icon: XCircle, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
      suspension: { icon: Ban, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
      info: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    };
    return configs[type as keyof typeof configs] || configs.info;
  };

  const getSeverityBadge = (severity: string) => {
    const badges = {
      low: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      critical: 'bg-red-100 text-red-700 border-red-300',
    };
    return badges[severity as keyof typeof badges] || badges.low;
  };

  if (!user) return null;

  return (
    <>
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} nuevas
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-8 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No tienes notificaciones
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-2">
              {notifications.map((notification) => {
                const typeConfig = getTypeConfig(notification.type);
                const TypeIcon = typeConfig.icon;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'relative p-3 rounded-lg border transition-colors cursor-pointer',
                      notification.isRead
                        ? 'bg-background hover:bg-accent/50'
                        : `${typeConfig.bgColor} ${typeConfig.borderColor} hover:opacity-90`
                    )}
                    onClick={() => openNotification(notification)}
                  >
                    {!notification.isRead && (
                      <div className="absolute top-3 right-3">
                        <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className={cn('mt-0.5', typeConfig.color)}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm truncate">
                            {notification.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn('text-xs flex-shrink-0', getSeverityBadge(notification.severity))}
                          >
                            {notification.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {notification.createdByName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-xs"
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Navigate to all notifications page
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>

      {/* Notification Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedNotification && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {(() => {
                    const typeConfig = getTypeConfig(selectedNotification.type);
                    const TypeIcon = typeConfig.icon;
                    return (
                      <div className={cn('p-3 rounded-lg', typeConfig.bgColor)}>
                        <TypeIcon className={cn('h-6 w-6', typeConfig.color)} />
                      </div>
                    );
                  })()}
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{selectedNotification.title}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn('text-xs', getSeverityBadge(selectedNotification.severity))}
                      >
                        {selectedNotification.severity.toUpperCase()}
                      </Badge>
                      {!selectedNotification.isRead && (
                        <Badge variant="default" className="text-xs bg-blue-600">
                          Nueva
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Message */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Mensaje:</h4>
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedNotification.message}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Fecha:</span>
                    </div>
                    <p className="text-sm pl-6">
                      {new Date(selectedNotification.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Enviado por:</span>
                    </div>
                    <p className="text-sm pl-6">{selectedNotification.createdByName}</p>
                  </div>
                </div>

                {selectedNotification.isRead && selectedNotification.readAt && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3 w-3" />
                      <span>
                        Leída el{' '}
                        {new Date(selectedNotification.readAt).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cerrar
                </Button>
                {!selectedNotification.isRead && (
                  <Button
                    onClick={() => {
                      markAsRead(selectedNotification.id);
                      toast.success('Notificación marcada como leída');
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Marcar como leída
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
