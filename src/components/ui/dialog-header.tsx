import { X } from 'lucide-react';
import type { ReactNode, Ref } from 'react';

type Props = {
  label: ReactNode;
  closeLabel?: string;
  onClose?: () => void;
  closeButtonRef?: Ref<HTMLButtonElement>;
  closeControl?: ReactNode;
};

export function DialogHeader({ label, closeLabel = 'Cerrar', onClose, closeButtonRef, closeControl }: Props) {
  return (
    <header className="ui-dialog-header">
      <span className="ui-dialog-header-label">{label}</span>
      {closeControl ?? (
        <button
          ref={closeButtonRef}
          type="button"
          className="ui-dialog-close"
          data-cuelume-close
          aria-label={closeLabel}
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </button>
      )}
    </header>
  );
}
