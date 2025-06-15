import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success:
    'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
  error:
    'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
  info: 'bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
  warning:
    'bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
};

export function Notification({ type, message, onClose, duration = 5000 }: NotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const Icon = icons[type];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-lg border ${colors[type]} shadow-lg max-w-sm w-full sm:max-w-md transform transition-all duration-300 ease-in-out`}
      role="alert"
    >
      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
