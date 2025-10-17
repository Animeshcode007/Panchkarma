import React from "react";
import { motion } from "framer-motion";

export default function Card({ children, className = "", header = null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`card ${className}`}
    >
      {header && <div className="card-header">{header}</div>}
      <div>{children}</div>
    </motion.div>
  );
}
