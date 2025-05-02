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
  origin: [
    'https://rtmail.vercel.app',
    'https://office-365-sable.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  // Add this for SSE support
  exposedHeaders: ['Content-Type', 'Content-Length', 'Cache-Control', 'Last-Event-ID']
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