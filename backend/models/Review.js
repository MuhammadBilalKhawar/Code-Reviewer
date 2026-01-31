import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  owner: String,
  repo: String,
  pullNumber: Number,
  commitSha: String, // For commit reviews
  commitMessage: String, // For commit reviews
  summary: String,
  issues: Array, // array from Groq
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Review", reviewSchema);
