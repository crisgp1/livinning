// LIVINNING - Online Status Indicator Component

'use client';

import { Badge } from '@/components/ui/badge';

interface OnlineStatusProps {
  lastActivity?: number;
  className?: string;
  showText?: boolean;
}

export function OnlineStatus({ lastActivity, className = '', showText = true }: OnlineStatusProps) {
  const isOnline = lastActivity ? Date.now() - lastActivity < 2 * 60 * 1000 : false;

  if (showText) {
    return (
      <Badge
        variant={isOnline ? 'default' : 'secondary'}
        className={`${className} ${isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}`}
      >
        <span className="relative flex h-2 w-2 mr-1.5">
          {isOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-white' : 'bg-gray-200'}`}></span>
        </span>
        {isOnline ? 'En linea' : 'Desconectado'}
      </Badge>
    );
  }

  return (
    <span className={`relative flex h-3 w-3 ${className}`}>
      {isOnline && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      )}
      <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
    </span>
  );
}
