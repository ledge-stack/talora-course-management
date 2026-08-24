import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export function ConfirmModal({ 
  isOpen, onClose, onConfirm, title, description, confirmText = 'Confirm', cancelText = 'Cancel', destructive = false 
}: ConfirmModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border border-border-subtle bg-bg-surface p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl">
          <Dialog.Title className="text-lg font-semibold text-text-primary">{title}</Dialog.Title>
          {description && <Dialog.Description className="text-sm text-text-secondary">{description}</Dialog.Description>}
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="btn-secondary">{cancelText}</button>
            <button type="button" onClick={() => { onConfirm(); onClose(); }} className={destructive ? 'btn-danger' : 'btn-primary'}>{confirmText}</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (val: string) => void;
  title: string;
  description?: string;
  placeholder?: string;
  submitText?: string;
  cancelText?: string;
}

export function PromptModal({
  isOpen, onClose, onSubmit, title, description, placeholder = '', submitText = 'Submit', cancelText = 'Cancel'
}: PromptModalProps) {
  const [val, setVal] = React.useState('');
  
  React.useEffect(() => {
    if (isOpen) setVal('');
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim()) return;
    onSubmit(val);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border border-border-subtle bg-bg-surface p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl">
          <Dialog.Title className="text-lg font-semibold text-text-primary">{title}</Dialog.Title>
          {description && <Dialog.Description className="text-sm text-text-secondary">{description}</Dialog.Description>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input 
              type="text" 
              className="input w-full" 
              value={val} 
              onChange={e => setVal(e.target.value)} 
              placeholder={placeholder}
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-2">
              <button type="button" onClick={onClose} className="btn-secondary">{cancelText}</button>
              <button type="submit" className="btn-primary">{submitText}</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
