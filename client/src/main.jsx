import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { ToastProvider } from "./components/Toast";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import FAQPage from "./pages/FAQPage"; 
import PatientDashboard from "./pages/PatientDashboard";
import PractitionerDashboard from "./pages/PractitionerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./index.css";

/**
 * AppRoutes: keep LandingPage on "/" but protect /dashboard.
 * Use RequireAuth that preserves "from" so login can redirect back.
 */
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/faq" element={<FAQPage />} />

      {/* Protect the dashboard route */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RoleRouter />
          </RequireAuth>
        }
      />

      {/* Optionally support /dashboard/* if you add nested routes later */}
      <Route
        path="/dashboard/*"
        element={
          <RequireAuth>
            <RoleRouter />
          </RequireAuth>
        }
      />

      {/* Fallback: unknown routes go home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * RequireAuth now preserves the attempted location in state so Login can redirect back.
 */
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    // send them to /login and remember where they were going
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

/**
 * RoleRouter: choose the dashboard component based on user.role saved in localStorage.
 * If user is missing or malformed, send to login.
 */
function RoleRouter() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "patient") return <PatientDashboard />;
  if (user.role === "practitioner") return <PractitionerDashboard />;
  if (user.role === "admin") return <AdminDashboard />;

  return <div>Role not supported</div>;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
              <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
