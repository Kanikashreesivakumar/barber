import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-start gap-3 p-4 rounded-lg shadow-lg border
            animate-slide-in backdrop-blur-sm
            ${notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}
            ${notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''}
            ${notification.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : ''}
            ${notification.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''}
          `}
        >
          {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />}
          {notification.type === 'error' && <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />}
          {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />}

          <p className={`flex-1 text-sm font-medium ${
            notification.type === 'success' ? 'text-green-800 dark:text-green-200' : ''
          }${
            notification.type === 'error' ? 'text-red-800 dark:text-red-200' : ''
          }${
            notification.type === 'warning' ? 'text-yellow-800 dark:text-yellow-200' : ''
          }${
            notification.type === 'info' ? 'text-blue-800 dark:text-blue-200' : ''
          }`}>
            {notification.message}
          </p>

          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
