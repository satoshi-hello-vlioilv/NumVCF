import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen, title, message, confirmLabel = '確認', cancelLabel = 'キャンセル',
  variant = 'danger', onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmClass = variant === 'danger'
    ? 'bg-status-danger text-white hover:opacity-90'
    : 'bg-primary-500 text-white hover:bg-primary-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white dark:bg-dark-card rounded-xl shadow-overlay p-6 max-w-sm w-full mx-4">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-status-danger text-sm" />
          </div>
          <div>
            <p className="font-semibold text-ink-primary">{title}</p>
            <p className="text-sm text-ink-secondary mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-ink-secondary hover:text-ink-primary border border-surface-border rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-lg transition-opacity ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
