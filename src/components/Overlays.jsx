import React from "react";
import { motion } from "framer-motion";
import { getRankTitle } from "../game/rules";
import { GateMark } from "../art/Sigils";
import { GlyphRain, ShockRings, SummonCircle } from "../art/Effects";

/* ═══════════════════════════════════════════════════════════════════════════
   Full-screen moments: the level-up cinematic, the achievement toast, and the
   loading gate.
   ═══════════════════════════════════════════════════════════════════════════ */

/* The reward moment. Everything else on the page is restrained so this can be
   loud: circle spins up, runes fall, rings blow outward, type slams in. */
export function LevelUpOverlay({ level }) {
  const slam = { type: "spring", stiffness: 420, damping: 15 };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="levelup-overlay"
    >
      {/* Impact flash */}
      <motion.div
        style={{ position: "absolute", inset: 0, background: "var(--arise)", pointerEvents: "none" }}
        initial={{ opacity: 0.85 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      <GlyphRain count={20} />

      <motion.div
        initial={{ scale: 0.2, opacity: 0, rotate: -40 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 16 }}
        style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}
      >
        <SummonCircle
          size={Math.min(620, typeof window !== "undefined" ? window.innerWidth * 0.95 : 620)}
          spin={1.6}
        />
      </motion.div>

      <ShockRings count={3} color="var(--ichor)" />

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.2, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="levelup-box"
      >
        <motion.div
          className="levelup-ring"
          animate={{ scale: [1, 1.14, 1], opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="levelup-ring-2"
          animate={{ scale: [1, 1.07, 1], opacity: [0.12, 0.32, 0.12] }}
          transition={{ duration: 1.3, repeat: Infinity, delay: 0.3, ease: "easeInOut" }}
        />

        <motion.p
          className="lu-sys"
          initial={{ opacity: 0, letterSpacing: "1.4em" }}
          animate={{ opacity: 1, letterSpacing: "0.5em" }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          System alert
        </motion.p>

        <motion.p
          className="lu-heading"
          initial={{ scale: 1.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...slam, delay: 0.28 }}
        >
          Level up
        </motion.p>

        <motion.p
          className="lu-num"
          initial={{ scale: 2.1, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ ...slam, delay: 0.5 }}
        >
          LV.{level}
        </motion.p>

        <motion.p
          className="lu-rank"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.78, duration: 0.45 }}
        >
          {getRankTitle(level)}
        </motion.p>

        <motion.div
          className="lu-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.85, duration: 0.6, ease: "easeOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

// ─── AchievementToast ─────────────────────────────────────────────────────────
export function AchievementToast({ achievement }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 80, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 60, x: "-50%" }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="ach-toast"
    >
      <span className="ach-toast-icon">{achievement.icon}</span>
      <div className="ach-toast-body">
        <p className="ach-toast-eyebrow">Achievement unlocked</p>
        <p className="ach-toast-label">{achievement.label}</p>
        <p className="ach-toast-desc">{achievement.desc}</p>
      </div>
    </motion.div>
  );
}

// ─── LoadingScreen ────────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <div className="app-root">
      <div className="bg-layer" />
      <div className="loading-screen">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <GateMark size={56} />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="loading-label"
        >
          Opening the gate
        </motion.p>
        <div className="loading-dots">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="loading-dot"
              animate={{ opacity: [0.15, 1, 0.15], scaleY: [0.6, 1.4, 0.6] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
