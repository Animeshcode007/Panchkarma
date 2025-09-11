import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import AppointmentBooking from "../components/AppointmentBooking";
import Notifications from "../components/Notifications";
import FeedbackForm from "../components/FeedbackForm";
import ChoosePractitioner from "../components/ChoosePractitioner";
import { SocketContext } from "../contexts/SocketContext";
import { AuthContext } from "../contexts/AuthContext";

export default function PatientDashboard() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [me, setMe] = useState(null);
  const { notifications } = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchUpcoming();
    fetchPast();
    fetchMe();
  }, []);

  async function fetchUpcoming() {
    try {
      const res = await api.get("/appointments/patient/upcoming");
      setUpcoming(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchPast() {
    try {
      const res = await api.get("/appointments/patient/past");
      setPast(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchMe() {
    try {
      const res = await api.get("/patients/me");
      setMe(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-6">
      <div className="flex gap-6">
        <div className="w-2/3">
          <h2 className="text-xl mb-4">Welcome, {user?.name}</h2>

          <div className="p-3 mb-4 border rounded">
            <div className="font-semibold">Assigned Practitioner:</div>
            <div>
              {me?.assignedPractitioner ? (
                `${me.assignedPractitioner.name} (${me.assignedPractitioner.email})`
              ) : (
                <span className="text-gray-500">None assigned</span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              (Admin will finalize assignment)
            </div>
          </div>

          <ChoosePractitioner onRequested={fetchMe} />

          <h3 className="text-lg mb-2 mt-6">Upcoming Sessions</h3>
          <ul>
            {upcoming.map((a) => (
              <li key={a._id} className="p-3 border mb-2 rounded">
                <div className="font-semibold">{a.therapy.name}</div>
                <div>Practitioner: {a.practitioner.name}</div>
                <div>{new Date(a.startTime).toLocaleString()}</div>
              </li>
            ))}
            {upcoming.length === 0 && <div>No upcoming sessions</div>}
          </ul>

          <h3 className="text-lg mt-6 mb-2">Past Sessions (give feedback)</h3>
          <ul>
            {past.map((a) => (
              <li key={a._id} className="p-3 border mb-2 rounded">
                <div className="font-semibold">{a.therapy.name}</div>
                <div>Practitioner: {a.practitioner.name}</div>
                <div>{new Date(a.startTime).toLocaleString()}</div>
                <FeedbackForm appointmentId={a._id} onSubmitted={fetchPast} />
              </li>
            ))}
            {past.length === 0 && <div>No past sessions yet</div>}
          </ul>

          <AppointmentBooking onBooked={fetchUpcoming} />
        </div>

        <div className="w-1/3">
          <Notifications notifications={notifications} />
        </div>
      </div>
    </div>
  );
}
