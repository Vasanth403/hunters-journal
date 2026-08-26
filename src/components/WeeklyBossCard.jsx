import React from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, Lock } from "lucide-react";
import { BOSS_THRESHOLD } from "../game/constants";
import BossArt from "../art/Bosses";
import { Brackets } from "../art/Sigils";

export default function WeeklyBossCard({ boss, defeated, weeklyQuests, onDefeat }) {
  const unlocked = weeklyQuests >= BOSS_THRESHOLD;
  const progress = Math.min(100, Math.round((weeklyQuests / BOSS_THRESHOLD) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
      className={`weekly-boss-card ${defeated ? "boss-defeated" : ""}`}
    >
      <Brackets />

      <div className="boss-stage">
        <BossArt name={boss.name} defeated={defeated} />
      </div>

      <div className="boss-body">
        <div className="boss-header">
          <div className="boss-header-left">
            <span className="boss-eyebrow">This week's boss</span>
            <p className="boss-name">{boss.name}</p>
          </div>
          {defeated
            ? <span className="boss-cleared-stamp"><Check size={11} /> Defeated</span>
            : <span className="boss-xp-badge">+500 EXP</span>}
        </div>

        <p className="boss-desc">{boss.desc}</p>

        {!defeated && !unlocked && (
          <div className="boss-lock-row">
            <div className="boss-lock-track">
              <motion.div
                className="boss-lock-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </div>
            <span className="boss-lock-label">
              {weeklyQuests} of {BOSS_THRESHOLD} quests cleared this week
            </span>
          </div>
        )}

        <button
          className={defeated ? "btn-done boss-btn" : "btn-complete bc-red boss-btn"}
          disabled={defeated || !unlocked}
          onClick={onDefeat}
        >
          {defeated
            ? "Defeated"
            : !unlocked
              ? <><Lock size={13} /><span>Sealed</span></>
              : <><span>Challenge</span><ChevronRight size={14} /></>}
        </button>
      </div>
    </motion.div>
  );
}
