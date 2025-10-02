// ============================================
// LIVINNING - Dashboard Content (Role-Based Views)
// ============================================

'use client';

import { UserRole } from '@/types';
import { DashboardConfig } from '@/lib/dashboard/types';

// Widget Imports
import { StatsWidget } from './widgets/stats-widget';
import { PropertiesWidget } from './widgets/properties-widget';
import { PropertyStatusWidget } from './widgets/property-status-widget';
import { FavoritesWidget } from './widgets/favorites-widget';
import { ChartWidget } from './widgets/chart-widget';
import { SubscriptionStatusWidget } from './widgets/subscription-status-widget';
import { TicketsWidget } from './widgets/tickets-widget';
import { ActivityWidget } from './widgets/activity-widget';
import { UsersWidget } from './widgets/users-widget';
import { SystemLogsWidget } from './widgets/system-logs-widget';
import { ReferralListWidget } from './widgets/referral-list-widget';

interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  propertyCount: number;
  subscriptionStatus: string;
  referralCode: string;
}

interface DashboardContentProps {
  user: DashboardUser;
  config: DashboardConfig;
}

export function DashboardContent({ user, config }: DashboardContentProps) {
  // Render widget based on type
  const renderWidget = (widget: any) => {
    switch (widget.type) {
      case 'stats':
        return <StatsWidgetRenderer widget={widget} user={user} />;
      case 'property-status':
        return <PropertyStatusWidgetRenderer widget={widget} user={user} />;
      case 'favorites':
        return <FavoritesWidgetRenderer widget={widget} />;
      case 'properties':
        return <PropertiesWidgetRenderer widget={widget} user={user} />;
      case 'chart':
        return <ChartWidgetRenderer widget={widget} user={user} />;
      case 'subscription-status':
        return <SubscriptionStatusWidgetRenderer widget={widget} user={user} />;
      case 'tickets':
        return <TicketsWidgetRenderer widget={widget} />;
      case 'activity':
        return <ActivityWidgetRenderer widget={widget} />;
      case 'users':
        return <UsersWidgetRenderer widget={widget} />;
      case 'system-logs':
        return <SystemLogsWidgetRenderer widget={widget} />;
      case 'referral-list':
        return <ReferralListWidgetRenderer widget={widget} user={user} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: `repeat(${config.layout.columns}, 1fr)`,
        gridTemplateRows: `repeat(${config.layout.rows}, minmax(200px, auto))`,
      }}
    >
      {config.widgets.map((widget) => (
        <div key={widget.id} style={{ gridArea: widget.gridArea }}>
          {renderWidget(widget)}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Widget Renderers with Mock Data
// ============================================

function StatsWidgetRenderer({ widget, user }: { widget: any; user: DashboardUser }) {
  // Mock stats data based on role
  const getStatsForRole = () => {
    switch (user.role) {
      case 'USER':
        return [
          { label: 'Vistas totales', value: 245, change: 12, trend: 'up' as const },
          { label: 'Me gusta', value: 18, change: 5, trend: 'up' as const },
          { label: 'Favoritos', value: 8, change: -2, trend: 'down' as const },
        ];
      case 'AGENCY':
        return [
          { label: 'Propiedades', value: 24, change: 8, trend: 'up' as const },
          { label: 'Vistas totales', value: '12.5K', change: 15, trend: 'up' as const },
          { label: 'Leads', value: 89, change: 22, trend: 'up' as const },
          { label: 'Conversión', value: '3.2%', change: 0.5, trend: 'up' as const },
        ];
      case 'PARTNER':
        return [
          { label: 'Total ganado', value: '$4,250', change: 18, trend: 'up' as const },
          { label: 'Pendiente', value: '$850', change: 5, trend: 'up' as const },
          { label: 'Pagado', value: '$3,400', change: 12, trend: 'up' as const },
        ];
      case 'ADMIN':
        return [
          { label: 'Usuarios', value: '1,245', change: 8, trend: 'up' as const },
          { label: 'Agencias', value: 124, change: 5, trend: 'up' as const },
          { label: 'Propiedades', value: '2,890', change: 12, trend: 'up' as const },
          { label: 'Ingresos', value: '$45,230', change: 15, trend: 'up' as const },
        ];
      case 'SUPERADMIN':
        return [
          { label: 'Usuarios totales', value: '1,245', change: 8, trend: 'up' as const },
          { label: 'Agencias totales', value: 124, change: 5, trend: 'up' as const },
          { label: 'Propiedades totales', value: '2,890', change: 12, trend: 'up' as const },
          { label: 'Ingresos totales', value: '$45,230', change: 15, trend: 'up' as const },
          { label: 'Suscripciones activas', value: 98, change: 7, trend: 'up' as const },
          { label: 'Tickets pendientes', value: 12, change: -3, trend: 'down' as const },
        ];
      case 'HELPDESK':
        return [
          { label: 'Tickets abiertos', value: 24, change: -5, trend: 'down' as const },
          { label: 'Resueltos hoy', value: 18, change: 12, trend: 'up' as const },
          { label: 'Tiempo promedio', value: '2.5h', change: -8, trend: 'down' as const },
        ];
      default:
        return [];
    }
  };

  return <StatsWidget title={widget.title} description={widget.description} stats={getStatsForRole()} />;
}

function PropertyStatusWidgetRenderer({ widget, user }: { widget: any; user: DashboardUser }) {
  const hasProperty = user.propertyCount > 0;
  const mockPropertyData = hasProperty
    ? {
        id: '1',
        title: 'Hermoso apartamento en el centro',
        status: 'active' as const,
        views: 245,
        likes: 18,
      }
    : undefined;

  return (
    <PropertyStatusWidget
      title={widget.title}
      description={widget.description}
      hasProperty={hasProperty}
      propertyData={mockPropertyData}
    />
  );
}

function FavoritesWidgetRenderer({ widget }: { widget: any }) {
  const mockFavorites = [
    {
      id: '1',
      title: 'Casa moderna con vista al mar',
      location: 'Playa del Carmen, Quintana Roo',
      price: 15000,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop',
      views: 342,
    },
    {
      id: '2',
      title: 'Departamento céntrico amueblado',
      location: 'Polanco, CDMX',
      price: 25000,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
      views: 521,
    },
    {
      id: '3',
      title: 'Loft industrial en zona histórica',
      location: 'Centro Histórico, Guadalajara',
      price: 18000,
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop',
      views: 289,
    },
  ];

  return <FavoritesWidget title={widget.title} favorites={mockFavorites} />;
}

function PropertiesWidgetRenderer({ widget, user }: { widget: any; user: DashboardUser }) {
  const mockProperties = [
    {
      id: '1',
      title: 'Casa moderna con jardín',
      price: 3500000,
      location: 'Zapopan, Jalisco',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop',
      status: 'active' as const,
      views: 342,
      bedrooms: 3,
      bathrooms: 2,
    },
    {
      id: '2',
      title: 'Departamento céntrico',
      price: 2800000,
      location: 'Polanco, CDMX',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop',
      status: 'pending' as const,
      views: 521,
      bedrooms: 2,
      bathrooms: 2,
    },
    {
      id: '3',
      title: 'Villa con alberca',
      price: 8900000,
      location: 'Tulum, Quintana Roo',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop',
      status: 'active' as const,
      views: 789,
      bedrooms: 4,
      bathrooms: 3,
    },
  ];

  return <PropertiesWidget properties={mockProperties} title={widget.title} viewAllHref={`/dashboard/${user.role.toLowerCase()}/propiedades`} />;
}

function ChartWidgetRenderer({ widget, user }: { widget: any; user: DashboardUser }) {
  const mockData =
    user.role === 'AGENCY'
      ? [
          { label: 'Ene', value: 420 },
          { label: 'Feb', value: 580 },
          { label: 'Mar', value: 720 },
          { label: 'Abr', value: 650 },
          { label: 'May', value: 890 },
          { label: 'Jun', value: 1020 },
        ]
      : [
          { label: 'Ene', value: 850 },
          { label: 'Feb', value: 920 },
          { label: 'Mar', value: 1100 },
          { label: 'Abr', value: 980 },
          { label: 'May', value: 1250 },
          { label: 'Jun', value: 1450 },
          { label: 'Jul', value: 1380 },
          { label: 'Ago', value: 1520 },
          { label: 'Sep', value: 1680 },
          { label: 'Oct', value: 1750 },
          { label: 'Nov', value: 1920 },
          { label: 'Dic', value: 2100 },
        ];

  return (
    <ChartWidget
      title={widget.title}
      description={widget.description}
      data={mockData}
      chartType={widget.config?.chartType || 'line'}
      gradient={user.role === 'AGENCY' ? 'from-purple-vibrant to-blue-violet' : 'from-gold-yellow to-coral-red'}
    />
  );
}

function SubscriptionStatusWidgetRenderer({ widget, user }: { widget: any; user: DashboardUser }) {
  const mockPlan = {
    name: 'Plan Pro',
    price: 499,
    interval: 'monthly' as const,
    renewDate: '15 de Nov, 2024',
    features: ['Propiedades ilimitadas', 'Analíticas avanzadas', 'Soporte prioritario'],
  };

  return (
    <SubscriptionStatusWidget
      title={widget.title}
      status={user.subscriptionStatus as any}
      plan={user.subscriptionStatus === 'active' ? mockPlan : undefined}
    />
  );
}

function TicketsWidgetRenderer({ widget }: { widget: any }) {
  const mockTickets = [
    {
      id: '1',
      title: 'No puedo publicar mi propiedad',
      user: 'María González',
      priority: 'high' as const,
      status: 'open' as const,
      createdAt: 'Hace 2 horas',
    },
    {
      id: '2',
      title: 'Error en el pago de suscripción',
      user: 'Carlos Ruiz',
      priority: 'urgent' as const,
      status: 'in_progress' as const,
      createdAt: 'Hace 4 horas',
    },
    {
      id: '3',
      title: 'Consulta sobre plan de agencia',
      user: 'Ana López',
      priority: 'medium' as const,
      status: 'open' as const,
      createdAt: 'Hace 1 día',
    },
  ];

  return <TicketsWidget title={widget.title} tickets={mockTickets} />;
}

function ActivityWidgetRenderer({ widget }: { widget: any }) {
  const mockActivities = [
    {
      id: '1',
      type: 'ticket_resolved' as const,
      message: 'Ticket #245 resuelto exitosamente',
      time: 'Hace 15 min',
      user: 'Soporte 1',
    },
    {
      id: '2',
      type: 'ticket_created' as const,
      message: 'Nuevo ticket creado: Error en pago',
      time: 'Hace 1 hora',
      user: 'Carlos Ruiz',
    },
    {
      id: '3',
      type: 'user_registered' as const,
      message: 'Nuevo usuario registrado en la plataforma',
      time: 'Hace 2 horas',
      user: 'Sistema',
    },
    {
      id: '4',
      type: 'property_approved' as const,
      message: 'Propiedad #892 aprobada',
      time: 'Hace 3 horas',
      user: 'Admin',
    },
  ];

  return <ActivityWidget title={widget.title} activities={mockActivities} />;
}

function UsersWidgetRenderer({ widget }: { widget: any }) {
  const mockUsers = [
    {
      id: '1',
      name: 'María González',
      email: 'maria@example.com',
      role: 'USER' as const,
      avatar: 'https://i.pravatar.cc/150?img=1',
      joinedAt: 'Hace 2 días',
      status: 'active' as const,
    },
    {
      id: '2',
      name: 'Inmobiliaria Premium',
      email: 'contacto@premium.com',
      role: 'AGENCY' as const,
      avatar: 'https://i.pravatar.cc/150?img=2',
      joinedAt: 'Hace 1 semana',
      status: 'active' as const,
    },
    {
      id: '3',
      name: 'Carlos Referidos',
      email: 'carlos@partner.com',
      role: 'PARTNER' as const,
      avatar: 'https://i.pravatar.cc/150?img=3',
      joinedAt: 'Hace 2 semanas',
      status: 'active' as const,
    },
  ];

  return <UsersWidget title={widget.title} users={mockUsers} />;
}

function SystemLogsWidgetRenderer({ widget }: { widget: any }) {
  const mockLogs = [
    {
      id: '1',
      level: 'info' as const,
      message: 'User authentication successful for user ID: 12345',
      timestamp: '2024-10-15 14:23:45',
      source: 'AUTH_SERVICE',
    },
    {
      id: '2',
      level: 'warning' as const,
      message: 'High memory usage detected on server node-3',
      timestamp: '2024-10-15 14:22:30',
      source: 'MONITORING',
    },
    {
      id: '3',
      level: 'error' as const,
      message: 'Failed to connect to external API: timeout after 30s',
      timestamp: '2024-10-15 14:20:15',
      source: 'API_GATEWAY',
    },
    {
      id: '4',
      level: 'success' as const,
      message: 'Database backup completed successfully',
      timestamp: '2024-10-15 14:15:00',
      source: 'DB_BACKUP',
    },
  ];

  return <SystemLogsWidget title={widget.title} logs={mockLogs} />;
}

function ReferralListWidgetRenderer({ widget, user }: { widget: any; user: DashboardUser }) {
  const mockReferrals = [
    {
      id: '1',
      name: 'Inmobiliaria del Sol',
      email: 'contacto@delsol.com',
      avatar: 'https://i.pravatar.cc/150?img=4',
      joinedDate: '15 Oct 2024',
      subscriptionStatus: 'active' as const,
      totalCommission: 2450,
      lastCommission: 450,
    },
    {
      id: '2',
      name: 'Propiedades Premium',
      email: 'info@premium.mx',
      avatar: 'https://i.pravatar.cc/150?img=5',
      joinedDate: '08 Oct 2024',
      subscriptionStatus: 'trial' as const,
      totalCommission: 800,
      lastCommission: 200,
    },
    {
      id: '3',
      name: 'Casas y Terrenos SA',
      email: 'ventas@casasyterrenos.com',
      avatar: 'https://i.pravatar.cc/150?img=6',
      joinedDate: '01 Oct 2024',
      subscriptionStatus: 'active' as const,
      totalCommission: 1000,
      lastCommission: 200,
    },
  ];

  return <ReferralListWidget title={widget.title} referrals={mockReferrals} />;
}
