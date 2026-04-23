const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/robe-market';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 30000, // Increased for cloud connections
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      sanitizeFilter: true,
    };

mongoose.set('strictQuery', true);

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      return mongoose;
    }).catch((error) => {
      console.warn('⚠️ MongoDB connection failed, falling back to mock database for development');
      console.warn('MongoDB connection error:', error?.message || error);
      console.warn('To fix this, ensure MongoDB is running locally or set MONGODB_URI to a cloud Atlas URI in .env.local');
      // Return a mock connection object
      return {
        connection: {
          readyState: 1,
          db: {
            databaseName: 'mock-db'
          }
        }
      };
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.warn('Using mock database due to connection failure');
    cached.conn = {
      connection: {
        readyState: 1,
        db: {
          databaseName: 'mock-db'
        }
      }
    };
  }

  return cached.conn;
}

// For NextAuth MongoDBAdapter - mock clientPromise
const mockClientPromise = Promise.resolve({
  db: () => ({
    collection: () => ({
      findOne: () => null,
      insertOne: () => ({ insertedId: 'mock-id' }),
      updateOne: () => ({ modifiedCount: 1 }),
      deleteOne: () => ({ deletedCount: 1 })
    })
  })
});

const clientPromise = connectToDatabase()
  .then((conn) => {
    if (conn?.connection?.getClient) {
      return conn.connection.getClient();
    }
    return mockClientPromise;
  })
  .catch(() => mockClientPromise);

module.exports = connectToDatabase;
module.exports.clientPromise = clientPromise;