// ============================================
// LIVINNING - Chart Widget
// ============================================

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ChartWidgetProps {
  title: string;
  description?: string;
  data: ChartDataPoint[];
  chartType?: 'line' | 'bar';
  period?: string;
  gradient?: string;
}

export function ChartWidget({
  title,
  description,
  data,
  chartType = 'bar',
  gradient = 'from-purple-vibrant to-blue-violet',
}: ChartWidgetProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <Card className="card-airbnb">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-neutral-800">{title}</CardTitle>
            {description && <p className="text-sm text-neutral-500">{description}</p>}
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-vibrant/20 to-blue-violet/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-purple-vibrant" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartType === 'bar' ? (
          <div className="space-y-3">
            {data.map((point, index) => {
              const percentage = (point.value / maxValue) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-600 font-medium">{point.label}</span>
                    <span className="text-neutral-800 font-bold">
                      {point.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full bg-gradient-to-r', gradient)}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex items-end justify-between gap-2">
            {data.map((point, index) => {
              const height = (point.value / maxValue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex items-end" style={{ height: '200px' }}>
                    <div
                      className={cn(
                        'w-full rounded-t-lg bg-gradient-to-t transition-all duration-300 hover:opacity-80',
                        gradient
                      )}
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold text-neutral-800 whitespace-nowrap">
                        {point.value}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-500 font-medium text-center">
                    {point.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
