import { useEffect } from 'react';
import { CheckIcon, ErrorIcon, CloseIcon } from './Icons';
import { BottleCapIcon } from './Icons';

export const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const getIcon = () => {
    switch (toast.intent) {
      case 'success':
        return <CheckIcon className="w-6 h-6 text-green-600" />;
      case 'error':
        return <ErrorIcon className="w-6 h-6 text-red-600" />;
      default:
        return <BottleCapIcon className="w-6 h-6" />;
    }
  };

  const getStyles = () => {
    switch (toast.intent) {
      case 'success':
        return 'bg-green-50 border-green-300';
      case 'error':
        return 'bg-red-50 border-red-300';
      default:
        return 'bg-blue-50 border-blue-300';
    }
  };

  const getTextStyles = () => {
    switch (toast.intent) {
      case 'success':
        return { title: 'text-green-900', message: 'text-green-800', button: 'text-green-600' };
      case 'error':
        return { title: 'text-red-900', message: 'text-red-800', button: 'text-red-600' };
      default:
        return { title: 'text-blue-900', message: 'text-blue-800', button: 'text-blue-600' };
    }
  };

  const textStyles = getTextStyles();

  return (
    <div
      className={`min-w-[320px] max-w-md rounded-lg shadow-2xl border-2 p-4 transform transition-all duration-300 ease-out animate-slideIn ${getStyles()}`}
      role="status"
      aria-live={toast.intent === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">{getIcon()}</div>
        
        <div className="flex-1">
          <h4 className={`font-semibold text-sm mb-1 ${textStyles.title}`}>
            {toast.title}
          </h4>
          <p className={`text-sm ${textStyles.message}`}>
            {toast.message}
          </p>
        </div>

        <button
          onClick={() => onClose(toast.id)}
          className={`flex-shrink-0 rounded hover:bg-white/50 p-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${textStyles.button}`}
          aria-label="Dismiss notification"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

export const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div
      className="fixed bottom-8 right-8 z-50 space-y-3"
      aria-live="polite"
      aria-atomic="true"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

export default Toast;
