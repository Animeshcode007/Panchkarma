import React, { useState } from "react";
import api from "../api/api";

export default function AdminDashboard() {
  const [prName, setPrName] = useState("");
  const [prEmail, setPrEmail] = useState("");
  const [prPass, setPrPass] = useState("");
  const [patName, setPatName] = useState("");
  const [patEmail, setPatEmail] = useState("");
  const [patPass, setPatPass] = useState("");
  const [therapyName, setTherapyName] = useState("");
  const [therapyDuration, setTherapyDuration] = useState(60);

  async function createPractitioner(e) {
    e.preventDefault();
    try {
      await api.post("/admin/practitioner", {
        name: prName,
        email: prEmail,
        password: prPass,
      });
      alert("Practitioner created");
      setPrName("");
      setPrEmail("");
      setPrPass("");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
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
      alert("Patient created");
      setPatName("");
      setPatEmail("");
      setPatPass("");
    } catch (err) {
      alert("Error");
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
      alert("Therapy created");
      setTherapyName("");
      setTherapyDuration(60);
    } catch (err) {
      alert("Error");
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
    </div>
  );
}
