const mongoose = require('mongoose');

// In-memory storage for when MongoDB is not available
const inMemoryChats = new Map();
const inMemoryMessages = new Map();

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [MessageSchema],
  lastMessage: { type: Date, default: Date.now },
  typingUsers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
});

// Use mock chat storage only when the URI explicitly contains mock
const isMockDB = process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mock');

let ChatModel;

if (isMockDB) {
  console.log('🔧 Using in-memory chat storage for testing');

  // Mock Chat class
  class MockChat {
    constructor(data = {}) {
      this._id = data._id || Math.random().toString(36).substr(2, 9);
      this.participants = data.participants || [];
      this.messages = data.messages || [];
      this.lastMessage = data.lastMessage || new Date();
      this.typingUsers = data.typingUsers || [];
      this.createdAt = data.createdAt || new Date();
    }

    static async find(query = {}) {
      const chats = Array.from(inMemoryChats.values());
      if (query.participants && query.participants.$all) {
        return chats.filter(chat =>
          query.participants.$all.every(p => chat.participants.includes(p))
        );
      }
      return chats;
    }

    static async findOne(query = {}) {
      const chats = await this.find(query);
      return chats[0] || null;
    }

    static async findById(id) {
      return inMemoryChats.get(id) || null;
    }

    async save() {
      inMemoryChats.set(this._id, this);
      return this;
    }

    async populate(path) {
      // Mock populate - just return this
      return this;
    }
  }

  ChatModel = MockChat;
} else {
  ChatModel = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
}

module.exports = ChatModel;