import { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useChat } from '../context/ChatContext';
import ChatWindow from '../components/ChatWindow';

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const { chats, openChat, loadingChats, activeChat } = useChat();

  useEffect(() => {
    if (status === 'authenticated' && chats.length === 0) {
      // ChatProvider already fetches chats, but we can keep page responsive.
    }
  }, [status, chats.length]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Loading your messages...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl bg-white p-10 text-center shadow-lg">
          <h1 className="text-2xl font-semibold text-slate-900">Please sign in to view your messages</h1>
          <p className="mt-3 text-slate-600">Your conversation history is saved here, ready for quick access.</p>
          <Link href="/login" className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Messages</h1>
              <p className="mt-2 text-slate-600">Review your chat history, continue conversations, and connect with sellers instantly.</p>
            </div>
            <Link href="/classifieds" className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">
              Browse Marketplace
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Conversations</h2>
                <span className="text-sm text-slate-500">{chats.length} chats</span>
              </div>

              {loadingChats ? (
                <div className="mt-6 flex items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : chats.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                  No conversations yet. Start a chat from any product listing.
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {chats.map((chat) => (
                    <button
                      key={chat._id}
                      onClick={() => openChat(chat.otherParticipant._id, chat.otherParticipant.name)}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{chat.otherParticipant.name}</p>
                          <p className="text-sm text-slate-600 mt-1 truncate">{chat.lastMessage?.type === 'text' ? chat.lastMessage.content : `Sent a ${chat.lastMessage?.type}`}</p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <span className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">{chat.unreadCount}</span>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>{chat.lastActivity ? new Date(chat.lastActivity).toLocaleString() : 'No activity yet'}</span>
                        <span>{chat.lastMessage?.sender?.name === session.user.name ? 'You' : chat.otherParticipant.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <ChatWindow />
            {!activeChat && (
              <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-slate-700">Select a conversation to continue the chat.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
