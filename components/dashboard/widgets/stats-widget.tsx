// ============================================
// LIVINNING - Stats Widget (Modern Airbnb Style)
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface Stat {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
}

interface StatsWidgetProps {
  title: string;
  stats: Stat[];
  description?: string;
}

const gradients = [
  'from-purple-vibrant to-blue-violet',
  'from-coral-red to-pink-vibrant',
  'from-blue-bright to-blue-violet',
  'from-gold-yellow to-coral-red',
];

export function StatsWidget({ title, stats, description }: StatsWidgetProps) {
  return (
    <Card className="card-airbnb overflow-hidden relative group hover:shadow-lg transition-all duration-300">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-vibrant via-blue-violet to-pink-vibrant opacity-[0.02] group-hover:opacity-[0.04] transition-opacity" />

      <CardHeader className="pb-4 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-neutral-800 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-vibrant" />
              {title}
            </CardTitle>
            {description && <p className="text-sm text-neutral-500">{description}</p>}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <StatItem key={index} {...stat} gradient={gradients[index % gradients.length]} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value, change, trend, icon, gradient }: Stat & { gradient?: string }) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5" />;
    if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-success-600 bg-gradient-to-r from-success-50 to-success-100';
    if (trend === 'down') return 'text-error-600 bg-gradient-to-r from-error-50 to-error-100';
    return 'text-neutral-500 bg-gradient-to-r from-neutral-50 to-neutral-100';
  };

  const progressValue = change ? Math.min(Math.abs(change) * 10, 100) : 0;

  return (
    <div className="group/stat p-4 rounded-xl bg-gradient-to-br from-white to-neutral-50 border border-neutral-100 hover:border-purple-vibrant/30 hover:shadow-md transition-all duration-300">
      <div className="space-y-3">
        {/* Icon */}
        {icon && (
          <div className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm group-hover/stat:scale-110 transition-transform",
            gradient
          )}>
            <div className="text-white">{icon}</div>
          </div>
        )}

        {/* Value & Label */}
        <div className="space-y-1">
          <p className={cn(
            "text-3xl font-black bg-gradient-to-br bg-clip-text text-transparent",
            gradient || "from-neutral-800 to-neutral-600"
          )}>
            {value}
          </p>
          <p className="text-sm text-neutral-600 font-semibold">{label}</p>
        </div>

        {/* Trend Indicator with Progress */}
        {change !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm',
                  getTrendColor()
                )}
              >
                {getTrendIcon()}
                <span>{Math.abs(change)}%</span>
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                {trend === 'up' ? 'Subiendo' : trend === 'down' ? 'Bajando' : 'Estable'}
              </span>
            </div>
            <Progress
              value={progressValue}
              className={cn(
                "h-1.5",
                trend === 'up' && "[&>div]:bg-gradient-to-r [&>div]:from-success-500 [&>div]:to-success-600",
                trend === 'down' && "[&>div]:bg-gradient-to-r [&>div]:from-error-500 [&>div]:to-error-600",
                trend === 'neutral' && "[&>div]:bg-gradient-to-r [&>div]:from-neutral-400 [&>div]:to-neutral-500"
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
