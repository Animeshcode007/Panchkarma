import React, { useEffect, useState, useContext } from "react";
import api from "../api/api";
import AppointmentBooking from "../components/AppointmentBooking";
import Notifications from "../components/Notifications";
import { SocketContext } from "../contexts/SocketContext";
import { AuthContext } from "../contexts/AuthContext";

export default function PatientDashboard() {
  const [upcoming, setUpcoming] = useState([]);
  const { notifications } = useContext(SocketContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchUpcoming();
  }, []);

  async function fetchUpcoming() {
    try {
      const res = await api.get("/appointments/patient/upcoming");
      setUpcoming(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-6">
      <div className="flex gap-6">
        <div className="w-2/3">
          <h2 className="text-xl mb-4">Welcome, {user?.name}</h2>
          <h3 className="text-lg mb-2">Upcoming Sessions</h3>
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

          <AppointmentBooking onBooked={fetchUpcoming} />
        </div>

        <div className="w-1/3">
          <Notifications notifications={notifications} />
        </div>
      </div>
    </div>
  );
}
