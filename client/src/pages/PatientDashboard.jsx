import React, { useEffect, useState } from "react";
import api from "../api/api";
import MonthlyCalendar from "../components/MonthlyCalendar";
import SessionModal from "../components/SessionModal";
import ProgressChart from "../components/ProgressChart";
import LogoutButton from "../components/LogoutButton";
import FeedbackForm from "../components/FeedbackForm";
import TakeAppointment from "../components/TakeAppointment";
import { useToast } from "../components/Toast";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientDashboard() {
  const [tab, setTab] = useState("schedule"); // 'schedule' | 'progress' | 'feedbacks'
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]); // include upcoming & past for calendar
  const [selectedDateAppts, setSelectedDateAppts] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAppointment, setModalAppointment] = useState(null);
  const [stats, setStats] = useState({
    monthly: [],
    overall: { avgRating: null, count: 0 },
    feedbacks: [],
  });
  const { showSuccess } = useToast();

  useEffect(() => {
    refreshAll();
  }, []);

  async function refreshAll() {
    await Promise.all([
      fetchUpcoming(),
      fetchPast(),
      loadAllAppointments(),
      loadStats(),
    ]);
  }

  async function loadAllAppointments() {
    try {
      const up = await api.get("/appointments/patient/upcoming");
      const pa = await api.get("/appointments/patient/past");
      const merged = [...up.data, ...pa.data];
      setAllAppointments(merged);
    } catch (err) {
      console.error(err);
    }
  }

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

  async function loadStats() {
    try {
      const res = await api.get("/feedbacks/patient/me");
      setStats({
        monthly: res.data.monthly || [],
        overall: res.data.overall || { avgRating: null, count: 0 },
        feedbacks: res.data.feedbacks || [],
      });
    } catch (err) {
      console.error(err);
    }
  }

  function onSelectDate(date, appts) {
    setSelectedDay(date);
    setSelectedDateAppts(appts);
    if (appts.length === 1) {
      setModalAppointment(appts[0]);
      setModalOpen(true);
    } else {
      setModalOpen(false);
      setModalAppointment(null);
    }
  }

  function openAppointmentModal(appt) {
    setModalAppointment(appt);
    setModalOpen(true);
  }

  async function onAppointmentUpdated(updated) {
    showSuccess("Appointment updated");
    await refreshAll();
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patient Dashboard</h1>
        <div>
          <LogoutButton />
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setTab("schedule")}
            className={`px-3 py-1 rounded ${
              tab === "schedule" ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
          >
            My Schedule
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setTab("progress")}
            className={`px-3 py-1 rounded ${
              tab === "progress" ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
          >
            My Progress
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setTab("feedbacks")}
            className={`px-3 py-1 rounded ${
              tab === "feedbacks" ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
          >
            Past Sessions
          </motion.button>
        </div>
      </div>

      <AnimatePresence exitBeforeEnter>
        {tab === "schedule" && (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
          >
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <MonthlyCalendar
                  year={new Date().getFullYear()}
                  monthIndex={new Date().getMonth()}
                  appointments={allAppointments}
                  onSelect={(date, appts) => onSelectDate(date, appts)}
                />

                <div className="mt-4 bg-white p-4 rounded shadow">
                  <h3 className="font-semibold mb-2">
                    {selectedDay
                      ? `Sessions on ${selectedDay.toDateString()}`
                      : "Click a date to see sessions"}
                  </h3>
                  <div className="space-y-2">
                    {selectedDateAppts.length === 0 && (
                      <div className="text-gray-500">No sessions</div>
                    )}
                    {selectedDateAppts.map((a) => (
                      <motion.div
                        key={a._id}
                        layout
                        whileHover={{ scale: 1.02 }}
                        className="p-3 border rounded flex justify-between items-center"
                      >
                        <div>
                          <div className="font-semibold">{a.therapy?.name}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(a.startTime).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => openAppointmentModal(a)}
                            whileTap={{ scale: 0.97 }}
                            className="bg-indigo-600 text-white px-3 py-1 rounded"
                          >
                            View
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <TakeAppointment onBooked={refreshAll} />
                <div className="bg-white p-4 rounded shadow sticky top-6">
                  <h3 className="font-semibold mb-2">Upcoming</h3>
                  <ul className="space-y-2">
                    {upcoming.slice(0, 6).map((a) => (
                      <motion.li
                        key={a._id}
                        layout
                        className="p-2 border rounded flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">{a.therapy?.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(a.startTime).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setModalAppointment(a);
                            setModalOpen(true);
                          }}
                          className="text-sm text-indigo-600"
                        >
                          Open
                        </button>
                      </motion.li>
                    ))}
                    {upcoming.length === 0 && (
                      <div className="text-gray-500">No upcoming sessions</div>
                    )}
                  </ul>
                </div>

                <div className="mt-4">
                  <ProgressChart
                    monthly={stats.monthly}
                    overall={stats.overall}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "progress" && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
          >
            <div className="grid grid-cols-2 gap-6">
              <div>
                <ProgressChart
                  monthly={stats.monthly}
                  overall={stats.overall}
                />
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">Improvement details</h3>
                <p className="text-sm text-gray-600">
                  Feedback entries used to compute progress.
                </p>
                <ul className="mt-3 space-y-2">
                  {stats.feedbacks.map((f) => (
                    <motion.li
                      key={f._id}
                      layout
                      className="p-2 border rounded"
                    >
                      <div className="flex justify-between">
                        <div className="text-sm">
                          {f.practitioner?.name} —{" "}
                          {new Date(f.createdAt).toLocaleDateString()}
                        </div>
                        <div className="font-semibold">{f.rating} / 5</div>
                      </div>
                      <div className="text-xs text-gray-700 mt-1">
                        {f.comment}
                      </div>
                    </motion.li>
                  ))}
                  {stats.feedbacks.length === 0 && (
                    <div className="text-gray-500">No feedbacks yet</div>
                  )}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "feedbacks" && (
          <motion.div
            key="feedbacks"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
          >
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold mb-3">Past Sessions</h3>
              <ul className="space-y-3">
                {past.map((a) => (
                  <motion.li
                    key={a._id}
                    layout
                    className="p-3 border rounded flex justify-between items-start"
                  >
                    <div>
                      <div className="font-semibold">{a.therapy?.name}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(a.startTime).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Practitioner: {a.practitioner?.name}
                      </div>
                    </div>
                    <div className="w-72">
                      <FeedbackForm
                        appointmentId={a._id}
                        onSubmitted={() => {
                          loadStats();
                          fetchPast();
                          showSuccess("Thank you for feedback");
                        }}
                      />
                    </div>
                  </motion.li>
                ))}
                {past.length === 0 && (
                  <div className="text-gray-500">No past sessions</div>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalOpen && modalAppointment && (
          <SessionModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            appointment={modalAppointment}
            onUpdated={onAppointmentUpdated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
