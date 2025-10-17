// client/src/components/LogoutButton.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useToast } from "./Toast";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Logout button with confirmation modal.
 * Clears localStorage token/user, optionally calls server logout, disconnects socket, then navigates to /login.
 */
export default function LogoutButton({ redirectTo = "/login" }) {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function performLogout() {
    setLoading(true);
    try {
      // try server-side logout (if exists) but don't fail if it doesn't
      try {
        await api.post("/auth/logout");
      } catch (e) {
        // ignore server errors for logout
      }

      // clear client side auth
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // disconnect socket if used
      try {
        if (window.socket && typeof window.socket.disconnect === "function") {
          window.socket.disconnect();
        }
      } catch (e) {
        /* ignore */
      }

      showSuccess("Logged out");
      setOpen(false);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Logout error", err);
      showError("Logout failed — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Logout"
        className="bg-red-600 text-white px-3 py-1 rounded hover:opacity-95"
        style={{ minWidth: 96 }}
      >
        Logout
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black opacity-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ y: 12, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -8, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="relative bg-white rounded-lg w-full max-w-md p-5 shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Confirm logout</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Are you sure you want to logout? You'll be returned to the
                    login screen.
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-1 rounded border bg-gray-100"
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  onClick={performLogout}
                  className="px-3 py-1 rounded bg-red-600 text-white"
                  disabled={loading}
                >
                  {loading ? "Logging out..." : "Logout"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
