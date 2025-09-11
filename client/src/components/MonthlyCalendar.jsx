import React, { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
} from "date-fns";
import { motion } from "framer-motion";

export default function MonthlyCalendar({
  year,
  monthIndex,
  appointments = [],
  onSelect,
}) {
  const firstDay = useMemo(
    () => new Date(year, monthIndex, 1),
    [year, monthIndex]
  );
  const monthStart = startOfMonth(firstDay);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const weeks = [];
  let day = startDate;
  while (day <= endDate) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }

  const apptByDay = {};
  appointments.forEach((a) => {
    const d = new Date(a.startTime);
    const key = format(d, "yyyy-MM-dd");
    apptByDay[key] = apptByDay[key] || [];
    apptByDay[key].push(a);
  });

  return (
    <div className="w-full bg-white p-4 rounded shadow">
      <div className="grid grid-cols-7 text-center font-semibold mb-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="space-y-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-2">
            {week.map((dayDate, di) => {
              const inMonth = isSameMonth(dayDate, monthStart);
              const key = format(dayDate, "yyyy-MM-dd");
              const appts = apptByDay[key] || [];
              return (
                <motion.button
                  key={di}
                  onClick={() => onSelect && onSelect(dayDate, appts)}
                  whileHover={{
                    translateY: -6,
                    boxShadow: "0px 10px 20px rgba(15,23,42,0.08)",
                  }}
                  className={`p-2 h-28 flex flex-col items-start justify-between border rounded transition transform ${
                    inMonth ? "bg-white" : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <div className="flex justify-between w-full">
                    <div className="text-sm">{format(dayDate, "d")}</div>
                    {appts.length > 0 && (
                      <div className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                        {appts.length}
                      </div>
                    )}
                  </div>

                  <div className="w-full text-xs">
                    {appts.slice(0, 2).map((a) => (
                      <div key={a._id} className="truncate">
                        {a.therapy?.name} ·{" "}
                        {new Date(a.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    ))}
                    {appts.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{appts.length - 2} more
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
