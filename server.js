require("dotenv").config();
const express = require("express");
const cors = require("cors");
const emailRoutes = require('./routes/email.routes');

const app = express();

// CORS setup
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/email', emailRoutes);

// Optional: Root route to avoid "Cannot GET /"
app.get('/', (req, res) => {
  res.send("Backend is working ✅");
});

// 🔥 Export the app as a Vercel serverless function
module.exports = app;
