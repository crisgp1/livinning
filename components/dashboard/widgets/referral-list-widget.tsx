// ============================================
// LIVINNING - Referral List Widget (Partner)
// ============================================

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link2, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReferredAgency {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedDate: string;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
  totalCommission: number;
  lastCommission?: number;
}

interface ReferralListWidgetProps {
  title: string;
  referrals: ReferredAgency[];
}

export function ReferralListWidget({ title, referrals }: ReferralListWidgetProps) {
  const statusConfig = {
    active: {
      label: 'Activa',
      className: 'bg-success-500 text-white hover:bg-success-500',
      gradient: 'from-success-400 to-success-600',
    },
    trial: {
      label: 'Prueba',
      className: 'bg-blue-bright text-white hover:bg-blue-bright',
      gradient: 'from-blue-bright to-blue-violet',
    },
    inactive: {
      label: 'Inactiva',
      className: 'bg-neutral-300 text-neutral-700 hover:bg-neutral-300',
      gradient: 'from-neutral-300 to-neutral-400',
    },
  };

  const totalEarnings = referrals.reduce((sum, ref) => sum + ref.totalCommission, 0);
  const activeReferrals = referrals.filter((r) => r.subscriptionStatus === 'active').length;

  return (
    <Card className="card-airbnb overflow-hidden relative">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-yellow to-coral-red opacity-5" />

      <CardHeader className="pb-4 relative">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-neutral-800">{title}</CardTitle>
          <Link href="/dashboard/partner/referencias">
            <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-600">
              Ver todas
            </Button>
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-gold-yellow/10 to-coral-red/10">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-gold-yellow" />
              <span className="text-xs text-neutral-600 font-medium">Ganancias Total</span>
            </div>
            <p className="text-xl font-bold text-neutral-800">${totalEarnings.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-bright/10 to-blue-violet/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-bright" />
              <span className="text-xs text-neutral-600 font-medium">Referencias Activas</span>
            </div>
            <p className="text-xl font-bold text-neutral-800">{activeReferrals}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-yellow to-coral-red flex items-center justify-center mx-auto mb-4">
              <Link2 className="h-8 w-8 text-white" />
            </div>
            <p className="text-neutral-800 font-semibold mb-1">No tienes referencias aún</p>
            <p className="text-sm text-neutral-500 mb-6">Comparte tu link de referido para empezar</p>
            <Button className="bg-gradient-to-r from-gold-yellow to-coral-red hover:opacity-90">
              <Link2 className="mr-2 h-4 w-4" />
              Copiar link de referido
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.slice(0, 5).map((agency) => (
              <Link
                key={agency.id}
                href={`/dashboard/partner/referencias/${agency.id}`}
                className="group block"
              >
                <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={agency.avatar} alt={agency.name} />
                    <AvatarFallback className="bg-gradient-to-br from-gold-yellow to-coral-red text-white font-semibold text-sm">
                      {agency.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-neutral-800 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {agency.name}
                      </h4>
                      <Badge
                        className={cn(
                          'text-xs font-medium',
                          statusConfig[agency.subscriptionStatus].className
                        )}
                      >
                        {statusConfig[agency.subscriptionStatus].label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{agency.joinedDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-semibold text-neutral-700">
                          ${agency.totalCommission.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Last Commission */}
                  {agency.lastCommission && (
                    <div className="text-right">
                      <p className="text-xs text-neutral-500 mb-0.5">Última comisión</p>
                      <p className="text-sm font-bold text-success-600">
                        +${agency.lastCommission.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
