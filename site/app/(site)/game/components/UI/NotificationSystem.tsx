'use client';

import { useEffect, useState } from 'react';
import type { LogEntry } from '../../types/game.types';

interface NotificationSystemProps {
  notifications: LogEntry[];
  setNotifications: (notifications: LogEntry[]) => void;
}

export const NotificationSystem = ({ notifications, setNotifications }: NotificationSystemProps) => {
  const [visibleNotifications, setVisibleNotifications] = useState<(LogEntry & { id: string })[]>([]);

  useEffect(() => {
    if (notifications.length > 0) {
      const newNotifications = notifications.map(notification => ({
        ...notification,
        id: `${notification.timestamp}-${Math.random()}`
      }));

      setVisibleNotifications(prev => [...prev, ...newNotifications]);
      setNotifications([]);

      // Auto remove notifications after 4 seconds
      newNotifications.forEach(notification => {
        setTimeout(() => {
          setVisibleNotifications(prev => 
            prev.filter(n => n.id !== notification.id)
          );
        }, 4000);
      });
    }
  }, [notifications, setNotifications]);

  const removeNotification = (id: string) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: LogEntry & { id: string };
  onRemove: () => void;
}

const NotificationItem = ({ notification, onRemove }: NotificationItemProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-600 border-green-500 text-green-100';
      case 'error':
        return 'bg-red-600 border-red-500 text-red-100';
      case 'info':
      default:
        return 'bg-blue-600 border-blue-500 text-blue-100';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`
        relative p-3 rounded-lg border-l-4 shadow-lg transition-all duration-300 ease-in-out
        ${getNotificationStyles()}
        ${isVisible 
          ? 'transform translate-x-0 opacity-100' 
          : 'transform translate-x-full opacity-0'
        }
      `}
    >
      <div className="flex items-start space-x-3">
        <span className="text-lg flex-shrink-0 mt-0.5">{getIcon()}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5">
            {notification.message}
          </p>
          <p className="text-xs opacity-75 mt-1">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};