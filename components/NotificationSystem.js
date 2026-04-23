import { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useSession } from 'next-auth/react';

export default function NotificationSystem() {
  const { socket } = useSocket();
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socket || !session?.user) return;

    const handleNotification = (data) => {
      // Don't show notifications for messages from the current user
      if (data.from === session.user.id) return;

      const newNotification = {
        id: Date.now(),
        type: data.type,
        from: data.from,
        message: data.message,
        timestamp: new Date()
      };

      setNotifications(prev => [newNotification, ...prev]);

      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, session?.user]);

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-white border border-slate-200 rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-right-2"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-900">New Message</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
              <p className="text-xs text-slate-400 mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="text-slate-400 hover:text-slate-600 ml-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}