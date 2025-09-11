import React, { useState } from "react";
import api from "../api/api";
import { useToast } from './Toast';

export default function FeedbackForm({ appointmentId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { showSuccess, showError } = useToast();

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post("/feedbacks/submit", { appointmentId, rating, comment });
     showSuccess('Feedback sent');
      setComment("");
      onSubmitted && onSubmitted();
    } catch (err) {
      showError(err.response?.data?.message || 'Submit failed');
    }
  }

  return (
    <form onSubmit={submit} className="p-3 border rounded mt-2">
      <h4 className="mb-2">Feedback</h4>
      <div className="mb-2">
        <label>Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="block p-2 border"
        >
          {[5, 4, 3, 2, 1].map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comments"
        className="w-full p-2 mb-2 border"
      />
      <button className="bg-blue-600 text-white px-3 py-1 rounded">
        Send Feedback
      </button>
    </form>
  );
}
