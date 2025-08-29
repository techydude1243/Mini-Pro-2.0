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
// Enable Cross-Origin Resource Sharing (CORS) to allow frontend to communicate with backend
app.use(cors());
// Enable the express app to parse JSON formatted request bodies
app.use(express.json());
// Serve static files (like your index.html) from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// 4. DATABASE CONNECTION
// Connect to MongoDB Atlas using the connection string from the .env file
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
    process.exit(1); // Exit the process with an error code if connection fails
  });

// 5. API ROUTES
// Import the router for services
const servicesRouter = require('./routes/services');
// Tell the app to use the services router for any URL starting with /api/services
app.use('/api/services', servicesRouter);

// Add these two lines for providers
const providersRouter = require('./routes/providers');
app.use('/api/providers', providersRouter);
// ... (other routes) ...

// Add these two lines for users
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);
/*
// --- PLACEHOLDER FOR FUTURE ROUTES ---
// When you create your providers.js route file, you will uncomment lines like these:
// const providersRouter = require('./routes/providers');
// app.use('/api/providers', providersRouter);
*/


// 6. DEFINE PORT AND START SERVER
// Use the port from environment variables for deployment, or 5000 for local development
const PORT = process.env.PORT || 5000;

// Start the server and listen for incoming requests on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});