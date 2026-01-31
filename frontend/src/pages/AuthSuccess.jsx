import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../utils/axiosConfig.js";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const authenticate = async () => {
      try {
        const params = new URLSearchParams(search);
        const token = params.get("token");

        console.log("🔍 AuthSuccess Page - URL search params:", search);
        console.log("🔑 Token extracted:", token ? "✓ Found" : "✗ Not found");

        if (!token) {
          console.error("❌ No token received from auth callback");
          navigate("/", { replace: true });
          return;
        }

        // Store token FIRST
        localStorage.setItem("token", token);
        console.log("💾 Token stored in localStorage");

        // Fetch user data with explicit Authorization header
        console.log("📡 Calling /auth/me endpoint with token...");

        const userRes = await api.get(`/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("✅ /auth/me response received:", userRes.data);

        // Store user data
        localStorage.setItem("user", JSON.stringify(userRes.data));
        console.log("💾 User data stored in localStorage");

        // Redirect to dashboard
        console.log("🚀 Redirecting to dashboard in 1.5 seconds...");
        setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      } catch (err) {
        console.error("❌ Authentication failed - Error details:");
        console.error("   Message:", err.message);
        console.error("   Status:", err.response?.status);
        console.error("   Data:", err.response?.data);
        console.error("   Full error:", err);

        localStorage.removeItem("token");
        navigate("/", { replace: true });
      }
    };

    authenticate();
  }, [search, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Welcome!</h1>
        <p className="text-xl text-purple-100 mb-2">
          Authenticating your account...
        </p>
        <p className="text-purple-200">Redirecting to dashboard</p>
      </div>
    </div>
  );
}
