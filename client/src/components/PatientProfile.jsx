// client/src/components/PatientProfile.jsx
import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useToast } from "./Toast";
import { motion } from "framer-motion";

export default function PatientProfile({ patientId, open, onClose }) {
  const [data, setData] = useState(null);
  const { showError } = useToast();

  useEffect(() => {
    if (open && patientId) load();
  }, [open, patientId]);

  async function load() {
    try {
      const res = await api.get(`/practitioners/patient/${patientId}`);
      setData(res.data);
    } catch (err) {
      showError("Error loading patient");
    }
  }

  if (!open) return null;
  if (!data) return null;

  const { patient, record, recentAppointments } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold">{patient.name}</h3>
            <div className="text-sm text-gray-600">
              {patient.email}{" "}
              {record?.contactInfo?.phone && `• ${record.contactInfo.phone}`}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold">Medical History</h4>
          <div className="text-sm text-gray-700 mt-1">
            {record?.medicalHistory || "No medical history recorded"}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold">Assigned Therapy Plan</h4>
          <div className="text-sm text-gray-700 mt-1">
            {record?.assignedTherapyPlan || "No plan"}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold">Recent Appointments</h4>
          <ul className="mt-2 space-y-2">
            {recentAppointments.map((ap) => (
              <li key={ap._id} className="p-2 border rounded">
                <div className="flex justify-between">
                  <div>
                    {ap.therapy?.name} —{" "}
                    {new Date(ap.startTime).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">{ap.status}</div>
                </div>
              </li>
            ))}
            {recentAppointments.length === 0 && (
              <div className="text-gray-500">No recent appointments</div>
            )}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
