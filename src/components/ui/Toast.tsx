import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faInfoCircle, faTimesCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useUIStore } from '../../store/uiStore';

const iconMap = {
  success: { icon: faCheckCircle,        color: 'text-status-success' },
  error:   { icon: faTimesCircle,         color: 'text-status-danger' },
  warning: { icon: faExclamationTriangle, color: 'text-status-warning' },
  info:    { icon: faInfoCircle,          color: 'text-status-info' },
};

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const { icon, color } = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-white dark:bg-dark-card border border-surface-border dark:border-dark-border rounded-lg shadow-overlay px-4 py-3 min-w-64 max-w-sm animate-slide-up"
          >
            <FontAwesomeIcon icon={icon} className={`${color} mt-0.5 flex-shrink-0`} />
            <span className="flex-1 text-sm text-ink-primary dark:text-slate-200">{toast.message}</span>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="text-primary-500 text-sm font-medium hover:text-primary-700 whitespace-nowrap"
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-ink-placeholder hover:text-ink-secondary transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
