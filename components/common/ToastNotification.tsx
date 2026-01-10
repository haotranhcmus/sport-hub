// Toast Notification Component
// Lightweight toast notifications for realtime events

import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, Bell } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastNotificationProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({
  toast,
  onRemove,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onRemove, 300); // Wait for animation
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.duration, onRemove]);

  const config = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      textColor: "text-green-800",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-600",
      textColor: "text-red-800",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      textColor: "text-blue-800",
    },
    warning: {
      icon: Bell,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-600",
      textColor: "text-orange-800",
    },
  };

  const {
    icon: Icon,
    bgColor,
    borderColor,
    iconColor,
    textColor,
  } = config[toast.type];

  return (
    <div
      className={`
        ${bgColor} ${borderColor} ${textColor}
        border-2 rounded-2xl p-4 shadow-xl
        flex items-start gap-3
        transition-all duration-300 ease-in-out
        ${
          isExiting
            ? "opacity-0 translate-x-8"
            : "opacity-100 translate-x-0 animate-slideIn"
        }
      `}
    >
      <Icon size={20} className={`${iconColor} shrink-0 mt-0.5`} />
      <p className="text-sm font-bold flex-1 uppercase tracking-wide leading-relaxed">
        {toast.message}
      </p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onRemove, 300);
        }}
        className="text-gray-400 hover:text-gray-600 transition shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Custom Hook for Toast Management
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (
    type: ToastType,
    message: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, duration?: number) =>
    addToast("success", message, duration);
  const error = (message: string, duration?: number) =>
    addToast("error", message, duration);
  const info = (message: string, duration?: number) =>
    addToast("info", message, duration);
  const warning = (message: string, duration?: number) =>
    addToast("warning", message, duration);

  return {
    toasts,
    removeToast,
    success,
    error,
    info,
    warning,
  };
};
