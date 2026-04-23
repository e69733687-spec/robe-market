import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      autoConnect: true,
      auth: {
        token: session?.user?.id
      }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to socket server');

      // Join user's room if authenticated
      if (session?.user?.id) {
        socketInstance.emit('join', session.user.id);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from socket server');
    });

    socketInstance.on('user_online', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socketInstance.on('user_offline', (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session, status]);

  // Re-join room when session changes
  useEffect(() => {
    if (socket && session?.user?.id && isConnected) {
      socket.emit('join', session.user.id);
    }
  }, [socket, session?.user?.id, isConnected]);

  const value = {
    socket,
    isConnected,
    onlineUsers
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}