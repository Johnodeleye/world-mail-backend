require("dotenv").config();
const express = require("express");
const cors = require("cors");
const emailRoutes = require('./routes/email.routes');
const userRoutes = require('./routes/user.routes');
const { PrismaClient } = require("@prisma/client");
const authRoutes = require('./routes/auth.routes');
const dashRoutes = require('./routes/dashboard.routes');
const app = express();
const prisma = new PrismaClient();

// CORS setup
const corsOptions = {
  origin: (origin, callback) => {
    // List of allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'https://office-365-sable.vercel.app'
    ];

    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // If not allowed
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/email', emailRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashRoutes);

app.get("/", (req, res) => {
  res.send("Mail API is running...");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected!");
  } catch (error) {
    console.error("❌ Database connection failed!", error);
    process.exit(1); // Exit if DB connection fails
  }
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  await checkDatabaseConnection();
});

module.exports = app;