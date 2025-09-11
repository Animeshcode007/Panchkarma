// client/src/components/TakeAppointment.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useToast } from "./Toast";
import { motion } from "framer-motion";
import { formatISO } from "date-fns";

export default function TakeAppointment({ onBooked }) {
  const [practitioners, setPractitioners] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [practitionerId, setPractitionerId] = useState("");
  const [therapyId, setTherapyId] = useState("");
  const [datetime, setDatetime] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadPractitioners();
    loadTherapies();
  }, []);

  async function loadPractitioners() {
    try {
      const res = await api.get("/practitioners/list");
      setPractitioners(res.data);
    } catch (err) {
      console.error(err);
      setPractitioners([]);
    }
  }

  async function loadTherapies() {
    try {
      const res = await api.get("/therapies");
      setTherapies(res.data);
    } catch (err) {
      console.error(err);
      setTherapies([]);
    }
  }

  async function checkAvailability() {
    if (!practitionerId || !datetime || !therapyId)
      return showError("Select practitioner, therapy and date/time first");
    setChecking(true);
    setAvailable(null);
    try {
      const res = await api.post("/appointments/check-availability", {
        practitionerId,
        startTimeISO: new Date(datetime).toISOString(),
        therapyId,
      });
      setAvailable(res.data.available);
      showSuccess(
        res.data.available
          ? "Practitioner is available"
          : "Practitioner is NOT available"
      );
    } catch (err) {
      showError(err.response?.data?.message || "Error checking availability");
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  }

  async function book() {
    if (!practitionerId || !datetime || !therapyId)
      return showError("Select practitioner, therapy and date/time first");
    try {
      await api.post("/appointments/book", {
        practitionerId,
        therapyId,
        startTimeISO: new Date(datetime).toISOString(),
      });
      showSuccess("Booked with selected practitioner");
      setPractitionerId("");
      setTherapyId("");
      setDatetime("");
      setAvailable(null);
      onBooked && onBooked();
    } catch (err) {
      showError(err.response?.data?.message || "Booking failed");
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h4 className="font-semibold mb-2">Book with a practitioner</h4>

      <div className="space-y-2">
        <select
          value={practitionerId}
          onChange={(e) => setPractitionerId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select practitioner</option>
          {practitioners.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} — {p.email}
            </option>
          ))}
        </select>

        <select
          value={therapyId}
          onChange={(e) => setTherapyId(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select therapy</option>
          {therapies.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} ({t.durationMinutes} min)
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={checkAvailability}
            className="bg-indigo-600 text-white px-3 py-1 rounded"
            disabled={checking}
          >
            {checking ? "Checking..." : "Check availability"}
          </motion.button>

          <button
            onClick={book}
            className={`px-3 py-1 rounded ${
              available === false
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-green-600 text-white"
            }`}
            disabled={available === false}
          >
            Book
          </button>
        </div>

        {available === true && (
          <div className="text-sm text-green-700 mt-1">Available ✅</div>
        )}
        {available === false && (
          <div className="text-sm text-red-600 mt-1">Not available ❌</div>
        )}
      </div>
    </div>
  );
}
