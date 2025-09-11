import React from "react";

export default function Notifications({ notifications = [] }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg mb-3">Notifications</h3>
      <ul>
        {notifications.map((n, i) => (
          <li key={i} className="border p-2 mb-2 rounded">
            <div className="font-semibold">{n.title || "Notification"}</div>
            <div>{n.message}</div>
            <div className="text-xs text-gray-500">
              {new Date(n.createdAt || Date.now()).toLocaleString()}
            </div>
          </li>
        ))}
        {notifications.length === 0 && <div>No notifications</div>}
      </ul>
    </div>
  );
}
