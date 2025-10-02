// ============================================
// LIVINNING - Dashboard Layout
// ============================================

'use client';

import { ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useDashboard } from '@/hooks/use-dashboard';
import { DashboardSidebar } from './dashboard-sidebar';
import { Button } from '@/components/ui/button';
import { Building, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { config, isLoading: configLoading } = useDashboard();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (configLoading || !config || !isLoaded || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Building className="h-12 w-12 text-primary animate-pulse mx-auto" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userRole = (user.publicMetadata?.role as string)?.toLowerCase() || 'user';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar
        navigation={config.navigation}
        title={config.title}
        description={config.description}
        userRole={userRole}
        userId={user.id}
        userEmail={user.primaryEmailAddress?.emailAddress || ''}
        userName={user.fullName || user.firstName || 'Usuario'}
        currentProperties={(user.publicMetadata?.propertyCount as number) || 0}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{config.title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Actions */}
            {config.quickActions && config.quickActions.length > 0 && (
              <div className="hidden md:flex items-center space-x-2">
                {config.quickActions.map((action, index) => (
                  <Link key={index} href={action.href || '#'}>
                    <Button variant={action.variant || 'default'} size="sm">
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.imageUrl} alt={user.fullName || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.fullName || user.firstName || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/dashboard/${userRole}/perfil`}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/10 p-6">{children}</main>
      </div>
    </div>
  );
}
