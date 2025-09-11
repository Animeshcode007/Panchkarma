import React, { useEffect, useState } from "react";
import api from "../api/api";
import { formatISO } from "date-fns";

export default function AppointmentBooking({ onBooked }) {
  const [therapies, setTherapies] = useState([]);
  const [therapyId, setTherapyId] = useState("");
  const [start, setStart] = useState("");

  useEffect(() => {
    loadTherapies();
  }, []);

  async function loadTherapies() {
    try {
      // fetch therapies - admin route; but users with patient role can use it if token present
      const res = await api.get("/admin/therapies");
      setTherapies(res.data);
    } catch (err) {
      console.error(err);
      setTherapies([]);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!therapyId || !start) return alert("Pick therapy and start time");
    try {
      await api.post("/appointments/book", {
        therapyId,
        startTimeISO: formatISO(new Date(start)),
      });
      alert("Booked successfully");
      setTherapyId("");
      setStart("");
      onBooked && onBooked();
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 p-4 border rounded">
      <h3 className="mb-2">Book a session</h3>
      <select
        value={therapyId}
        onChange={(e) => setTherapyId(e.target.value)}
        className="w-full p-2 mb-2 border"
      >
        <option value="">Choose therapy</option>
        {therapies.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name} ({t.durationMinutes} min)
          </option>
        ))}
      </select>

      <input
        type="datetime-local"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="w-full p-2 mb-2 border"
      />
      <button className="bg-green-600 text-white px-3 py-1 rounded">
        Book
      </button>
    </form>
  );
}
