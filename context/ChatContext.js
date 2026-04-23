import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useSocket } from './SocketContext';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { data: session } = useSession();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);

  const fetchChats = async () => {
    if (!session?.user?.id) {
      setChats([]);
      return;
    }

    setLoadingChats(true);
    try {
      const response = await fetch(`/api/chat/chats?userId=${session.user.id}`);
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Failed to load chat list:', error);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchChats();
    } else {
      setChats([]);
      setActiveChat(null);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!socket || !session?.user?.id) return;

    const handleNewMessage = (data) => {
      if (data.senderId !== session.user.id) {
        fetchChats();
      }
    };

    const handleMessagesRead = () => {
      fetchChats();
    };

    const handleNotification = () => {
      fetchChats();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('notification', handleNotification);
    };
  }, [socket, session?.user?.id]);

  const openChat = (recipientId, recipientName) => {
    if (!session?.user?.id || !recipientId) return;
    setActiveChat({ recipientId, recipientName });
    setIsChatListOpen(false);
  };

  const closeChat = () => {
    setActiveChat(null);
  };

  const unreadCount = useMemo(
    () => chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0),
    [chats]
  );

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        openChat,
        closeChat,
        isChatListOpen,
        setIsChatListOpen,
        unreadCount,
        loadingChats,
        fetchChats,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
