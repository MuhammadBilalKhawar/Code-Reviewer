import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// Validate API key
if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is missing in .env");
}

// Initialize Groq client
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Set default LLM model
export const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

console.log("✅ Groq client initialized with model:", GROQ_MODEL);
