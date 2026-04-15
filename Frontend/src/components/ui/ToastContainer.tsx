import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const icons = {
    success: <CheckCircle className="text-success" size={20} />,
    error: <AlertCircle className="text-danger" size={20} />,
    warning: <AlertTriangle className="text-warning" size={20} />,
    info: <Info className="text-info" size={20} />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center space-x-3 bg-toast-bg text-toast-text px-4 py-3 rounded-lg shadow-lg min-w-[300px] animate-in slide-in-from-right-full transition-all',
          )}
        >
          <span>{icons[toast.type]}</span>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
