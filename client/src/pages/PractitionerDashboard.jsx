import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import { formatISO } from "date-fns";
import { AuthContext } from "../contexts/AuthContext";
import { useToast } from '../components/Toast';

export default function PractitionerDashboard() {
  const [schedule, setSchedule] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { user } = useContext(AuthContext);
  const { showError } = useToast();

  useEffect(() => {
    loadWeek();
    loadFeedbacks();
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
      console.error(err); showError('Error loading schedule');
    }
  }

  async function searchRange() {
    try {
      const res = await api.get("/appointments/practitioner/schedule", {
        params: { fromISO: from, toISO: to },
      });
      setSchedule(res.data);
    } catch (err) {
      showError('Error');
    }
  }

  async function loadFeedbacks() {
    try {
      const res = await api.get(`/feedbacks/practitioner/${user.id}`);
      setFeedbacks(res.data);
    } catch (err) {
      console.error(err);
      setFeedbacks([]);
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

      <div className="mb-6">
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

      <div>
        <h3 className="text-lg mb-2">Patient Feedbacks</h3>
        <ul>
          {feedbacks.map((f) => (
            <li key={f._id} className="p-3 border mb-2 rounded">
              <div className="font-semibold">Rating: {f.rating} / 5</div>
              <div>From: {f.patient?.name}</div>
              <div>{f.comment}</div>
              <div className="text-xs text-gray-500">
                {new Date(f.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
          {feedbacks.length === 0 && <div>No feedbacks yet</div>}
        </ul>
      </div>
    </div>
  );
}
