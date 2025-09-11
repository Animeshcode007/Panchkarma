import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useToast } from "../components/Toast";

export default function AdminDashboard() {
  const [prName, setPrName] = useState("");
  const [prEmail, setPrEmail] = useState("");
  const [prPass, setPrPass] = useState("");
  const [patName, setPatName] = useState("");
  const [patEmail, setPatEmail] = useState("");
  const [patPass, setPatPass] = useState("");
  const [therapyName, setTherapyName] = useState("");
  const [therapyDuration, setTherapyDuration] = useState(60);

  const [feedbacks, setFeedbacks] = useState([]);
  const [requests, setRequests] = useState([]);

  // For direct assign UI
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState([]);
  const [practitioners, setPractitioners] = useState([]);
  const [selectedForPatient, setSelectedForPatient] = useState({}); // { patientId: practitionerId }

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadPractitioners();
  }, []);

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
      await loadPractitioners();
    } catch (err) {
      showError(err.response?.data?.message || "Error");
    }
  }

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
      showError(err.response?.data?.message || "Error");
    }
  }

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
      showError(err.response?.data?.message || "Error");
    }
  }

  async function loadFeedbacks() {
    try {
      const res = await api.get("/feedbacks/all");
      setFeedbacks(res.data);
    } catch (err) {
      alert("Error loading feedbacks");
    }
  }

  async function loadRequests() {
    try {
      const res = await api.get("/assignments/pending");
      setRequests(res.data);
    } catch (err) {
      alert("Error loading requests");
    }
  }

  async function loadPractitioners() {
    try {
      const res = await api.get("/practitioners/list");
      setPractitioners(res.data);
    } catch (err) {
      console.error("loadPractitioners", err);
      setPractitioners([]);
    }
  }

  async function searchPatients(e) {
    e.preventDefault();
    try {
      const res = await api.get("/admin/patients/search", {
        params: { q: patientQuery },
      });
      setPatientResults(res.data);
    } catch (err) {
      showError("Error searching patients");
    }
  }

  async function assignDirect(patientId) {
    const practitionerId = selectedForPatient[patientId];
    if (!practitionerId) return alert("Select a practitioner for this patient");
    try {
      await api.post("/admin/assign", { patientId, practitionerId });
      showSuccess("Assigned successfully");
      // refresh search results
      await searchPatients({ preventDefault: () => {} });
    } catch (err) {
      showError(err.response?.data?.message || "Assign failed");
    }
  }

  async function approve(requestId) {
    try {
      await api.post("/assignments/approve", { requestId });
      showSuccess('Approved and assigned');
      loadRequests();
    } catch (err) {
      showError(err.response?.data?.message || 'Error');
    }
  }

  async function reject(requestId) {
    const reason = prompt("Reason for rejection (optional):") || "";
    try {
      await api.post("/assignments/reject", { requestId, reason });
      showSuccess('Rejected');
      loadRequests();
    } catch (err) {
      showError('Error');
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl">Admin Dashboard</h2>

      <form className="p-4 border rounded" onSubmit={createPractitioner}>
        <h3>Create Practitioner</h3>
        <input
          value={prName}
          onChange={(e) => setPrName(e.target.value)}
          placeholder="Name"
          className="p-2 border w-full mb-2"
        />
        <input
          value={prEmail}
          onChange={(e) => setPrEmail(e.target.value)}
          placeholder="Email"
          className="p-2 border w-full mb-2"
        />
        <input
          value={prPass}
          onChange={(e) => setPrPass(e.target.value)}
          placeholder="Password"
          className="p-2 border w-full mb-2"
        />
        <button className="bg-blue-600 text-white px-3 py-1 rounded">
          Create Practitioner
        </button>
      </form>

      <form className="p-4 border rounded" onSubmit={createPatient}>
        <h3>Create Patient</h3>
        <input
          value={patName}
          onChange={(e) => setPatName(e.target.value)}
          placeholder="Name"
          className="p-2 border w-full mb-2"
        />
        <input
          value={patEmail}
          onChange={(e) => setPatEmail(e.target.value)}
          placeholder="Email"
          className="p-2 border w-full mb-2"
        />
        <input
          value={patPass}
          onChange={(e) => setPatPass(e.target.value)}
          placeholder="Password"
          className="p-2 border w-full mb-2"
        />
        <button className="bg-blue-600 text-white px-3 py-1 rounded">
          Create Patient
        </button>
      </form>

      <form className="p-4 border rounded" onSubmit={createTherapy}>
        <h3>Create Therapy</h3>
        <input
          value={therapyName}
          onChange={(e) => setTherapyName(e.target.value)}
          placeholder="Therapy Name"
          className="p-2 border w-full mb-2"
        />
        <input
          value={therapyDuration}
          onChange={(e) => setTherapyDuration(e.target.value)}
          placeholder="Duration minutes"
          type="number"
          className="p-2 border w-full mb-2"
        />
        <button className="bg-green-600 text-white px-3 py-1 rounded">
          Create Therapy
        </button>
      </form>

      <div className="p-4 border rounded">
        <h3>Pending Assignment Requests</h3>
        <div className="mb-3">
          <button
            onClick={loadRequests}
            className="bg-indigo-600 text-white px-3 py-1 rounded"
          >
            Load requests
          </button>
        </div>
        <ul>
          {requests.map((r) => (
            <li key={r._id} className="p-3 border mb-2 rounded">
              <div>
                <strong>Patient:</strong> {r.patient?.name} ({r.patient?.email})
              </div>
              <div>
                <strong>Requested Practitioner:</strong> {r.practitioner?.name}{" "}
                ({r.practitioner?.email})
              </div>
              <div>
                <strong>Message:</strong>{" "}
                {r.message || <span className="text-gray-500">—</span>}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => approve(r._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => reject(r._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
          {requests.length === 0 && <div>No pending requests</div>}
        </ul>
      </div>

      <div className="p-4 border rounded">
        <h3>Direct Assign: Search Patients & Assign</h3>
        <form onSubmit={searchPatients} className="mb-3 flex gap-2">
          <input
            value={patientQuery}
            onChange={(e) => setPatientQuery(e.target.value)}
            placeholder="Search patients by name or email"
            className="p-2 border flex-1"
          />
          <button className="bg-gray-700 text-white px-3 py-1 rounded">
            Search
          </button>
        </form>

        <div className="mb-3">
          <div className="text-sm text-gray-600 mb-2">
            Available Practitioners:
          </div>
          <div className="flex flex-wrap gap-2">
            {practitioners.map((p) => (
              <div key={p._id} className="p-2 border rounded text-sm">
                {p.name} ({p.email})
              </div>
            ))}
            {practitioners.length === 0 && (
              <div className="text-gray-500">No practitioners loaded</div>
            )}
          </div>
        </div>

        <ul>
          {patientResults.map((pt) => (
            <li key={pt._id} className="p-3 border mb-2 rounded">
              <div>
                <strong>{pt.name}</strong> ({pt.email})
              </div>
              <div className="mt-2 flex gap-2 items-center">
                <select
                  value={selectedForPatient[pt._id] || ""}
                  onChange={(e) =>
                    setSelectedForPatient((prev) => ({
                      ...prev,
                      [pt._id]: e.target.value,
                    }))
                  }
                  className="p-2 border"
                >
                  <option value="">Select practitioner to assign</option>
                  {practitioners.map((pr) => (
                    <option key={pr._id} value={pr._id}>
                      {pr.name} ({pr.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => assignDirect(pt._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Assign
                </button>
              </div>
            </li>
          ))}
          {patientResults.length === 0 && <div>No patients (search above)</div>}
        </ul>
      </div>

      <div className="p-4 border rounded">
        <h3>Feedbacks</h3>
        <button
          onClick={loadFeedbacks}
          className="bg-indigo-600 text-white px-3 py-1 rounded mb-3"
        >
          Load all feedbacks
        </button>
        <ul>
          {feedbacks.map((f) => (
            <li key={f._1d || f._id} className="p-3 border mb-2 rounded">
              <div className="font-semibold">Rating: {f.rating} / 5</div>
              <div>
                From: {f.patient?.name} | To: {f.practitioner?.name}
              </div>
              <div>{f.comment}</div>
              <div className="text-xs text-gray-500">
                {new Date(f.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
          {feedbacks.length === 0 && <div>No feedbacks loaded</div>}
        </ul>
      </div>
    </div>
  );
}
