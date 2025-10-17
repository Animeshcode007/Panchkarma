import React from "react";
import { Bell, User, Search } from "lucide-react";
import { useToast } from "./Toast";

export default function Topbar() {
  const { showInfo } = useToast();
  return (
    <div className="topbar card">
      <div className="flex items-center gap-4">
        <div
          className="text-xl font-semibold"
          style={{ color: "var(--primary-600)" }}
        >
          Panchakarma
        </div>
        <div className="hidden md:block">
          <input
            placeholder="Quick search (patients, appointments)"
            className="p-2 rounded border"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="btn btn-ghost"
          onClick={() => showInfo("Notifications not implemented in demo")}
        >
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2">
          <User size={18} />
          <div className="text-sm">You</div>
        </div>
      </div>
    </div>
  );
}
