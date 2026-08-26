import React from "react";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════════════
   BOSS BESTIARY — one original creature per weekly boss, keyed by name.
   Each is a silhouette with a lit feature (eyes, core, visor) so the card
   reads at a glance even at thumbnail size. All animate on idle; all go
   ashen and drift apart once defeated.
   ═══════════════════════════════════════════════════════════════════════════ */

const breathe = {
  animate: { y: [0, -4, 0], scale: [1, 1.015, 1] },
  transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
};

const pulse = (dur = 2.4) => ({
  animate: { opacity: [0.55, 1, 0.55] },
  transition: { duration: dur, repeat: Infinity, ease: "easeInOut" },
});

function IronColossus() {
  return (
    <motion.g {...breathe}>
      <path d="M120 22 60 46v58c0 30 26 50 60 58 34-8 60-28 60-58V46Z" fill="#171225" />
      <path d="M120 22 60 46v58c0 30 26 50 60 58 34-8 60-28 60-58V46Z" fill="none" stroke="#3b2f5c" strokeWidth="2" />
      <path d="M74 58h92v14H74Zm0 26h92v10H74Z" fill="#0d0918" />
      <motion.rect x="82" y="60" width="76" height="9" rx="1" fill="var(--ember)" {...pulse(3)} />
      <path d="M96 96h48l-6 22h-36Z" fill="#0d0918" />
      <path d="M100 100h40M100 108h40" stroke="#3b2f5c" strokeWidth="1.4" />
      <circle cx="72" cy="50" r="4" fill="#3b2f5c" /><circle cx="168" cy="50" r="4" fill="#3b2f5c" />
      <circle cx="66" cy="98" r="4" fill="#3b2f5c" /><circle cx="174" cy="98" r="4" fill="#3b2f5c" />
      <path d="M40 60 60 46v34ZM200 60 180 46v34Z" fill="#171225" stroke="#3b2f5c" strokeWidth="1.6" />
    </motion.g>
  );
}

function ShadowDrake() {
  return (
    <motion.g {...breathe}>
      <motion.path
        d="M120 96 44 44 22 96l40 34Z"
        fill="#120e20" stroke="#33265a" strokeWidth="1.4"
        animate={{ rotate: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "120px 96px" }}
      />
      <motion.path
        d="M120 96 196 44l22 52-40 34Z"
        fill="#120e20" stroke="#33265a" strokeWidth="1.4"
        animate={{ rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "120px 96px" }}
      />
      <path d="M120 40c-22 2-36 18-38 40 -2 24 14 44 38 52 24-8 40-28 38-52 -2-22-16-38-38-40Z" fill="#171225" />
      <path d="M92 60 74 26l30 22ZM148 60l18-34-30 22Z" fill="#171225" stroke="#33265a" strokeWidth="1.4" />
      <motion.g {...pulse(1.9)} style={{ filter: "drop-shadow(0 0 6px var(--ember))" }}>
        <path d="M98 78 116 72l-2 14-16 2Z" fill="var(--ember)" />
        <path d="M142 78 124 72l2 14 16 2Z" fill="var(--ember)" />
      </motion.g>
      <path d="M104 108h32l-6 18h-20Z" fill="#0a0714" />
      <path d="M108 110l4 12M120 110v14M132 110l-4 12" stroke="#e6dff5" strokeWidth="1.6" opacity="0.7" />
    </motion.g>
  );
}

function ForgottenKing() {
  return (
    <motion.g {...breathe}>
      <path d="M78 44 70 14l22 18 12-24 16 24 12-24 12 24 22-18-8 30Z" fill="#171225" stroke="var(--ichor)" strokeWidth="1.6" />
      <circle cx="92" cy="26" r="3.2" fill="var(--ichor)" />
      <circle cx="120" cy="20" r="3.6" fill="var(--ichor)" />
      <circle cx="148" cy="26" r="3.2" fill="var(--ichor)" />
      <path d="M120 48c-26 2-42 22-42 50 0 20 8 34 18 42h48c10-8 18-22 18-42 0-28-16-48-42-50Z" fill="#1d1730" />
      <motion.g {...pulse(2.8)} style={{ filter: "drop-shadow(0 0 7px var(--ichor))" }}>
        <ellipse cx="103" cy="88" rx="11" ry="13" fill="#07050d" />
        <ellipse cx="137" cy="88" rx="11" ry="13" fill="#07050d" />
        <circle cx="103" cy="89" r="4" fill="var(--ichor)" />
        <circle cx="137" cy="89" r="4" fill="var(--ichor)" />
      </motion.g>
      <path d="M114 100h12l-6 14Z" fill="#07050d" />
      <path d="M100 126h40M104 134h32" stroke="#07050d" strokeWidth="4" strokeLinecap="round" />
    </motion.g>
  );
}

function VoidSentinel() {
  return (
    <g>
      <motion.g
        style={{ transformOrigin: "120px 90px" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
      >
        <ellipse cx="120" cy="90" rx="86" ry="26" fill="none" stroke="var(--monarch)" strokeWidth="1.4" opacity="0.5" strokeDasharray="10 8" />
      </motion.g>
      <motion.g
        style={{ transformOrigin: "120px 90px" }}
        animate={{ rotate: -360 }}
        transition={{ duration: 17, repeat: Infinity, ease: "linear" }}
      >
        <ellipse cx="120" cy="90" rx="26" ry="76" fill="none" stroke="var(--arise)" strokeWidth="1.2" opacity="0.4" strokeDasharray="14 10" />
      </motion.g>
      <motion.g {...breathe}>
        <path d="M120 32 168 90l-48 58-48-58Z" fill="#150f27" stroke="#3b2f5c" strokeWidth="1.6" />
        <motion.ellipse
          cx="120" cy="90" rx="30" ry="20" fill="#07050d"
          animate={{ ry: [20, 3, 20] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", times: [0, 0.06, 0.12] }}
        />
        <motion.circle
          cx="120" cy="90" r="10" fill="var(--arise)"
          {...pulse(2)}
          style={{ filter: "drop-shadow(0 0 10px var(--monarch))" }}
        />
        <circle cx="120" cy="90" r="4" fill="#07050d" />
      </motion.g>
    </g>
  );
}

function AbyssalTyrant() {
  return (
    <motion.g {...breathe}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 46 + i * 30;
        return (
          <motion.path
            key={i}
            d={`M${x} 128 Q${x - 10} 152 ${x + 4} 172`}
            fill="none" stroke="#150f27" strokeWidth="7" strokeLinecap="round"
            animate={{ d: [
              `M${x} 128 Q${x - 10} 152 ${x + 4} 172`,
              `M${x} 128 Q${x + 10} 152 ${x - 4} 172`,
              `M${x} 128 Q${x - 10} 152 ${x + 4} 172`,
            ] }}
            transition={{ duration: 3.6 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
      <path d="M70 62 40 20l38 20ZM170 62l30-42-38 20Z" fill="#1d1730" stroke="var(--ember)" strokeWidth="1.4" />
      <path d="M120 34c-32 2-52 26-52 58 0 26 20 44 52 48 32-4 52-22 52-48 0-32-20-56-52-58Z" fill="#1d1730" />
      <motion.g {...pulse(1.6)} style={{ filter: "drop-shadow(0 0 8px var(--ember))" }}>
        <path d="M86 84 112 74l-4 20-22 4Z" fill="var(--ember)" />
        <path d="M154 84 128 74l4 20 22 4Z" fill="var(--ember)" />
      </motion.g>
      <path d="M92 112h56l-8 22h-40Z" fill="#07050d" />
      <path d="M98 114l5 16M110 114l3 18M130 114l-3 18M142 114l-5 16" stroke="var(--ember)" strokeWidth="1.6" opacity="0.8" />
    </motion.g>
  );
}

function HollowKnight() {
  return (
    <motion.g {...breathe}>
      <path d="M120 26c-30 2-48 24-48 56v34c0 18 20 30 48 34 28-4 48-16 48-34V82c0-32-18-54-48-56Z" fill="#171225" />
      <path d="M120 26c-30 2-48 24-48 56v34c0 18 20 30 48 34 28-4 48-16 48-34V82c0-32-18-54-48-56Z" fill="none" stroke="#463868" strokeWidth="1.8" />
      <path d="M120 26v124" stroke="#463868" strokeWidth="1.4" opacity="0.6" />
      <path d="M78 70 62 58M162 70l16-12M76 104 58 112M164 104l18 8" stroke="#463868" strokeWidth="1.6" opacity="0.5" />
      <path d="M84 78h30l-4 26H88Zm42 0h30l-4 26h-22Z" fill="#050409" />
      <motion.g {...pulse(3.6)}>
        <path d="M92 86h16v10H92Zm40 0h16v10h-16Z" fill="var(--arise)" opacity="0.55" />
      </motion.g>
      <path d="M118 46 128 74l-8 6-8-6Z" fill="#050409" opacity="0.8" />
      <path d="M104 122h32" stroke="#050409" strokeWidth="5" strokeLinecap="round" />
    </motion.g>
  );
}

function StormWarden() {
  return (
    <g>
      <motion.path
        d="M186 20 154 68h22l-24 44 54-58h-24Z"
        fill="var(--ichor)"
        animate={{ opacity: [0, 1, 0, 0, 1, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.04, 0.1, 0.55, 0.6, 0.66] }}
        style={{ filter: "drop-shadow(0 0 9px var(--ichor))" }}
      />
      <motion.path
        d="M54 34 30 74h16l-18 34 40-44H50Z"
        fill="var(--ichor)"
        animate={{ opacity: [0, 0, 1, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.3, 0.34, 0.4] }}
        style={{ filter: "drop-shadow(0 0 9px var(--ichor))" }}
      />
      <motion.g {...breathe}>
        <path d="M120 30 78 54v46c0 26 18 42 42 50 24-8 42-24 42-50V54Z" fill="#161125" stroke="#3d3163" strokeWidth="1.7" />
        <path d="M120 30v120" stroke="#3d3163" strokeWidth="1.2" opacity="0.5" />
        <path d="M88 66 118 78 88 90Zm64 0-30 12 30 12Z" fill="#07050d" />
        <motion.g {...pulse(1.4)} style={{ filter: "drop-shadow(0 0 7px var(--ichor))" }}>
          <path d="M92 70 114 78 92 86Z" fill="var(--ichor)" />
          <path d="M148 70 126 78l22 8Z" fill="var(--ichor)" />
        </motion.g>
        <path d="M106 104h28l-6 20h-16Z" fill="#07050d" />
        <path d="M96 44 120 22l24 22" fill="none" stroke="var(--ichor)" strokeWidth="1.6" opacity="0.75" />
      </motion.g>
    </g>
  );
}

const BOSS_ART = {
  "The Iron Colossus":  IronColossus,
  "Shadow Drake":       ShadowDrake,
  "The Forgotten King": ForgottenKing,
  "Void Sentinel":      VoidSentinel,
  "Abyssal Tyrant":     AbyssalTyrant,
  "The Hollow Knight":  HollowKnight,
  "Storm Warden":       StormWarden,
};

export default function BossArt({ name, defeated = false, className = "" }) {
  const Art = BOSS_ART[name] || VoidSentinel;
  return (
    <svg
      viewBox="0 0 240 180"
      className={`boss-art ${defeated ? "boss-art-defeated" : ""} ${className}`}
      role="img"
      aria-label={name}
    >
      <Art />
    </svg>
  );
}
