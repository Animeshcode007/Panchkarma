// client/src/components/BlockTime.jsx
import React, { useState, useEffect } from "react";
import api from "../api/api";
import { useToast } from "./Toast";
import { motion } from "framer-motion";

export default function BlockTime({ practitionerId, onChanged }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [reason, setReason] = useState("");
  const [blocks, setBlocks] = useState([]);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadBlocks();
  }, [practitionerId]);

  async function loadBlocks() {
    try {
      const res = await api.get("/practitioners/blocks", {
        params: { practitionerId },
      });
      setBlocks(res.data);
    } catch (err) {
      console.error(err);
      setBlocks([]);
    }
  }

  async function addBlock(e) {
    e.preventDefault();
    if (!start || !end) return showError("Pick start and end");
    try {
      await api.post("/practitioners/block-time", {
        practitionerId,
        startISO: new Date(start).toISOString(),
        endISO: new Date(end).toISOString(),
        reason,
      });
      showSuccess("Blocked");
      setStart("");
      setEnd("");
      setReason("");
      await loadBlocks();
      onChanged && onChanged();
    } catch (err) {
      showError(err.response?.data?.message || "Error");
    }
  }

  async function removeBlock(id) {
    if (!confirm("Remove block?")) return;
    try {
      await api.delete(`/practitioners/block/${id}`);
      showSuccess("Removed");
      await loadBlocks();
      onChanged && onChanged();
    } catch (err) {
      showError("Error removing");
    }
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h4 className="font-semibold mb-2">Block out time</h4>
      <form onSubmit={addBlock} className="space-y-2">
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (e.g., lunch)"
          className="w-full p-2 border rounded"
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="bg-yellow-500 text-white px-3 py-1 rounded"
        >
          Add block
        </motion.button>
      </form>

      <div className="mt-4">
        <h5 className="font-medium">Your blocks</h5>
        <ul className="mt-2 space-y-2">
          {blocks.map((b) => (
            <li
              key={b._id}
              className="p-2 border rounded flex justify-between items-center"
            >
              <div className="text-sm">
                {new Date(b.start).toLocaleString()} —{" "}
                {new Date(b.end).toLocaleString()}{" "}
                <div className="text-xs text-gray-500">{b.reason}</div>
              </div>
              <button
                onClick={() => removeBlock(b._id)}
                className="text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
          {blocks.length === 0 && (
            <div className="text-gray-500">No blocks</div>
          )}
        </ul>
      </div>
    </div>
  );
}
