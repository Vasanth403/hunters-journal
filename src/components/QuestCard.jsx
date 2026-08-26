import React from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, GripVertical, Pencil, X } from "lucide-react";
import { CATEGORIES, TIERS } from "../game/constants";
import { CategoryGlyph } from "../art/Sigils";

export default function QuestCard({
  quest, done, onComplete, onEdit, onDelete, onDragStart, onDragOver, onDrop,
}) {
  const cat      = CATEGORIES[quest.category] || CATEGORIES.DISCIPLINE;
  const tierKey  = quest.tier || "E";
  const tier     = TIERS[tierKey];
  const isWeekly = quest.repeat === "weekly";

  return (
    <motion.div
      layout layoutId={quest.id}
      draggable onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop}
      whileHover={!done ? { y: -5 } : {}}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`quest-card qc-${cat.color} ${done ? "qc-done" : ""} ${isWeekly ? "qc-weekly" : ""}`}
    >
      {done && <span className="cleared-stamp"><Check size={11} /> CLEARED</span>}

      <div className="qcard-top">
        <div className="qcard-left">
          <div className="drag-handle"><GripVertical size={13} /></div>
          <div className={`qicon qi-${cat.color}`}><CategoryGlyph category={quest.category} size={18} /></div>
        </div>
        <div className="qcard-badges">
          <span className={`cat-badge cb-${cat.color}`}>{cat.label}</span>
          <span className="tier-badge" style={{ color: tier.hex, borderColor: `${tier.hex}55`, background: `${tier.hex}14` }}>
            {tierKey}
          </span>
          {quest.repeat === "once" && <span className="once-badge">ONCE</span>}
          {isWeekly && <span className="weekly-badge">WEEKLY</span>}
          <button className="icon-btn" onClick={onEdit} aria-label="Edit quest"><Pencil size={11} /></button>
          <button className="icon-btn del-btn" onClick={onDelete} aria-label="Delete quest"><X size={11} /></button>
        </div>
      </div>

      <div className="qcard-body">
        <p className="quest-name">{quest.name}</p>
        <p className="quest-desc">{quest.desc}</p>
        <div className="quest-reward">
          <span className="xp-tag">+{tier.xp} EXP</span>
          <span className={`stat-tag st-${cat.color}`}>{cat.stat}</span>
        </div>
        {/* The event is passed up so the XP burst can spawn on the button itself. */}
        <button
          className={done ? "btn-done" : `btn-complete bc-${cat.color}`}
          disabled={done}
          onClick={(e) => onComplete(quest, e)}
        >
          {done ? "Cleared" : <><span>Clear quest</span><ChevronRight size={14} /></>}
        </button>
      </div>
    </motion.div>
  );
}
