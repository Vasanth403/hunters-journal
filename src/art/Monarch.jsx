import React, { useMemo } from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   THE MONARCH — original character art, drawn as SVG so it can react to
   state instead of sitting there as a flat portrait.

   It reads your progress:
     • level      → aura intensity, eye brightness, trim brightness
     • rank       → shadow soldiers summoned behind you, one per rank
     • streak     → ember density rising off the cloak
     • awakening  → true while a level-up plays; everything flares

   Construction is anime silhouette logic: a hard peaked cowl, a raised
   collar that grows OUT of the shoulders, pauldrons welded to the cloak,
   and a hem that frays into shadow instead of ending in a line. The face
   is a void with two slits — the single brightest thing in the frame.
   ═══════════════════════════════════════════════════════════════════════════ */

const RANK_SOLDIERS = { UNRANKED: 0, E: 1, D: 2, C: 3, B: 4, A: 5, S: 6 };

/* A shadow soldier in its own 60×120 box, so placement is just translate+scale. */
const SOLDIER_BODY =
  "M30 3 C19 4 13 13 13 25 C13 33 16 39 20 43 L9 51 L3 82 L0 119 H60 L57 82 L51 51 L40 43 C44 39 47 33 47 25 C47 13 41 4 30 3 Z";

export default function Monarch({
  level = 1,
  rank = "UNRANKED",
  streak = 0,
  awakened = false,
  avatarUrl = "",
  className = "",
}) {
  const rankKey  = String(rank).replace("-RANK", "").toUpperCase();
  const soldiers = RANK_SOLDIERS[rankKey] ?? 0;

  /* Power ramps 0→1 over the first 60 levels, then holds. */
  const power       = Math.min(1, level / 60);
  const auraOpacity = 0.34 + power * 0.4 + (awakened ? 0.26 : 0);
  const eyeGlow     = 4 + power * 5 + (awakened ? 8 : 0);
  const trimOpacity = 0.55 + power * 0.45;

  const emberCount = Math.min(14, 3 + Math.floor(streak / 2));
  const embers = useMemo(
    () =>
      Array.from({ length: emberCount }, (_, i) => ({
        id: i,
        x: 70 + ((i * 47) % 160),
        delay: (i * 0.63) % 5,
        dur: 4.5 + ((i * 1.7) % 3.5),
        size: 1.1 + ((i * 0.9) % 1.7),
      })),
    [emberCount]
  );

  return (
    <div className={`monarch ${awakened ? "monarch-awakened" : ""} ${className}`}>
      <svg viewBox="0 0 300 430" className="monarch-svg" role="img" aria-label="Your hunter">
        <defs>
          <radialGradient id="mAura" cx="50%" cy="44%" r="54%">
            <stop offset="0%"   stopColor="var(--monarch)" stopOpacity="0.9" />
            <stop offset="42%"  stopColor="var(--monarch)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--monarch)" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="mCloak" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%"   stopColor="#2b2049" />
            <stop offset="38%"  stopColor="#181130" />
            <stop offset="100%" stopColor="#07050f" />
          </linearGradient>

          <linearGradient id="mHood" x1="0.15" y1="0" x2="0.9" y2="1">
            <stop offset="0%"   stopColor="#33265c" />
            <stop offset="60%"  stopColor="#1a1233" />
            <stop offset="100%" stopColor="#0b0718" />
          </linearGradient>

          <linearGradient id="mTrim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="var(--arise)" />
            <stop offset="60%"  stopColor="var(--monarch)" />
            <stop offset="100%" stopColor="var(--ichor)" />
          </linearGradient>

          <linearGradient id="mPlate" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%"   stopColor="#463368" />
            <stop offset="100%" stopColor="#150e27" />
          </linearGradient>

          <filter id="mBlur" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="mSoft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>

          <clipPath id="mFaceClip">
            <path d="M150 70c-17 2-28 16-29 35 -1 18 10 33 29 39 19-6 30-21 29-39 -1-19-12-33-29-35Z" />
          </clipPath>
        </defs>

        {/* ── The gate behind him ───────────────────────────────────────── */}
        <g className="m-gate">
          <ellipse cx="150" cy="205" rx="120" ry="158" fill="url(#mAura)" opacity={auraOpacity} filter="url(#mBlur)" />

          <motion.g
            style={{ transformOrigin: "150px 205px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: awakened ? 12 : 66, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="150" cy="205" r="118" fill="none" stroke="var(--monarch)" strokeWidth="1" opacity="0.4" strokeDasharray="3 14" />
            <circle cx="150" cy="205" r="100" fill="none" stroke="var(--arise)" strokeWidth="0.7" opacity="0.26" strokeDasharray="30 10" />
          </motion.g>

          <motion.g
            style={{ transformOrigin: "150px 205px" }}
            animate={{ rotate: -360 }}
            transition={{ duration: awakened ? 8 : 44, repeat: Infinity, ease: "linear" }}
          >
            <polygon points="150,96 208,205 150,314 92,205" fill="none" stroke="var(--monarch)" strokeWidth="0.8" opacity="0.3" />
          </motion.g>
        </g>

        {/* ── Shadow soldiers — one summoned per rank earned ────────────── */}
        <g className="m-army">
          {Array.from({ length: soldiers }).map((_, i) => {
            const side  = i % 2 === 0 ? -1 : 1;
            const tier  = Math.floor(i / 2);
            const scale = 0.62 - tier * 0.11;
            const x     = 150 + side * (72 + tier * 30) - (60 * scale) / 2;
            const y     = 248 + tier * 20;
            return (
              <motion.g
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3], y: [0, -6, 0] }}
                transition={{ duration: 5 + i * 0.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
              >
                <g transform={`translate(${x} ${y}) scale(${scale})`}>
                  <path d={SOLDIER_BODY} fill="#0a0616" />
                  <path d="M20 22 L28 20 L27 26 L20 27 Z M40 22 L32 20 L33 26 L40 27 Z" fill="var(--monarch)" opacity="0.95" />
                </g>
              </motion.g>
            );
          })}
        </g>

        {/* ── The monarch ───────────────────────────────────────────────── */}
        <motion.g
          className="m-body"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Raised collar points — drawn first so the cloak overlaps their base */}
          <path d="M114 158 L96 112 L132 152 Z" fill="#221739" stroke="url(#mTrim)" strokeWidth="1.2" opacity={trimOpacity} />
          <path d="M186 158 L204 112 L168 152 Z" fill="#221739" stroke="url(#mTrim)" strokeWidth="1.2" opacity={trimOpacity} />

          {/* Cloak — torso and skirt in one silhouette, hem frayed into shadow */}
          <motion.path
            className="m-cloak"
            fill="url(#mCloak)"
            animate={{
              d: [
                "M114 156 L98 176 L84 206 L70 266 L56 332 L50 392 L62 372 L74 396 L88 374 L102 398 L116 376 L131 398 L150 372 L169 398 L184 376 L198 398 L212 374 L226 396 L238 372 L250 392 L244 332 L230 266 L216 206 L202 176 L186 156 L150 174 Z",
                "M114 156 L96 178 L82 208 L68 268 L54 336 L48 396 L60 374 L76 398 L90 376 L104 396 L118 378 L133 400 L150 374 L167 400 L182 378 L196 396 L210 376 L224 398 L240 374 L252 396 L246 336 L232 268 L218 208 L204 178 L186 156 L150 174 Z",
                "M114 156 L98 176 L84 206 L70 266 L56 332 L50 392 L62 372 L74 396 L88 374 L102 398 L116 376 L131 398 L150 372 L169 398 L184 376 L198 398 L212 374 L226 396 L238 372 L250 392 L244 332 L230 266 L216 206 L202 176 L186 156 L150 174 Z",
              ],
            }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Violet lining catching the aura from inside the cloak */}
          <path d="M150 176 L174 232 L166 358 L150 332 L134 358 L126 232 Z" fill="var(--monarch)" opacity={0.09 + power * 0.13} />

          {/* Pauldrons — welded to the shoulder line, not floating */}
          <path d="M114 156 L80 162 L62 184 L60 208 L88 198 L100 174 Z" fill="url(#mPlate)" />
          <path d="M186 156 L220 162 L238 184 L240 208 L212 198 L200 174 Z" fill="url(#mPlate)" />
          <path d="M114 156 L80 162 L62 184 L60 208 L88 198 L100 174 Z" fill="none" stroke="url(#mTrim)" strokeWidth="1.3" opacity={trimOpacity} />
          <path d="M186 156 L220 162 L238 184 L240 208 L212 198 L200 174 Z" fill="none" stroke="url(#mTrim)" strokeWidth="1.3" opacity={trimOpacity} />

          {/* Chest plate */}
          <path d="M126 168 L150 220 L174 168 L150 186 Z" fill="url(#mPlate)" />
          <path d="M126 168 L150 220 L174 168" fill="none" stroke="url(#mTrim)" strokeWidth="1.5" opacity={trimOpacity} />
          <path d="M138 196 L150 214 L162 196" fill="none" stroke="var(--ichor)" strokeWidth="1" opacity={power * 0.8} />

          {/* Hood — hard peak, angular slopes, meets the shoulders */}
          <path
            d="M150 44 L122 76 C111 92 107 112 109 134 L113 158 L187 158 L191 134 C193 112 189 92 178 76 Z"
            fill="url(#mHood)"
          />
          <path
            d="M150 44 L122 76 C111 92 107 112 109 134 L113 158"
            fill="none" stroke="url(#mTrim)" strokeWidth="1.5" opacity={trimOpacity}
          />
          <path
            d="M150 44 L178 76 C189 92 193 112 191 134 L187 158"
            fill="none" stroke="url(#mTrim)" strokeWidth="1" opacity={trimOpacity * 0.5}
          />

          {/* Crown spike at the peak of the cowl */}
          <path d="M150 32 L157 52 L150 46 L143 52 Z" fill="url(#mTrim)" opacity={0.35 + power * 0.65} />

          {/* Face void — your portrait shows through here if you set one */}
          <path
            d="M150 70c-17 2-28 16-29 35 -1 18 10 33 29 39 19-6 30-21 29-39 -1-19-12-33-29-35Z"
            fill="#040309"
          />
          {avatarUrl && (
            <image
              href={avatarUrl}
              x="118" y="64" width="64" height="82"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#mFaceClip)"
              opacity="0.8"
            />
          )}

          {/* Eyes — thin angled slits, the brightest thing in the frame */}
          <motion.g
            animate={{ opacity: awakened ? [1, 0.5, 1] : [0.8, 1, 0.8] }}
            transition={{ duration: awakened ? 0.45 : 3.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: `drop-shadow(0 0 ${eyeGlow}px ${awakened ? "var(--ichor)" : "var(--arise)"})` }}
          >
            <path d="M126 108 L146 100 L145 108 L127 114 Z" fill={awakened ? "var(--ichor)" : "var(--arise)"} />
            <path d="M174 108 L154 100 L155 108 L173 114 Z" fill={awakened ? "var(--ichor)" : "var(--arise)"} />
            <path d="M129 108 L143 103 L142 106 L130 110 Z" fill="#fff" opacity="0.85" />
            <path d="M171 108 L157 103 L158 106 L170 110 Z" fill="#fff" opacity="0.85" />
          </motion.g>

          {/* Brow shadow, sells the depth of the cowl */}
          <path d="M118 96 C130 86 170 86 182 96 C177 78 165 66 150 64 C135 66 123 78 118 96 Z" fill="#08060f" />
        </motion.g>

        {/* ── Embers rising off him ─────────────────────────────────────── */}
        <g className="m-embers">
          {embers.map((e) => (
            <motion.circle
              key={e.id}
              cx={e.x}
              r={e.size}
              fill={e.id % 4 === 0 ? "var(--ichor)" : "var(--arise)"}
              initial={{ cy: 380, opacity: 0 }}
              animate={{ cy: [380, 92], opacity: [0, 0.9, 0] }}
              transition={{ duration: e.dur, repeat: Infinity, delay: e.delay, ease: "easeOut" }}
              filter="url(#mSoft)"
            />
          ))}
        </g>

        {/* ── Ground shadow ─────────────────────────────────────────────── */}
        <ellipse cx="150" cy="398" rx="92" ry="12" fill="#040309" opacity="0.75" filter="url(#mSoft)" />
      </svg>
    </div>
  );
}
