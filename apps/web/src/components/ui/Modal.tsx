'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onOpenChange, trigger, title, description, children, className = '' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className={`fixed z-50 bg-bg-surface border border-border-subtle shadow-xl w-full max-w-lg left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] rounded-xl p-6 max-h-[85vh] overflow-y-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
          /* Mobile Overrides (Bottom Sheet style on small screens) */
          max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:w-full max-sm:max-w-none max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:slide-in-from-bottom
          ${className}`}>
          <div className="flex flex-col gap-1 mb-5">
            <Dialog.Title className="text-xl font-display font-semibold text-text-primary">
              {title}
            </Dialog.Title>
            {description && (
              <Dialog.Description className="text-sm text-text-secondary">
                {description}
              </Dialog.Description>
            )}
          </div>
          {children}
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-2 rounded-md hover:bg-bg-surface-hover text-text-muted transition-colors"
              aria-label="Close"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor">
                <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" stroke="none" />
              </svg>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
