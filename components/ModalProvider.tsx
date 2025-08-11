'use client';

import { ContactFormModal } from '@/components/ContactFormModal';
import { useContactModal } from '@/hooks/useContactModal';

export function ModalProvider() {
  const { isOpen, closeModal } = useContactModal();
  return <ContactFormModal open={isOpen} onOpenChange={closeModal} />;
}