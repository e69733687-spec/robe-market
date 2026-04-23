const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const uri = process.env.MONGODB_URI;
console.log('URI=', uri);

(async () => {
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    console.log('Mongo connect ok', conn.connection.name, conn.connection.readyState);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Mongo test error', err.message);
    if (err.reason) console.error('reason', err.reason);
    process.exit(1);
  }
})();