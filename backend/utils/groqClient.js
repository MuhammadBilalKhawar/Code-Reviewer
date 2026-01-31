import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

// 1️⃣ Validate API key
if (!process.env.GROQ_API_KEY) {
  throw new Error("❌ GROQ_API_KEY is missing in .env");
}

// 2️⃣ Initialize Groq client
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 3️⃣ Set your default LLM model (use current supported model)
export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile"; // Current supported model

console.log("✅ Groq client initialized with model:", GROQ_MODEL);
