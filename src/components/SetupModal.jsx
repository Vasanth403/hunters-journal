import React, { useState } from "react";
import { motion } from "framer-motion";
import { TIMEZONES } from "../game/constants";
import { Brackets } from "../art/Sigils";

export default function SetupModal({ onComplete }) {
  const detectedTz = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return "UTC"; }
  })();
  // Falls back to London if the detected zone isn't one we offer.
  const defaultTz = TIMEZONES.find((t) => t.value === detectedTz)?.value ?? TIMEZONES[7].value;

  const [name, setName] = useState("");
  const [tz, setTz]     = useState(defaultTz);

  function handleStart(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onComplete({ name: name.trim(), timezone: tz });
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="setup-overlay">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.15 }}
        className="setup-box"
      >
        <Brackets />
        <p className="setup-eyebrow">System initialization</p>
        <h1 className="setup-title">Hunter's Journal</h1>
        <p className="setup-sub">A new hunter has been detected.<br />Register your profile to open the gate.</p>
        <div className="setup-divider" />

        <form onSubmit={handleStart} className="setup-form">
          <div className="field">
            <label className="field-label">Hunter name</label>
            <input className="field-input setup-input" placeholder="What should the System call you?"
              value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
          </div>
          <div className="field">
            <label className="field-label">
              Timezone <span className="optional">— quests reset at midnight here</span>
            </label>
            <select className="field-input setup-select" value={tz} onChange={(e) => setTz(e.target.value)}>
              {TIMEZONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <p className="setup-tz-hint">Detected on this device: {detectedTz}</p>
          </div>
          <button type="submit" className="btn-setup-start">Enter the gate</button>
        </form>
      </motion.div>
    </motion.div>
  );
}
