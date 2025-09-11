import React, { useEffect, useState } from "react";
import api from "../api/api";
import { formatISO } from "date-fns";

export default function PractitionerDashboard() {
  const [schedule, setSchedule] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    loadWeek();
  }, []);

  async function loadWeek() {
    const fromISO = formatISO(new Date());
    const toISO = formatISO(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    try {
      const res = await api.get("/appointments/practitioner/schedule", {
        params: { fromISO, toISO },
      });
      setSchedule(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function searchRange() {
    try {
      const res = await api.get("/appointments/practitioner/schedule", {
        params: { fromISO: from, toISO: to },
      });
      setSchedule(res.data);
    } catch (err) {
      alert("Error");
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">Practitioner Dashboard</h2>
      <div className="mb-4">
        <input
          type="datetime-local"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="p-2 border mr-2"
        />
        <input
          type="datetime-local"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="p-2 border mr-2"
        />
        <button
          onClick={searchRange}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Search
        </button>
        <button
          onClick={loadWeek}
          className="ml-2 bg-gray-200 px-3 py-1 rounded"
        >
          Load next 7 days
        </button>
      </div>

      <div>
        <h3 className="text-lg mb-2">Appointments</h3>
        <ul>
          {schedule.map((a) => (
            <li key={a._id} className="p-3 border mb-2 rounded">
              <div className="font-semibold">{a.therapy?.name}</div>
              <div>
                Patient: {a.patient?.name} -{" "}
                {new Date(a.startTime).toLocaleString()}
              </div>
            </li>
          ))}
          {schedule.length === 0 && <div>No appointments</div>}
        </ul>
      </div>
    </div>
  );
}
