// client/src/pages/PractitionerDashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import BlockTime from "../components/BlockTime";
import PatientProfile from "../components/PatientProfile";
import LogoutButton from "../components/LogoutButton";
import ManageSession from "../components/ManageSession";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";
import { formatISO } from "date-fns";

export default function PractitionerDashboard() {
  const [view, setView] = useState("daily"); // daily | weekly
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [patientProfileId, setPatientProfileId] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { showSuccess, showError } = useToast();

  const me = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    // load next 7 days schedule initially
    const now = new Date();
    const next = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    setFrom(formatISO(now));
    setTo(formatISO(next));
    loadSchedule(formatISO(now), formatISO(next));
    loadFeedbacks();
  }, []);

  async function loadSchedule(f = from, t = to) {
    try {
      const res = await api.get("/appointments/practitioner/schedule", {
        params: { fromISO: f, toISO: t },
      });
      setSchedule(res.data);
    } catch (err) {
      showError("Error loading schedule");
    }
  }

  async function loadFeedbacks() {
    try {
      const res = await api.get(`/feedbacks/practitioner/${me.id}`);
      setFeedbacks(res.data);
    } catch (err) {
      console.error(err);
      setFeedbacks([]);
    }
  }

  function openPatientProfile(patientId) {
    setPatientProfileId(patientId);
  }

  async function handleComplete(updated) {
    showSuccess("Session updated");
    await loadSchedule();
    await loadFeedbacks();
    setSelectedAppt(null);
  }

  async function searchPatients(e) {
    e.preventDefault();
    try {
      const res = await api.get("/practitioners/search-patients", {
        params: { q: searchQ },
      });
      setSearchResults(res.data);
    } catch (err) {
      showError("Error searching");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Practitioner Dashboard</h2>
        <div>
          <LogoutButton />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("daily")}
            className={`px-3 py-1 rounded ${
              view === "daily" ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`px-3 py-1 rounded ${
              view === "weekly" ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column: Schedule with ability to reschedule/cancel */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-center mb-3">
              <div>
                <strong>Manage Schedule</strong>
                <div className="text-sm text-gray-500">
                  View and manage your appointments. Click an appointment to
                  manage it.
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="p-2 border rounded"
                />
                <input
                  type="datetime-local"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="p-2 border rounded"
                />
                <button
                  onClick={() => loadSchedule(from, to)}
                  className="bg-gray-800 text-white px-3 py-1 rounded"
                >
                  Load
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {schedule.map((ap) => (
                <div
                  key={ap._id}
                  className="p-3 border rounded flex justify-between items-center hover:shadow-lg transition"
                >
                  <div>
                    <div className="font-semibold">{ap.therapy?.name}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(ap.startTime).toLocaleString()} — Patient:{" "}
                      <button
                        onClick={() => openPatientProfile(ap.patient._id)}
                        className="text-indigo-600"
                      >
                        {ap.patient?.name}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedAppt(ap)}
                      className="bg-yellow-400 text-white px-3 py-1 rounded"
                    >
                      Manage
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Cancel appointment?")) return;
                        try {
                          await api.post("/appointments/cancel", {
                            appointmentId: ap._id,
                          });
                          showSuccess("Cancelled");
                          loadSchedule(from, to);
                        } catch (e) {
                          showError("Error");
                        }
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
              {schedule.length === 0 && (
                <div className="text-gray-500 p-3">
                  No appointments in this range
                </div>
              )}
            </div>
          </div>

          {/* Manage selected appointment */}
          {selectedAppt && (
            <div className="bg-white p-4 rounded shadow">
              <h4 className="font-semibold mb-2">Manage Appointment</h4>
              <ManageSession
                appointment={selectedAppt}
                onUpdated={handleComplete}
              />
            </div>
          )}

          {/* Feedbacks & progress */}
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Review Patient Feedback</h4>
            <ul className="space-y-2">
              {feedbacks.map((f) => (
                <li key={f._id} className="p-2 border rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{f.patient?.name}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm">{f.rating} / 5</div>
                  </div>
                  <div className="text-sm mt-1">{f.comment}</div>
                </li>
              ))}
              {feedbacks.length === 0 && (
                <div className="text-gray-500">No feedback yet</div>
              )}
            </ul>
          </div>
        </div>

        {/* Right column: Block times, search, quick patient records */}
        <div className="space-y-4">
          <BlockTime
            practitionerId={me?.id}
            onChanged={() => loadSchedule(from, to)}
          />

          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold mb-2">Quick Search Patients</h4>
            <form onSubmit={searchPatients} className="flex gap-2">
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Name or email"
                className="p-2 border rounded flex-1"
              />
              <button className="bg-gray-800 text-white px-3 py-1 rounded">
                Search
              </button>
            </form>

            <div className="mt-3 space-y-2">
              {searchResults.map((p) => (
                <div
                  key={p._id}
                  className="p-2 border rounded flex justify-between items-center"
                >
                  <div>
                    {p.name}{" "}
                    <div className="text-xs text-gray-500">{p.email}</div>
                  </div>
                  <div>
                    <button
                      onClick={() => openPatientProfile(p._id)}
                      className="text-indigo-600"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppt(
                          null
                        ); /* optionally create quick appointment UI */
                      }}
                      className="ml-2 text-green-600"
                    >
                      Quick book
                    </button>
                  </div>
                </div>
              ))}
              {searchResults.length === 0 && (
                <div className="text-gray-500 mt-2">No results</div>
              )}
            </div>
          </div>

          {/* Patient profile modal */}
          <PatientProfile
            patientId={patientProfileId}
            open={!!patientProfileId}
            onClose={() => setPatientProfileId(null)}
          />
        </div>
      </div>
    </div>
  );
}
