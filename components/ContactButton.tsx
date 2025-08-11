'use client';

import { Button } from '@/components/ui/button';
import { useContactModal } from '@/hooks/useContactModal';

interface ContactButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function ContactButton({ className, children }: ContactButtonProps) {
  const { openModal } = useContactModal();

  return (
    <Button
      onClick={openModal}
      className={className}
    >
      {children || 'Contactez-nous'}
    </Button>
  );
}