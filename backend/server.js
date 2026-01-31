import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import githubRoutes from "./routes/githubRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();

const app = express();

// Configure CORS for Vercel frontend
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => res.send("AI Code Review SaaS Backend Running"));

// Debug: Log environment variables on startup
app.get("/debug/config", (req, res) => {
  res.json({
    CLIENT_URL: process.env.CLIENT_URL,
    SERVER_URL: process.env.SERVER_URL,
    PORT: process.env.PORT,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? "✓ Set" : "✗ Missing",
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET
      ? "✓ Set"
      : "✗ Missing",
    JWT_SECRET: process.env.JWT_SECRET ? "✓ Set" : "✗ Missing",
    MONGO_URI: process.env.MONGO_URI ? "✓ Set" : "✗ Missing",
  });
});

app.use("/auth", authRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/reviews", reviewRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected Successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Frontend URL: ${process.env.CLIENT_URL}`);
      console.log(
        `🔗 OAuth Callback: ${process.env.SERVER_URL}/auth/github/callback`
      );

      // Log auth configuration
      if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
        console.log("✅ GitHub OAuth configured");
      } else {
        console.warn("⚠️  GitHub OAuth not fully configured");
      }
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
