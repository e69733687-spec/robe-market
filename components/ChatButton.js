import { useSession } from 'next-auth/react';
import { useChat } from '../context/ChatContext';
import ChatWindow from './ChatWindow';

export default function ChatButton() {
  const { data: session } = useSession();
  const {
    chats,
    activeChat,
    openChat,
    closeChat,
    isChatListOpen,
    setIsChatListOpen,
    unreadCount,
    loadingChats,
  } = useChat();

  if (!session?.user) return null;

  const openConversation = (chat) => {
    openChat(chat.otherParticipant._id, chat.otherParticipant.name);
  };

  return (
    <>
      {/* Chat Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setIsChatListOpen(!isChatListOpen)}
          className="relative w-14 h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg transition-colors flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat List */}
      {isChatListOpen && (
        <div className="fixed bottom-36 right-4 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Messages</h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-slate-500">
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Start chatting with sellers and buyers!</p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat._id}
                  onClick={() => openConversation(chat)}
                  className="w-full p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-slate-600">
                          {chat.otherParticipant.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      {chat.otherParticipant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900 truncate">
                          {chat.otherParticipant.name}
                        </p>
                        {chat.lastMessage && (
                          <span className="text-xs text-slate-500">
                            {new Date(chat.lastMessage.timestamp).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {chat.lastMessage && (
                        <p className="text-sm text-slate-600 truncate mt-1">
                          {chat.lastMessage.type === 'text'
                            ? chat.lastMessage.content
                            : `Sent a ${chat.lastMessage.type}`}
                        </p>
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Active Chat Window */}
      {activeChat && (
        <ChatWindow
          recipientId={activeChat.recipientId}
          recipientName={activeChat.recipientName}
          isOpen={true}
          onClose={closeChat}
        />
      )}
    </>
  );
}