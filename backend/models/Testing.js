import mongoose from "mongoose";

const TestingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: String,
      required: true,
    },
    repo: {
      type: String,
      required: true,
    },
    overallScore: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      required: true,
    },
    testType: {
      type: String,
      default: "custom",
    },
    status: {
      type: String,
      enum: ["COMPLETED", "ERROR", "NOT_CONFIGURED", "RUNNING"],
      default: "COMPLETED",
    },
    // Use Mixed type to allow flexible results structure
    // This supports: eslint, prettier, stylelint, htmlhint, markdownlint, npm-audit, depcheck, etc.
    results: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for faster queries
TestingSchema.index({ user: 1, createdAt: -1 });
TestingSchema.index({ owner: 1, repo: 1 });

export default mongoose.model("Testing", TestingSchema);
