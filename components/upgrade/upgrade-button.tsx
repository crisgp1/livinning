// ============================================
// LIVINNING - Botón de Upgrade Discreto
// ============================================

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { UpgradeModal } from './upgrade-modal';
import { cn } from '@/lib/utils';

interface UpgradeButtonProps {
  userId: string;
  userEmail: string;
  userName: string;
  currentProperties?: number;
  variant?: 'sidebar' | 'floating';
  className?: string;
}

/**
 * Botón de Upgrade - Discreto y siempre habilitado
 * Principio de Inversión de Dependencias: Depende de abstracciones (props) no de implementaciones concretas
 */
export function UpgradeButton({
  userId,
  userEmail,
  userName,
  currentProperties = 0,
  variant = 'sidebar',
  className,
}: UpgradeButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const isSidebar = variant === 'sidebar';
  const isFloating = variant === 'floating';

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant={isSidebar ? 'outline' : 'default'}
        className={cn(
          isSidebar && 'w-full justify-start border-primary/50 text-primary hover:bg-primary/10 hover:text-primary',
          isFloating && 'fixed bottom-6 right-6 rounded-full shadow-lg h-12 px-6 z-50 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70',
          className
        )}
      >
        <Sparkles className={cn('h-4 w-4', isSidebar && 'mr-2')} />
        {isSidebar && <span className="flex-1 text-left">Upgrade</span>}
        {isFloating && <span className="ml-2">Publicar más propiedades</span>}
      </Button>

      <UpgradeModal
        open={showModal}
        onOpenChange={setShowModal}
        userId={userId}
        userEmail={userEmail}
        userName={userName}
        currentProperties={currentProperties}
      />
    </>
  );
}
