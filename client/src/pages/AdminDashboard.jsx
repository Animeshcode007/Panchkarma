// client/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import LogoutButton from "../components/LogoutButton";
import { useToast } from "../components/Toast";

/**
 * Admin Dashboard (updated)
 * - Load practitioners now opens a modal list (no alert)
 * - Manage therapies opens a modal list (no alert)
 * - Keeps create/assign flows the same
 *
 * Replace your current AdminDashboard.jsx with this file.
 */

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg w-full max-w-3xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-600">
            ✕
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [activity, setActivity] = useState({
    activeCount: 0,
    totalPatients: 0,
    totalPractitioners: 0,
  });
  const [upcoming, setUpcoming] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [reports, setReports] = useState({ completedThisWeek: 0, popular: [] });

  // management forms state
  const [prName, setPrName] = useState("");
  const [prEmail, setPrEmail] = useState("");
  const [prPass, setPrPass] = useState("");

  const [patName, setPatName] = useState("");
  const [patEmail, setPatEmail] = useState("");
  const [patPass, setPatPass] = useState("");

  const [therapyName, setTherapyName] = useState("");
  const [therapyDuration, setTherapyDuration] = useState(60);

  // assign practitioner
  const [assignPatientQ, setAssignPatientQ] = useState("");
  const [assignPatientResults, setAssignPatientResults] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [selectedPatientToAssign, setSelectedPatientToAssign] = useState("");
  const [selectedPractitionerToAssign, setSelectedPractitionerToAssign] =
    useState("");

  // modal states
  const [practitionersModalOpen, setPractitionersModalOpen] = useState(false);
  const [therapiesModalOpen, setTherapiesModalOpen] = useState(false);
  const [therapies, setTherapies] = useState([]);

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadActivity();
    loadUpcoming();
    loadFeedbacks();
    loadReports();
    // do not auto-load practitioners or therapies until user clicks
  }, []);

  async function loadActivity() {
    try {
      const res = await api.get("/admin/stats/active-patients");
      setActivity(res.data);
    } catch (err) {
      console.error(err);
      showError("Failed to load activity");
    }
  }

  async function loadUpcoming() {
    try {
      const res = await api.get("/admin/upcoming-appointments");
      setUpcoming(res.data);
    } catch (err) {
      console.error(err);
      showError("Failed to load upcoming appointments");
    }
  }

  async function loadFeedbacks() {
    try {
      const res = await api.get("/admin/recent-feedbacks");
      setFeedbacks(res.data);
    } catch (err) {
      console.error(err);
      showError("Failed to load feedbacks");
    }
  }

  async function loadReports() {
    try {
      const res = await api.get("/admin/reports/summary");
      setReports(res.data);
    } catch (err) {
      console.error(err);
      showError("Failed to load reports");
    }
  }

  async function loadPractitioners() {
    try {
      const res = await api.get("/admin/practitioners/list");
      setPractitioners(res.data || []);
      setPractitionersModalOpen(true);
    } catch (err) {
      console.error(err);
      showError("Failed to load practitioners");
    }
  }

  async function loadTherapies() {
    try {
      const res = await api.get("/admin/therapies");
      setTherapies(res.data || []);
      setTherapiesModalOpen(true);
    } catch (err) {
      console.error(err);
      showError("Failed to load therapies");
    }
  }

  // create practitioner
  async function createPractitioner(e) {
    e.preventDefault();
    try {
      await api.post("/admin/practitioner", {
        name: prName,
        email: prEmail,
        password: prPass,
      });
      showSuccess("Practitioner created");
      setPrName("");
      setPrEmail("");
      setPrPass("");
    } catch (err) {
      showError(err.response?.data?.message || "Error creating practitioner");
    }
  }

  // create patient
  async function createPatient(e) {
    e.preventDefault();
    try {
      await api.post("/admin/patient", {
        name: patName,
        email: patEmail,
        password: patPass,
      });
      showSuccess("Patient created");
      setPatName("");
      setPatEmail("");
      setPatPass("");
    } catch (err) {
      showError(err.response?.data?.message || "Error creating patient");
    }
  }

  // create therapy
  async function createTherapy(e) {
    e.preventDefault();
    try {
      await api.post("/admin/therapy", {
        name: therapyName,
        description: "",
        durationMinutes: Number(therapyDuration),
      });
      showSuccess("Therapy created");
      setTherapyName("");
      setTherapyDuration(60);
    } catch (err) {
      showError(err.response?.data?.message || "Error creating therapy");
    }
  }

  // assign patient search
  async function searchAssignPatients(e) {
    e.preventDefault();
    try {
      const res = await api.get("/admin/patients/search", {
        params: { q: assignPatientQ },
      });
      setAssignPatientResults(res.data);
    } catch (err) {
      showError("Search failed");
    }
  }

  async function assignPractitioner() {
    if (!selectedPatientToAssign || !selectedPractitionerToAssign)
      return showError("Select patient and practitioner");
    try {
      await api.post("/admin/assign", {
        patientId: selectedPatientToAssign,
        practitionerId: selectedPractitionerToAssign,
      });
      showSuccess("Assigned successfully");
      setAssignPatientQ("");
      setAssignPatientResults([]);
      setSelectedPatientToAssign("");
      setSelectedPractitionerToAssign("");
      loadActivity();
    } catch (err) {
      showError(err.response?.data?.message || "Assign failed");
    }
  }

  // small helper: view practitioner quick action (copy email)
  function copyToClipboard(text) {
    navigator.clipboard?.writeText(text || "");
    showSuccess("Copied to clipboard");
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="flex items-center gap-3">
        <LogoutButton />
      </div>
      {/* Clinic Activity */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">
            Active patients (last 30 days)
          </div>
          <div className="text-2xl font-bold">{activity.activeCount}</div>
          <div className="text-sm small-muted mt-1">
            Total patients: {activity.totalPatients}
          </div>
          <div className="text-sm small-muted">
            Total practitioners: {activity.totalPractitioners}
          </div>
          <button
            onClick={loadActivity}
            className="mt-3 bg-indigo-600 text-white px-3 py-1 rounded"
          >
            Refresh
          </button>
        </div>

        {/* Upcoming appointments */}
        <div className="p-4 border rounded col-span-2">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">Upcoming appointments</div>
              <div className="text-lg font-semibold">
                Across all practitioners
              </div>
            </div>
            <button
              onClick={loadUpcoming}
              className="bg-gray-200 px-3 py-1 rounded"
            >
              Refresh
            </button>
          </div>

          <ul className="mt-3 space-y-2 max-h-64 overflow-auto">
            {upcoming.map((a) => (
              <li
                key={a._id}
                className="p-2 border rounded flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    {a.therapy?.name} — {a.practitioner?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(a.startTime).toLocaleString()} — {a.patient?.name}
                  </div>
                </div>
                <div className="text-sm">
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.get(`/appointments/${a._id}`);
                        showSuccess("Loaded appointment");
                        console.log(res.data); /* optional: open modal */
                      } catch (e) {
                        showError("Failed to load appointment");
                      }
                    }}
                    className="text-indigo-600"
                  >
                    View
                  </button>
                </div>
              </li>
            ))}
            {upcoming.length === 0 && (
              <div className="text-gray-500">No upcoming appointments</div>
            )}
          </ul>
        </div>
      </div>

      {/* Recent feedbacks & quick links */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">
            Recent feedback highlights
          </div>
          <div className="mt-2 space-y-2 max-h-64 overflow-auto">
            {feedbacks.map((f) => (
              <div key={f._id} className="p-2 border rounded">
                <div className="flex justify-between">
                  <div className="font-medium">{f.patient?.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(f.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm mt-1">
                  Rating: {f.rating} — {f.comment?.slice(0, 120)}
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && (
              <div className="text-gray-500">No feedbacks</div>
            )}
          </div>
        </div>

        <div className="p-4 border rounded col-span-2">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">Quick Management</div>
              <div className="text-lg font-semibold">Direct actions</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadPractitioners}
                className="bg-indigo-600 text-white px-3 py-1 rounded"
              >
                Load practitioners
              </button>
              <button
                onClick={loadTherapies}
                className="bg-gray-200 px-3 py-1 rounded"
              >
                Open therapies
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">Manage Practitioners</div>
            </div>

            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">Manage Therapies</div>
            </div>

            <div className="p-3 border rounded">
              <div className="text-sm text-gray-500">Patient Management</div>
            </div>
          </div>

          {/* Create forms */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <form onSubmit={createPractitioner} className="p-3 border rounded">
              <div className="font-semibold">Add Practitioner</div>
              <input
                value={prName}
                onChange={(e) => setPrName(e.target.value)}
                placeholder="Name"
                className="w-full p-2 border mt-2"
              />
              <input
                value={prEmail}
                onChange={(e) => setPrEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-2 border mt-2"
              />
              <input
                value={prPass}
                onChange={(e) => setPrPass(e.target.value)}
                placeholder="Password"
                type="password"
                className="w-full p-2 border mt-2"
              />
              <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded">
                Create
              </button>
            </form>

            <form onSubmit={createPatient} className="p-3 border rounded">
              <div className="font-semibold">Add Patient</div>
              <input
                value={patName}
                onChange={(e) => setPatName(e.target.value)}
                placeholder="Name"
                className="w-full p-2 border mt-2"
              />
              <input
                value={patEmail}
                onChange={(e) => setPatEmail(e.target.value)}
                placeholder="Email"
                className="w-full p-2 border mt-2"
              />
              <input
                value={patPass}
                onChange={(e) => setPatPass(e.target.value)}
                placeholder="Password"
                type="password"
                className="w-full p-2 border mt-2"
              />
              <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded">
                Create
              </button>
            </form>

            <form onSubmit={createTherapy} className="p-3 border rounded">
              <div className="font-semibold">Add Therapy</div>
              <input
                value={therapyName}
                onChange={(e) => setTherapyName(e.target.value)}
                placeholder="Therapy name"
                className="w-full p-2 border mt-2"
              />
              <input
                value={therapyDuration}
                onChange={(e) => setTherapyDuration(e.target.value)}
                placeholder="Duration minutes"
                type="number"
                className="w-full p-2 border mt-2"
              />
              <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded">
                Create
              </button>
            </form>
          </div>

          {/* Assign practitioner to patient */}
          <div className="mt-4 p-3 border rounded">
            <div className="font-semibold">Assign Practitioner to Patient</div>
            <form onSubmit={searchAssignPatients} className="flex gap-2 mt-2">
              <input
                value={assignPatientQ}
                onChange={(e) => setAssignPatientQ(e.target.value)}
                placeholder="Search patient name or email"
                className="p-2 border flex-1"
              />
              <button className="bg-gray-200 px-3 py-1 rounded">Search</button>
            </form>

            <div className="mt-2">
              {assignPatientResults.map((p) => (
                <div
                  key={p._id}
                  className="p-2 border rounded mb-2 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.email}</div>
                    <div className="text-xs text-gray-500">
                      {p.assignedPractitioner
                        ? `Assigned: ${p.assignedPractitioner.name}`
                        : "No assigned practitioner"}
                    </div>
                  </div>
                  <div>
                    <select
                      value={selectedPractitionerToAssign}
                      onChange={(e) =>
                        setSelectedPractitionerToAssign(e.target.value)
                      }
                      className="p-2 border rounded"
                    >
                      <option value="">Select practitioner</option>
                      {practitioners.map((pr) => (
                        <option key={pr._id} value={pr._id}>
                          {pr.name} ({pr.email})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        setSelectedPatientToAssign(p._id);
                        assignPractitioner();
                      }}
                      className="ml-2 bg-indigo-600 text-white px-3 py-1 rounded"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))}
              {assignPatientResults.length === 0 && (
                <div className="text-gray-500 mt-2">
                  Search patients to assign
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="p-4 border rounded">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">Reports</div>
            <div className="text-lg font-semibold">Clinic reports</div>
          </div>
          <button
            onClick={loadReports}
            className="bg-gray-200 px-3 py-1 rounded"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="p-3 border rounded">
            <div className="text-sm text-gray-500">
              Sessions completed this week
            </div>
            <div className="text-2xl font-bold">
              {reports.completedThisWeek}
            </div>
          </div>

          <div className="p-3 border rounded col-span-2">
            <div className="text-sm text-gray-500">
              Most popular therapies (top 5)
            </div>
            <div className="mt-2 space-y-2">
              {reports.popular && reports.popular.length ? (
                reports.popular.map((p, idx) => (
                  <div
                    key={p.therapyId}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {idx + 1}. {p.name || "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.count} sessions
                      </div>
                    </div>
                    <div style={{ width: "35%" }}>
                      <div
                        style={{
                          height: 10,
                          background: "#eee",
                          borderRadius: 6,
                        }}
                      >
                        <div
                          style={{
                            height: 10,
                            background: "#4f46e5",
                            borderRadius: 6,
                            width: `${Math.min(
                              100,
                              (p.count / (reports.popular[0]?.count || 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">No data</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Practitioners modal */}
      <Modal
        open={practitionersModalOpen}
        title="Practitioners"
        onClose={() => setPractitionersModalOpen(false)}
      >
        <div className="space-y-2 max-h-72 overflow-auto">
          {practitioners.map((p) => (
            <div
              key={p._id}
              className="p-2 border rounded flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">{p.email}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(p.email)}
                  className="text-sm text-indigo-600"
                >
                  Copy email
                </button>
                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/admin/practitioner/${p._id}`);
                      showSuccess("Deleted (if endpoint exists)");
                      /* reload */ loadPractitioners();
                    } catch (e) {
                      showError("Delete failed");
                    }
                  }}
                  className="text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {practitioners.length === 0 && (
            <div className="text-gray-500">No practitioners found</div>
          )}
        </div>
      </Modal>

      {/* Therapies modal */}
      <Modal
        open={therapiesModalOpen}
        title="Therapies"
        onClose={() => setTherapiesModalOpen(false)}
      >
        <div className="space-y-2 max-h-72 overflow-auto">
          {therapies.map((t) => (
            <div
              key={t._id}
              className="p-2 border rounded flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-gray-500">
                  Duration: {t.durationMinutes} min
                </div>
              </div>
              <div>
                <button
                  onClick={() => copyToClipboard(t.name)}
                  className="text-sm text-indigo-600"
                >
                  Copy
                </button>
              </div>
            </div>
          ))}
          {therapies.length === 0 && (
            <div className="text-gray-500">No therapies</div>
          )}
        </div>
      </Modal>
    </div>
  );
}
