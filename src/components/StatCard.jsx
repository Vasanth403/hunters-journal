import React from "react";
import { motion } from "framer-motion";

const STAT_META = {
  STR: { color: "red",    hint: "Strength"   },
  MND: { color: "blue",   hint: "Mind"       },
  DIS: { color: "purple", hint: "Discipline" },
  VIT: { color: "green",  hint: "Vitality"   },
  CRE: { color: "amber",  hint: "Creativity" },
};

function formatStat(value) {
  if (value >= 100000) return `${Math.round(value / 1000)}k`;
  if (value >= 10000)  return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

/* Anton is condensed enough to hold four digits at full size; past that we
   step down so a five-figure stat never overflows its card. */
const STAT_VAL_SIZE = { 1: "1.7rem", 2: "1.7rem", 3: "1.55rem", 4: "1.3rem", 5: "1.05rem" };

export default function StatCard({ statKey, value }) {
  const m = STAT_META[statKey] || { color: "blue", hint: statKey };
  // Asymptotic fill: always climbing, never quite full, so there's no ceiling.
  const fillPct = Math.min(100, value === 0 ? 0 : (value / (value + 100)) * 100 + 5);
  const display = formatStat(value);

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.04 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      className={`stat-card sc-${m.color}`}
    >
      <span className={`stat-key sk-${m.color}`}>{statKey}</span>
      <span className="stat-val" title={value} style={{ fontSize: STAT_VAL_SIZE[display.length] || "0.82rem" }}>
        {display}
      </span>
      <span className="stat-hint">{m.hint}</span>
      <div className="stat-track">
        <motion.div
          className={`stat-fill sf-${m.color}`}
          initial={{ width: 0 }}
          animate={{ width: `${fillPct}%` }}
          transition={{ duration: 0.7 }}
        />
      </div>
    </motion.div>
  );
}
