// client/src/components/ManageSession.jsx
import React, { useState } from "react";
import api from "../api/api";
import { useToast } from "./Toast";
import { motion } from "framer-motion";

export default function ManageSession({ appointment, onUpdated }) {
  const [notes, setNotes] = useState("");
  const [metricsJSON, setMetricsJSON] = useState("{}");
  const { showSuccess, showError } = useToast();

  async function submitComplete() {
    let metrics = {};
    try {
      metrics = JSON.parse(metricsJSON || "{}");
    } catch (e) {
      return showError("Metrics must be valid JSON");
    }
    try {
      const res = await api.post("/appointments/complete", {
        appointmentId: appointment._id,
        progressNotes: notes,
        metrics,
      });
      showSuccess("Marked complete");
      onUpdated && onUpdated(res.data);
    } catch (err) {
      showError(err.response?.data?.message || "Error");
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h4 className="font-semibold mb-2">Manage Session</h4>
      <div className="mb-2">
        <strong>{appointment.therapy?.name}</strong>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Progress notes"
        className="w-full p-2 border rounded mb-2"
      />
      <textarea
        value={metricsJSON}
        onChange={(e) => setMetricsJSON(e.target.value)}
        placeholder='Metrics JSON e.g. {"pain":3, "mobility":60}'
        className="w-full p-2 border rounded mb-2"
      />
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={submitComplete}
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Mark Complete
      </motion.button>
    </div>
  );
}
