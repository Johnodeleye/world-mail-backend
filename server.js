require("dotenv").config();
const express = require("express");
const cors = require("cors");
const emailRoutes = require('./routes/email.routes');

const app = express();

// Enhanced CORS configuration - should come BEFORE routes
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware - ORDER MATTERS!
app.use(cors(corsOptions)); // Use this once with your options
app.use(express.json());

// Routes
app.use('/api/email', emailRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});