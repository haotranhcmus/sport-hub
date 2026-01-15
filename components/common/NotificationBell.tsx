import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  ShoppingBag,
  Truck,
  Package,
  MessageCircle,
  AlertTriangle,
  Gift,
  X,
  ChevronRight,
} from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import {
  Notification,
  NotificationType,
} from "../../services/notification.service";

// Icon mapping for notification types
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "ORDER_PLACED":
    case "NEW_ORDER":
      return <ShoppingBag size={18} className="text-blue-500" />;
    case "ORDER_CONFIRMED":
      return <Check size={18} className="text-green-500" />;
    case "ORDER_SHIPPING":
      return <Truck size={18} className="text-orange-500" />;
    case "ORDER_DELIVERED":
      return <Package size={18} className="text-emerald-500" />;
    case "ORDER_CANCELLED":
      return <X size={18} className="text-red-500" />;
    case "RETURN_APPROVED":
      return <CheckCheck size={18} className="text-green-500" />;
    case "RETURN_REJECTED":
      return <X size={18} className="text-red-500" />;
    case "CHAT_MESSAGE":
      return <MessageCircle size={18} className="text-purple-500" />;
    case "LOW_STOCK":
      return <AlertTriangle size={18} className="text-amber-500" />;
    case "PROMOTION":
      return <Gift size={18} className="text-pink-500" />;
    default:
      return <Bell size={18} className="text-gray-500" />;
  }
};

// Time ago helper
const timeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

// Notification Item
const NotificationItem: React.FC<{
  notification: Notification;
  onRead: () => void;
  onDelete: () => void;
  onClick?: () => void;
}> = ({ notification, onRead, onDelete, onClick }) => {
  return (
    <div
      className={`px-4 py-3 hover:bg-gray-50 transition cursor-pointer border-b border-gray-50 ${
        !notification.isRead ? "bg-blue-50/50" : ""
      }`}
      onClick={() => {
        if (!notification.isRead) onRead();
        onClick?.();
      }}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white rounded-full shadow-sm border">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={`text-sm font-medium truncate ${
                !notification.isRead ? "text-gray-900" : "text-gray-600"
              }`}
            >
              {notification.title}
            </h4>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={14} className="text-gray-400" />
            </button>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">
            {notification.message}
          </p>
          <span className="text-[10px] text-gray-400 mt-1">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        {!notification.isRead && (
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
        )}
      </div>
    </div>
  );
};

// Notification Bell with Dropdown
export const NotificationBell: React.FC<{
  onNotificationClick?: (notification: Notification) => void;
}> = ({ onNotificationClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const prevUnreadCount = useRef(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Animate when new notification arrives
  useEffect(() => {
    if (unreadCount > prevUnreadCount.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: Math.max(rect.left - 280, 16), // Position left of button, min 16px from edge
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dropdown content
  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="fixed w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-[9999] overflow-hidden"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        maxHeight: "calc(100vh - 120px)",
        minWidth: "320px",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-medium text-gray-800 text-sm">Thông báo</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-orange-500 hover:text-orange-600 font-medium"
          >
            Đánh dấu đã đọc
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Chưa có thông báo</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={() => markAsRead(notification.id)}
              onDelete={() => deleteNotification(notification.id)}
              onClick={() => {
                onNotificationClick?.(notification);
                setIsOpen(false);
              }}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 10 && (
        <div className="px-4 py-3 bg-gray-50 border-t text-center">
          <button className="text-xs text-blue-600 hover:underline font-medium flex items-center justify-center gap-1 w-full">
            Xem tất cả
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 hover:bg-gray-100 rounded-full transition ${
          isAnimating ? "animate-bounce" : ""
        }`}
      >
        <Bell
          size={22}
          className={`text-gray-600 ${isAnimating ? "text-amber-600" : ""}`}
        />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 ${
              isAnimating ? "animate-pulse" : ""
            }`}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Portal Dropdown - Renders outside sidebar to avoid overflow clipping */}
      {isOpen && createPortal(dropdownContent, document.body)}
    </div>
  );
};

// Toast notification for realtime
export const NotificationToast: React.FC<{
  notification: Notification;
  onClose: () => void;
  onClick?: () => void;
}> = ({ notification, onClose, onClick }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed top-4 right-4 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-[10000] animate-in slide-in-from-right cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 rounded-full">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-800 text-sm">
            {notification.title}
          </h4>
          <p className="text-xs text-gray-600 line-clamp-2">
            {notification.message}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};
