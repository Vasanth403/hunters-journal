import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import { CATEGORIES, TIERS, TIER_ORDER } from "../game/constants";

const REPEAT_OPTIONS = [
  { v: "daily",  name: "Daily",  desc: "Resets at midnight"      },
  { v: "weekly", name: "Weekly", desc: "Resets every Monday"     },
  { v: "once",   name: "Once",   desc: "Disappears once cleared" },
];

export default function QuestModal({ mode, initialQuest, userLevel, onSave, onClose }) {
  const [name, setName]         = useState(initialQuest?.name     || "");
  const [desc, setDesc]         = useState(initialQuest?.desc     || "");
  const [category, setCategory] = useState(initialQuest?.category || "KNOWLEDGE");
  const [repeat, setRepeat]     = useState(initialQuest?.repeat   || "daily");
  const [tier, setTier]         = useState(initialQuest?.tier     || "E");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(
      { name: name.trim(), desc: desc.trim() || "Custom quest.", category, repeat, tier },
      initialQuest?.id || null
    );
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="modal-box"
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">{mode === "edit" ? "Amend" : "Register"}</p>
            <h3 className="modal-title">{mode === "edit" ? "Edit quest" : "New quest"}</h3>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field">
            <label className="field-label">Name</label>
            <input className="field-input" placeholder="Morning run" value={name}
              onChange={(e) => setName(e.target.value)} autoFocus required />
          </div>

          <div className="field">
            <label className="field-label">Description <span className="optional">optional</span></label>
            <input className="field-input" placeholder="Five kilometres before anything else" value={desc}
              onChange={(e) => setDesc(e.target.value)} />
          </div>

          <div className="field">
            <label className="field-label">Category</label>
            <div className="cat-grid">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <button type="button" key={key}
                  className={`cat-opt co-${cat.color} ${category === key ? "co-selected" : ""}`}
                  onClick={() => setCategory(key)}
                >
                  <span className="co-name">{cat.label}</span>
                  <span className="co-meta">{cat.stat}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label">
              Difficulty <span className="optional">higher tiers unlock as you level</span>
            </label>
            <div className="tier-grid">
              {TIER_ORDER.map((t) => {
                const td       = TIERS[t];
                const locked   = userLevel < td.unlockLevel;
                const selected = tier === t;
                return (
                  <button type="button" key={t} disabled={locked}
                    className={`tier-opt ${selected ? "tier-opt-selected" : ""} ${locked ? "tier-opt-locked" : ""}`}
                    style={selected ? { borderColor: td.hex, background: `${td.hex}18`, color: td.hex } : {}}
                    onClick={() => !locked && setTier(t)}
                  >
                    {locked ? <Lock size={10} className="tier-lock-icon" /> : null}
                    <span className="tier-opt-label" style={{ color: locked ? undefined : td.hex }}>{t}</span>
                    <span className="tier-opt-xp">{locked ? `Lv.${td.unlockLevel}` : `+${td.xp} XP`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="field">
            <label className="field-label">Repeat</label>
            <div className="repeat-toggle repeat-toggle-3">
              {REPEAT_OPTIONS.map((r) => (
                <button type="button" key={r.v}
                  className={`repeat-opt ${repeat === r.v ? "repeat-selected" : ""}`}
                  onClick={() => setRepeat(r.v)}
                >
                  <span className="repeat-opt-name">{r.name}</span>
                  <span className="repeat-opt-desc">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-submit">
            {mode === "edit" ? "Save changes" : "Register quest"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
