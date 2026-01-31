import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  githubId: String,
  name: String,
  login: String,
  email: String,
  avatar: String,
  githubAccessToken: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
