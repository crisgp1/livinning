// ============================================
// LIVINNING - Spotlight Search (Ctrl+K)
// ============================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  User,
  Building2,
  Shield,
  Users,
  Home,
  LayoutDashboard,
  Settings,
  Loader2,
} from 'lucide-react';

interface SearchUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  isSuspended?: boolean;
}

interface SpotlightSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Componente Spotlight Search
 * Permite búsqueda global rápida de usuarios con Ctrl+K
 * Principio de Responsabilidad Única: Solo maneja búsqueda y navegación
 */
export function SpotlightSearch({ open, onOpenChange }: SpotlightSearchProps) {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const userRole = (clerkUser?.publicMetadata?.role as string)?.toUpperCase();
  const isAdmin = userRole === 'SUPERADMIN' || userRole === 'ADMIN' || userRole === 'HELPDESK';

  // Búsqueda con debounce
  useEffect(() => {
    if (!searchQuery.trim() || !isAdmin) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (data.success) {
          setSearchResults(data.data.users || []);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, isAdmin]);

  const handleSelectUser = useCallback((userId: string) => {
    router.push(`/dashboard/${userRole?.toLowerCase()}/usuarios?highlight=${userId}`);
    onOpenChange(false);
    setSearchQuery('');
  }, [router, userRole, onOpenChange]);

  const handleSelectRoute = useCallback((route: string) => {
    router.push(route);
    onOpenChange(false);
  }, [router, onOpenChange]);

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SUPERADMIN':
      case 'ADMIN':
        return Shield;
      case 'AGENCY':
        return Building2;
      case 'HELPDESK':
        return Users;
      default:
        return User;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'SUPERADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'ADMIN':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'AGENCY':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'HELPDESK':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Buscar usuarios, navegar..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            'No se encontraron resultados'
          )}
        </CommandEmpty>

        {/* Quick Navigation */}
        <CommandGroup heading="Navegación Rápida">
          <CommandItem onSelect={() => handleSelectRoute(`/dashboard/${userRole?.toLowerCase()}`)}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelectRoute('/')}>
            <Home className="mr-2 h-4 w-4" />
            <span>Inicio</span>
          </CommandItem>
          {isAdmin && (
            <CommandItem onSelect={() => handleSelectRoute(`/dashboard/${userRole?.toLowerCase()}/usuarios`)}>
              <Users className="mr-2 h-4 w-4" />
              <span>Gestión de Usuarios</span>
            </CommandItem>
          )}
        </CommandGroup>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Usuarios (${searchResults.length})`}>
              {searchResults.map((user) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => handleSelectUser(user.id)}
                    className="flex items-center gap-3 py-3"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        {user.isSuspended && (
                          <Badge variant="destructive" className="text-xs">
                            Suspendido
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getRoleBadgeColor(user.role)} text-xs flex items-center gap-1`}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {user.role}
                    </Badge>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
