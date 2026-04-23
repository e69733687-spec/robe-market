import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useSession } from 'next-auth/react';
import OptimizedImage from './OptimizedImage';

export default function ChatWindow({ recipientId, recipientName, isOpen, onClose }) {
  const { socket, isConnected, onlineUsers } = useSocket();
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat history
  useEffect(() => {
    if (isOpen && session?.user?.id && recipientId) {
      loadMessages();
    }
  }, [isOpen, session?.user?.id, recipientId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleNewMessage = (data) => {
      if (data.senderId === recipientId || data.message.sender._id === recipientId) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    const handleTypingStart = (data) => {
      if (data.userId === recipientId) {
        setTypingUsers(prev => [...prev, data.userId]);
      }
    };

    const handleTypingStop = (data) => {
      if (data.userId === recipientId) {
        setTypingUsers(prev => prev.filter(id => id !== data.userId));
      }
    };

    const handleMessagesRead = (data) => {
      if (data.readerId === recipientId) {
        setMessages(prev => prev.map(msg =>
          msg.receiver._id === recipientId ? { ...msg, read: true } : msg
        ));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, isOpen, recipientId]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/messages?userId=${session.user.id}&otherUserId=${recipientId}`);
      const data = await response.json();
      setMessages(data.messages || []);
      setTypingUsers(data.typingUsers || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !isConnected) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    // Stop typing indicator
    handleTypingStop();

    socket.emit('private_message', {
      senderId: session.user.id,
      receiverId: recipientId,
      content: messageContent,
      type: 'text'
    });
  };

  const handleTypingStart = () => {
    if (!socket || isTyping) return;

    setIsTyping(true);
    socket.emit('typing_start', {
      senderId: session.user.id,
      receiverId: recipientId
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
  };

  const handleTypingStop = () => {
    if (!socket || !isTyping) return;

    setIsTyping(false);
    socket.emit('typing_stop', {
      senderId: session.user.id,
      receiverId: recipientId
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (e.target.value && !isTyping) {
      handleTypingStart();
    } else if (!e.target.value && isTyping) {
      handleTypingStop();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !socket || !isConnected) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      alert('File type not supported. Please upload images, PDFs, or text files.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Notify recipient about upload start
      socket.emit('file_upload_start', {
        fileName: file.name,
        fileSize: file.size,
        receiverId: recipientId
      });

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'robe-market');

      // Upload to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();

      // Send file message
      const fileType = file.type.startsWith('image/') ? 'image' : 'file';

      socket.emit('private_message', {
        senderId: session.user.id,
        receiverId: recipientId,
        content: fileType === 'image' ? 'Sent an image' : `Sent ${file.name}`,
        type: fileType,
        fileUrl: uploadData.secure_url,
        fileName: file.name
      });

      // Notify recipient about upload completion
      socket.emit('file_upload_complete', {
        fileUrl: uploadData.secure_url,
        fileName: file.name,
        receiverId: recipientId
      });

    } catch (error) {
      console.error('File upload failed:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isOpen) return null;

  const isOnline = onlineUsers.has(recipientId);

  return (
    <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-slate-600">
                {recipientName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{recipientName}</h3>
            <p className="text-xs text-slate-500">
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender._id === session.user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.sender._id === session.user.id
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  {message.type === 'text' ? (
                    <p className="text-sm">{message.content}</p>
                  ) : message.type === 'image' ? (
                    <div className="max-w-48">
                      <OptimizedImage
                        src={message.fileUrl}
                        alt={message.fileName}
                        width={200}
                        height={150}
                        className="rounded"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm">{message.fileName}</span>
                    </div>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                    {message.sender._id === session.user.id && (
                      <span className="ml-1">
                        {message.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-3 py-2 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-slate-200">
        {isUploading && (
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
              <span>Uploading... {uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf,.txt"
            className="hidden"
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || !isConnected}
            className="p-2 text-slate-400 hover:text-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Attach file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onFocus={markMessagesAsRead}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={!isConnected || isUploading}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected || isUploading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-1">Disconnected - trying to reconnect...</p>
        )}
      </form>
    </div>
  );
}