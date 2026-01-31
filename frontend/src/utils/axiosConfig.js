import axios from "axios";

// Configure axios defaults
const apiUrl = import.meta.env.VITE_API_URL || "https://code-review-szuc.onrender.com";
console.log("🔧 Axios Config - API URL:", apiUrl);
console.log("🔧 Environment Variables:", import.meta.env);

const api = axios.create({
  baseURL: apiUrl,
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
