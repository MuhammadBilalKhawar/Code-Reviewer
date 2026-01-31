import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const githubLogin = (req, res) => {
  try {
    const serverUrl = process.env.SERVER_URL;
    if (!serverUrl) {
      console.error("SERVER_URL is not set in environment");
      return res
        .status(500)
        .json({ message: "Server not properly configured" });
    }

    const redirectUri = `${serverUrl}/auth/github/callback`;

    if (!process.env.GITHUB_CLIENT_ID) {
      console.error("GITHUB_CLIENT_ID is not set");
      return res.status(500).json({ message: "GitHub OAuth not configured" });
    }

    const authorizeUrl = `https://github.com/login/oauth/authorize?client_id=${
      process.env.GITHUB_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

    console.log("🔐 Redirecting to GitHub OAuth:", {
      clientId: process.env.GITHUB_CLIENT_ID.substring(0, 5) + "...",
      redirectUri,
    });

    return res.redirect(authorizeUrl);
  } catch (err) {
    console.error("GitHub login error:", err.message);
    return res
      .status(500)
      .json({ message: "Failed to initiate GitHub login", error: err.message });
  }
};

export const githubCallback = async (req, res) => {
  try {
    const code = req.query.code;
    const error = req.query.error;
    const errorDescription = req.query.error_description;

    // Handle GitHub OAuth error
    if (error) {
      console.error("GitHub OAuth error:", error, errorDescription);
      return res.redirect(
        `${process.env.CLIENT_URL}/?error=${encodeURIComponent(
          errorDescription || error
        )}`
      );
    }

    if (!code) {
      console.error("No authorization code provided");
      return res.redirect(
        `${process.env.CLIENT_URL}/?error=${encodeURIComponent(
          "No authorization code received"
        )}`
      );
    }

    console.log("🔄 Exchanging code for token...");

    const tokenRes = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    if (tokenRes.data.error) {
      console.error("GitHub token error:", tokenRes.data.error);
      return res.redirect(
        `${process.env.CLIENT_URL}/?error=${encodeURIComponent(
          tokenRes.data.error_description || "Failed to get access token"
        )}`
      );
    }

    const access_token = tokenRes.data.access_token;

    if (!access_token) {
      console.error("No access token received:", tokenRes.data);
      return res.redirect(
        `${process.env.CLIENT_URL}/?error=${encodeURIComponent(
          "Failed to get GitHub access token"
        )}`
      );
    }

    console.log("✅ Token received, fetching user profile...");

    const profile = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    console.log("📦 Creating/updating user:", profile.data.login);

    let user = await User.findOne({ githubId: profile.data.id });

    if (!user) {
      user = await User.create({
        githubId: profile.data.id,
        name: profile.data.name,
        email: profile.data.email,
        avatar: profile.data.avatar_url,
        login: profile.data.login,
        githubAccessToken: access_token,
      });
      console.log("✨ New user created:", user._id);
    } else {
      user.githubAccessToken = access_token;
      await user.save();
      console.log("🔄 User updated:", user._id);
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    const clientUrl = process.env.CLIENT_URL;
    const redirectUrl = `${clientUrl}/auth-success?token=${jwtToken}`;

    console.log("✅ Auth successful, redirecting to:", clientUrl);

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ GitHub callback error:", err.message);
    const errorMessage = err.message.substring(0, 100);
    return res.redirect(
      `${process.env.CLIENT_URL}/?error=${encodeURIComponent(errorMessage)}`
    );
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      githubId: req.user.githubId,
      name: req.user.name,
      login: req.user.login,
      email: req.user.email,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};
