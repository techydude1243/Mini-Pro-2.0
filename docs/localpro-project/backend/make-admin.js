// backend/make-admin.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// PASTE YOUR EMAIL ADDRESS HERE
const adminEmail = "k.tripathi.2080@gmail.com"; 

const makeAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB...');

  const user = await User.findOneAndUpdate(
    { email: adminEmail },
    { $set: { role: 'admin' } },
    { new: true }
  );

  if (user) {
    console.log('Success! User is now an admin:');
    console.log(user);
  } else {
    console.log(`Error: User with email "${adminEmail}" not found.`);
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
};

makeAdmin().catch(console.error);