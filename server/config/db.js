// server/config/db.js
const mongoose = require('mongoose');

async function connectDB(mongoUri) {
  try {
    if (!mongoUri) {
      console.error('❌ MONGO_URI is not defined. Make sure you created server/.env and that dotenv is loaded.');
      // helpful debug logging
      console.error('process.env.MONGO_URI =>', process.env.MONGO_URI);
      throw new Error('MONGO_URI missing');
    }
    // options recommended
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // mongoose >=6 removed this option
      // useFindAndModify: false,
    };
    await mongoose.connect(mongoUri, opts);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    // rethrow so nodemon shows crash and you fix config
    throw err;
  }
}

module.exports = connectDB;
