// ============================================
// LIVINNING - Dashboard Sidebar
// ============================================

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavItem } from '@/lib/dashboard/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UpgradeButton } from '@/components/upgrade';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface DashboardSidebarProps {
  navigation: NavItem[];
  title: string;
  description?: string;
  userRole?: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  currentProperties?: number;
}

export function DashboardSidebar({
  navigation,
  title,
  description,
  userRole,
  userId,
  userEmail,
  userName,
  currentProperties = 0,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const getIcon = (iconName: string): LucideIcon => {
    const Icon = (Icons as any)[iconName];
    return Icon || Icons.Circle;
  };

  const showUpgradeButton = userRole?.toUpperCase() === 'USER' && userId && userEmail && userName;

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="p-6">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = getIcon(item.icon);
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive && 'bg-secondary text-secondary-foreground font-medium'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Button - Solo para usuarios USER */}
        {showUpgradeButton && (
          <>
            <Separator className="my-4" />
            <UpgradeButton
              userId={userId}
              userEmail={userEmail}
              userName={userName}
              currentProperties={currentProperties}
              variant="sidebar"
            />
          </>
        )}
      </ScrollArea>
    </div>
  );
}
