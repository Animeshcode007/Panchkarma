import React from "react";
import { motion } from "framer-motion";

/**
 * Props:
 *  - monthly: [{ _id: { year, month }, avgRating, count }]
 *  - overall: { avgRating, count }
 */
export default function ProgressChart({
  monthly = [],
  overall = { avgRating: null, count: 0 },
}) {
  const labels = monthly.map((m) => `${m._id.month}/${m._id.year}`);
  const values = monthly.map((m) => Math.round(m.avgRating * 10) / 10);
  const maxVal = Math.max(5, ...values);
  const width = 500,
    height = 140,
    padding = 20;
  const stepX =
    values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
  const scaleY = (v) =>
    height - padding - (v / maxVal) * (height - padding * 2);
  const points = values
    .map((v, i) => `${padding + i * stepX},${scaleY(v)}`)
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded shadow"
    >
      <h4 className="font-semibold mb-2">Progress (ratings over time)</h4>
      {values.length === 0 ? (
        <div className="text-gray-500">No feedback yet</div>
      ) : (
        <div className="overflow-x-auto">
          <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
            <motion.polyline
              points={points}
              fill="none"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9 }}
            />
            {values.map((v, i) => (
              <g key={i}>
                <motion.circle
                  initial={{ r: 0 }}
                  animate={{ r: 4 }}
                  cx={padding + i * stepX}
                  cy={scaleY(v)}
                  fill="#4f46e5"
                />
                <text
                  x={padding + i * stepX}
                  y={scaleY(v) - 8}
                  fontSize="10"
                  fill="#1f2937"
                  textAnchor="middle"
                >
                  {v}
                </text>
                <text
                  x={padding + i * stepX}
                  y={height - 4}
                  fontSize="10"
                  fill="#6b7280"
                  textAnchor="middle"
                >
                  {labels[i]}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Overall rating</div>
          <div className="font-semibold">
            {overall.avgRating
              ? Math.round(overall.avgRating * 10) / 10 + " / 5"
              : "—"}
          </div>
        </div>
        <div className="w-full bg-gray-200 h-3 rounded mt-2 overflow-hidden">
          <motion.div
            className="h-3 bg-green-500 rounded"
            initial={{ width: 0 }}
            animate={{
              width: `${
                overall.avgRating ? (overall.avgRating / 5) * 100 : 0
              }%`,
            }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
