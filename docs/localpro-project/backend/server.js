// 1. IMPORTS
// Import required packages
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables from .env file
require('dotenv').config();

// 2. INITIALIZE EXPRESS APP
const app = express();

// 3. MIDDLEWARE
// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());
// Enable the express app to parse JSON formatted request bodies
app.use(express.json());
// Serve static files (like your index.html) from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// 4. DATABASE CONNECTION
// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1); // Exit the process with an error code if connection fails
  });

// 5. API ROUTES
// Import all routers in one block
const servicesRouter = require('./routes/services');
const providersRouter = require('./routes/providers');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin');
const reviewsRouter = require('./routes/reviews');
const bookingsRouter = require('./routes/bookings');

// Use all routers in one block
app.use('/api/services', servicesRouter);
app.use('/api/providers', providersRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/bookings', bookingsRouter);


// 6. DEFINE PORT AND START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
