// ============================================
// LIVINNING - Users Widget (Admin)
// ============================================

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, MoreVertical, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'AGENCY' | 'PARTNER' | 'HELPDESK' | 'ADMIN' | 'SUPERADMIN';
  avatar?: string;
  joinedAt: string;
  status: 'active' | 'suspended';
}

interface UsersWidgetProps {
  title: string;
  users: User[];
  filterRole?: string;
}

export function UsersWidget({ title, users, filterRole }: UsersWidgetProps) {
  const roleConfig = {
    USER: { label: 'Usuario', gradient: 'from-blue-bright to-blue-violet' },
    AGENCY: { label: 'Agencia', gradient: 'from-purple-vibrant to-blue-violet' },
    PARTNER: { label: 'Socio', gradient: 'from-gold-yellow to-coral-red' },
    HELPDESK: { label: 'Soporte', gradient: 'from-blue-violet to-purple-vibrant' },
    ADMIN: { label: 'Admin', gradient: 'from-coral-red to-pink-vibrant' },
    SUPERADMIN: { label: 'Super Admin', gradient: 'from-pink-vibrant to-purple-vibrant' },
  };

  return (
    <Card className="card-airbnb overflow-hidden relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-vibrant to-pink-vibrant opacity-5" />

      <CardHeader className="flex flex-row items-center justify-between pb-4 relative">
        <CardTitle className="text-lg font-semibold text-neutral-800">{title}</CardTitle>
        <Link href="/dashboard/admin/usuarios">
          <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-600">
            Ver todos
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="relative">
        {users.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-vibrant to-pink-vibrant flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <p className="text-neutral-800 font-semibold mb-1">No hay usuarios</p>
            <p className="text-sm text-neutral-500">Los usuarios aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-vibrant to-pink-vibrant text-white font-semibold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-neutral-800 line-clamp-1">
                      {user.name}
                    </h4>
                    <Badge
                      className={cn(
                        'text-xs font-medium bg-gradient-to-r text-white border-0',
                        roleConfig[user.role].gradient
                      )}
                    >
                      {roleConfig[user.role].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                    <Mail className="h-3 w-3" />
                    <span className="line-clamp-1">{user.email}</span>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                    <DropdownMenuItem>Editar rol</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-error-600">
                      {user.status === 'active' ? 'Suspender' : 'Activar'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
