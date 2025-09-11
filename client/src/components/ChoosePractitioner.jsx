import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useToast } from './Toast';

export default function ChoosePractitioner({ onRequested }) {
  const [practitioners, setPractitioners] = useState([]);
  const [selected, setSelected] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadPractitioners();
  }, []);

  async function loadPractitioners() {
    try {
      const res = await api.get("/practitioners/list");
      setPractitioners(res.data);
    } catch (err) {
      console.error("loadPractitioners", err);
      setPractitioners([]);
    }
  }

  async function submitRequest(e) {
    e.preventDefault();
    if (!selected) return alert("Select a practitioner");
    setLoading(true);
    try {
      await api.post("/assignments/request", {
        practitionerId: selected,
        message,
      });
      showSuccess('Request sent to admin for approval');
      setSelected("");
      setMessage("");
      onRequested && onRequested();
    } catch (err) {
      showError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded mt-4">
      <h3 className="text-lg mb-2">Choose a Practitioner</h3>
      <form onSubmit={submitRequest}>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full p-2 mb-2 border"
        >
          <option value="">Select practitioner</option>
          {practitioners.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} — {p.email}
            </option>
          ))}
        </select>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Optional message to admin"
          className="w-full p-2 mb-2 border"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-3 py-1 rounded"
        >
          {loading ? "Sending..." : "Request Practitioner"}
        </button>
      </form>
    </div>
  );
}
