import React from "react";
import { Home, Calendar, BarChart2, Users, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";

const nav = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/schedule", label: "Schedule", icon: Calendar },
  { to: "/progress", label: "Progress", icon: BarChart2 },
  { to: "/patients", label: "Patients", icon: Users },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div className="text-lg font-semibold mb-2">Hello, Lord Animesh</div>
        <div className="small-muted">Practitioner • Indore</div>
      </div>

      <nav className="flex-1">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 p-3 rounded mb-1",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                )
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4">
        <div className="text-xs small-muted mb-2">Need a hand?</div>
        <button className="btn btn-primary w-full">Help & Docs</button>
      </div>
    </div>
  );
}
