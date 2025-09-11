import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { formatISO } from 'date-fns';
import { useToast } from './Toast';

export default function AppointmentBooking({ onBooked }) {
  const [therapies, setTherapies] = useState([]);
  const [therapyId, setTherapyId] = useState('');
  const [start, setStart] = useState('');
   const { showSuccess, showError } = useToast();

  useEffect(() => { loadTherapies(); }, []);

  async function loadTherapies() {
    try {
      // fetch public therapies endpoint (no admin role required)
      const res = await api.get('/therapies');
      setTherapies(res.data);
    } catch (err) {
      console.error(err);
      setTherapies([]);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!therapyId || !start) return alert('Pick therapy and start time');
    try {
      await api.post('/appointments/book', { therapyId, startTimeISO: formatISO(new Date(start)) });
      showSuccess('Booked successfully');
      setTherapyId('');
      setStart('');
      onBooked && onBooked();
    } catch (err) {
      showError(err.response?.data?.message || 'Booking failed');
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 p-4 border rounded">
      <h3 className="mb-2">Book a session</h3>
      <select value={therapyId} onChange={e => setTherapyId(e.target.value)} className="w-full p-2 mb-2 border">
        <option value="">Choose therapy</option>
        {therapies.map(t => <option key={t._id} value={t._id}>{t.name} ({t.durationMinutes} min)</option>)}
      </select>

      <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} className="w-full p-2 mb-2 border" />
      <button className="bg-green-600 text-white px-3 py-1 rounded">Book</button>
    </form>
  );
}
