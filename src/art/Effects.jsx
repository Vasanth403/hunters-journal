import React, { useMemo } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   EFFECTS — the moving parts that carry the reward loop.
   Every one of these fires on something you earned. Nothing here is ambient
   decoration except EmberField, which stays deliberately faint.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Summoning circle ─────────────────────────────────────────────────────
   Counter-rotating runic rings. Drives the level-up sequence.            */

const RUNES = ["ᛟ", "ᚱ", "ᛉ", "ᚦ", "ᛞ", "ᛊ", "ᚨ", "ᛗ", "ᚹ", "ᛃ", "ᛖ", "ᛜ"];

export function SummonCircle({ size = 460, spin = 1 }) {
  return (
    <svg viewBox="0 0 400 400" width={size} height={size} className="summon-circle" aria-hidden="true">
      <defs>
        <radialGradient id="sumCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="var(--ichor)"  stopOpacity="0.5" />
          <stop offset="40%"  stopColor="var(--monarch)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--monarch)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="200" cy="200" r="190" fill="url(#sumCore)" />

      {/* Outer rune band */}
      <motion.g
        style={{ transformOrigin: "200px 200px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 22 / spin, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="200" cy="200" r="182" fill="none" stroke="var(--monarch)" strokeWidth="1" opacity="0.55" />
        <circle cx="200" cy="200" r="168" fill="none" stroke="var(--monarch)" strokeWidth="0.6" opacity="0.35" strokeDasharray="2 10" />
        {RUNES.map((r, i) => {
          const a = (Math.PI * 2 * i) / RUNES.length - Math.PI / 2;
          return (
            <text
              key={i}
              x={200 + 175 * Math.cos(a)}
              y={200 + 175 * Math.sin(a)}
              textAnchor="middle" dominantBaseline="middle"
              fill="var(--arise)" fontSize="15" opacity="0.85"
              transform={`rotate(${(360 * i) / RUNES.length} ${200 + 175 * Math.cos(a)} ${200 + 175 * Math.sin(a)})`}
            >
              {r}
            </text>
          );
        })}
      </motion.g>

      {/* Mid ring, opposite spin */}
      <motion.g
        style={{ transformOrigin: "200px 200px" }}
        animate={{ rotate: -360 }}
        transition={{ duration: 15 / spin, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="200" cy="200" r="140" fill="none" stroke="var(--arise)" strokeWidth="1.4" opacity="0.5" strokeDasharray="30 14" />
        <polygon points="200,66 316,266 84,266" fill="none" stroke="var(--monarch)" strokeWidth="1.1" opacity="0.55" />
        <polygon points="200,334 84,134 316,134" fill="none" stroke="var(--monarch)" strokeWidth="1.1" opacity="0.55" />
      </motion.g>

      {/* Inner ring */}
      <motion.g
        style={{ transformOrigin: "200px 200px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 9 / spin, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="200" cy="200" r="96" fill="none" stroke="var(--ichor)" strokeWidth="1" opacity="0.6" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
          <path key={d} d="M200 104v-16" stroke="var(--ichor)" strokeWidth="2" opacity="0.7" transform={`rotate(${d} 200 200)`} />
        ))}
      </motion.g>
    </svg>
  );
}

/* ── Shockwave rings ──────────────────────────────────────────────────────
   Three expanding rings, staggered. Fires once per level-up.            */

export function ShockRings({ count = 3, color = "var(--arise)" }) {
  return (
    <div className="shock-rings" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="shock-ring"
          style={{ borderColor: color }}
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 1.5, delay: i * 0.28, ease: "easeOut", repeat: Infinity, repeatDelay: 0.6 }}
        />
      ))}
    </div>
  );
}

/* ── Ember field ──────────────────────────────────────────────────────────
   Ambient motes drifting up the whole page. Kept very low opacity: this is
   atmosphere, not an effect, and it must never compete with the content. */

export function EmberField({ count = 26 }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 37.4) % 100,
        delay: (i * 1.13) % 16,
        dur: 15 + ((i * 3.7) % 14),
        size: 1 + ((i * 0.7) % 2.4),
        drift: ((i % 5) - 2) * 22,
        gold: i % 6 === 0,
      })),
    [count]
  );

  return (
    <div className="ember-field" aria-hidden="true">
      {motes.map((m) => (
        <motion.span
          key={m.id}
          className={`ember ${m.gold ? "ember-gold" : ""}`}
          style={{ left: `${m.left}%`, width: m.size, height: m.size }}
          initial={{ y: "8vh", x: 0, opacity: 0 }}
          animate={{ y: "-105vh", x: m.drift, opacity: [0, 0.7, 0.7, 0] }}
          transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ── XP burst ─────────────────────────────────────────────────────────────
   Particle spray + a rising damage number, anchored where a quest cleared. */

export function XpBurst({ amount, x, y, crit = false }) {
  const shards = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 14 + (i % 3) * 0.2;
        const d = 40 + ((i * 13) % 55);
        return { id: i, dx: Math.cos(a) * d, dy: Math.sin(a) * d - 18, s: 2 + ((i * 0.6) % 3) };
      }),
    []
  );

  return (
    <div className="xp-burst" style={{ left: x, top: y }} aria-hidden="true">
      {shards.map((s) => (
        <motion.span
          key={s.id}
          className="xp-shard"
          style={{ width: s.s, height: s.s, background: crit ? "var(--ichor)" : "var(--arise)" }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: s.dx, y: s.dy, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        />
      ))}
      <motion.span
        className={`xp-float ${crit ? "xp-float-crit" : ""}`}
        initial={{ y: 0, opacity: 0, scale: 0.6 }}
        animate={{ y: -66, opacity: [0, 1, 1, 0], scale: [0.6, 1.15, 1, 0.95] }}
        transition={{ duration: 1.3, ease: "easeOut" }}
      >
        +{amount}
      </motion.span>
    </div>
  );
}

/* ── Glyph rain ───────────────────────────────────────────────────────────
   Runes falling behind the level-up card. Short-lived, high drama.      */

export function GlyphRain({ count = 22 }) {
  const cols = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 100) / count + ((i * 7) % 4),
        delay: (i * 0.11) % 1.4,
        dur: 1.5 + ((i * 0.3) % 1.4),
        rune: RUNES[i % RUNES.length],
      })),
    [count]
  );

  return (
    <div className="glyph-rain" aria-hidden="true">
      {cols.map((c) => (
        <motion.span
          key={c.id}
          className="glyph-drop"
          style={{ left: `${c.left}%` }}
          initial={{ y: "-15vh", opacity: 0 }}
          animate={{ y: "110vh", opacity: [0, 0.85, 0] }}
          transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: "linear" }}
        >
          {c.rune}
        </motion.span>
      ))}
    </div>
  );
}

/* ── Streak flame ─────────────────────────────────────────────────────────
   Grows in height and shifts violet→gold as the streak climbs. Reads as a
   single glanceable measure of "don't break it".                        */

export function StreakFlame({ streak = 0, size = 44 }) {
  const heat = Math.min(1, streak / 30);
  const h = 0.55 + heat * 0.45;
  return (
    <svg viewBox="0 0 40 56" width={size} height={size * 1.4} className="streak-flame" aria-hidden="true">
      <defs>
        <linearGradient id="flameGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%"   stopColor="var(--monarch)" />
          <stop offset="55%"  stopColor={heat > 0.4 ? "var(--ember)" : "var(--arise)"} />
          <stop offset="100%" stopColor="var(--ichor)" />
        </linearGradient>
      </defs>
      <motion.path
        fill="url(#flameGrad)"
        style={{ transformOrigin: "20px 52px" }}
        animate={{
          scaleY: [h, h * 1.12, h * 0.96, h],
          scaleX: [1, 0.94, 1.04, 1],
        }}
        transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
        d="M20 2c7 11 14 17 14 27a14 14 0 0 1-28 0C6 19 13 13 20 2Z"
      />
      <motion.path
        fill="var(--ichor)"
        opacity="0.9"
        style={{ transformOrigin: "20px 52px" }}
        animate={{ scaleY: [0.6, 0.78, 0.55, 0.6] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        d="M20 22c4 6 7 9 7 14a7 7 0 0 1-14 0c0-5 3-8 7-14Z"
      />
    </svg>
  );
}
