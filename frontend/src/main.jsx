import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import AuthSuccess from "./pages/AuthSuccess.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Repositories from "./pages/Repositories.jsx";
import RepositoryDetail from "./pages/RepositoryDetail.jsx";
import PullRequestDetail from "./pages/PullRequestDetail.jsx";
import CommitDetail from "./pages/CommitDetail.jsx";
import Settings from "./pages/Settings.jsx";
import ReviewResults from "./pages/ReviewResults.jsx";
import Documentation from "./pages/Documentation.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repositories"
            element={
              <ProtectedRoute>
                <Repositories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repos/:owner/:repo"
            element={
              <ProtectedRoute>
                <RepositoryDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repos/:owner/:repo/pull/:number"
            element={
              <ProtectedRoute>
                <PullRequestDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews/:id"
            element={
              <ProtectedRoute>
                <ReviewResults />
              </ProtectedRoute>
            }
          />
          <Route
            path="/repos/:owner/:repo/commit/:sha"
            element={
              <ProtectedRoute>
                <CommitDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/documentation"
            element={
              <ProtectedRoute>
                <Documentation />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
