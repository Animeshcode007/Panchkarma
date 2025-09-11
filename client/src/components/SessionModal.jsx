import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useToast } from "./Toast";
import { motion } from "framer-motion";

export default function SessionModal({
  open,
  onClose,
  appointment,
  onUpdated,
}) {
  const { showSuccess, showError } = useToast();
  const [newStart, setNewStart] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment) setNewStart("");
  }, [appointment]);

  if (!open || !appointment) return null;

  const therapy = appointment.therapy || {};

  const handleReschedule = async () => {
    if (!newStart) return showError("Pick new date & time");
    setLoading(true);
    try {
      const res = await api.post("/appointments/reschedule", {
        appointmentId: appointment._id,
        newStartISO: new Date(newStart).toISOString(),
      });
      showSuccess("Rescheduled");
      onUpdated && onUpdated(res.data.appointment);
      onClose && onClose();
    } catch (err) {
      showError(err.response?.data?.message || "Reschedule failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this session?")) return;
    setLoading(true);
    try {
      await api.post("/appointments/cancel", {
        appointmentId: appointment._id,
      });
      showSuccess("Cancelled");
      onUpdated && onUpdated({ ...appointment, status: "cancelled" });
      onClose && onClose();
    } catch (err) {
      showError(err.response?.data?.message || "Cancel failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>

      <motion.div
        initial={{ y: 20, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: -10, scale: 0.98 }}
        className="relative bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{therapy.name}</h3>
            <div className="text-sm text-gray-600 mt-1">
              {therapy.description || "No description provided."}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600">When</div>
            <div className="font-medium">
              {new Date(appointment.startTime).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Duration: {therapy.durationMinutes || "—"} minutes
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600">Practitioner</div>
            <div className="font-medium">
              {appointment.practitioner?.name || "-"}
            </div>
            <div className="text-xs text-gray-500">
              {appointment.practitioner?.email}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold">Precautions</h4>
          <div className="text-sm text-gray-700 mt-1">
            {therapy.precautions ||
              therapy.description ||
              "Follow practitioner instructions."}
          </div>
        </div>

        <div className="mt-6 flex gap-3 items-center">
          <input
            type="datetime-local"
            value={newStart}
            onChange={(e) => setNewStart(e.target.value)}
            className="p-2 border rounded"
          />
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleReschedule}
            disabled={loading}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            Reschedule
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleCancel}
            disabled={loading}
            className="bg-red-600 text-white px-3 py-1 rounded"
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
