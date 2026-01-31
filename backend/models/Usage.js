import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  reviewsRun: { type: Number, default: 0 },
  lastReset: { type: Date, default: Date.now },
});

export default mongoose.model("Usage", usageSchema);
