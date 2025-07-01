'use client';

import { Button } from '@/components/ui/button';
import { useContactModal } from '@/hooks/useContactModal';

interface ContactButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function ContactButton({ className, children }: ContactButtonProps) {
  const { onOpen } = useContactModal();

  return (
    <Button
      onClick={onOpen}
      className={className}
    >
      {children || 'Contactez-nous'}
    </Button>
  );
}