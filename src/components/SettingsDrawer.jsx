import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  exportToObsidian, generateDailyNote, generateHunterProfile, generateQuestArchive,
} from "../lib/obsidian";

/* ─── ObsidianExport ──────────────────────────────────────────────────────── */
function ObsidianExport({ data, todayKey, onVaultChange }) {
  const [vault, setVault] = useState(data.obsidianVault || "");

  function handleVaultChange(v) {
    setVault(v);
    onVaultChange(v);
  }

  function doExport(type) {
    let content, filePath;
    if (type === "daily") {
      content  = generateDailyNote(data, todayKey);
      filePath = `Hunter's Journal/${todayKey}`;
    } else if (type === "profile") {
      content  = generateHunterProfile(data);
      filePath = `Hunter's Journal/Profile — ${data.name}`;
    } else {
      content  = generateQuestArchive(data);
      filePath = `Hunter's Journal/Quest Archive`;
    }
    exportToObsidian(content, filePath, vault);
  }

  return (
    <div className="obsidian-section">
      <p className="eyebrow">Export to Obsidian</p>
      <div className="obsidian-vault-row">
        <input
          className="field-input obsidian-vault-input"
          placeholder="Vault name"
          value={vault}
          onChange={(e) => handleVaultChange(e.target.value)}
        />
      </div>
      <p className="obsidian-hint">
        {vault.trim()
          ? `Opens straight into your "${vault.trim()}" vault.`
          : "Leave this blank to download a .md file instead."}
      </p>
      <div className="obsidian-btns">
        <button className="btn-obsidian" onClick={() => doExport("daily")} title="Today's quest log">Daily note</button>
        <button className="btn-obsidian" onClick={() => doExport("profile")} title="Profile and achievements">Profile</button>
        <button className="btn-obsidian" onClick={() => doExport("archive")} title="Every quest and its history">Archive</button>
      </div>
    </div>
  );
}

/* ─── SettingsDrawer ──────────────────────────────────────────────────────────
   Reminders, export and the danger zone used to live in the character panel,
   which made the sidebar a junk drawer. They're settings — they belong in one. */
export default function SettingsDrawer({ data, setData, todayKey, onWipe, onClose }) {
  const [confirmWipe, setConfirmWipe] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function toggleNotif(checked) {
    // Only flip the setting on once permission is actually granted, otherwise
    // the toggle would claim reminders are on while the browser blocks them.
    if (checked && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") setData((p) => ({ ...p, notifEnabled: true }));
      });
    } else {
      setData((p) => ({ ...p, notifEnabled: checked }));
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="drawer-backdrop" onClick={onClose}
      />
      <motion.aside
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
        className="drawer-body"
        role="dialog" aria-label="Settings"
      >
        <div className="drawer-head">
          <div>
            <p className="eyebrow">Configuration</p>
            <h2 className="drawer-title">Settings</h2>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close settings"><X size={20} /></button>
        </div>

        <div className="drawer-section">
          <div className="notif-settings">
            <p className="eyebrow">Daily reminder</p>
            <div className="notif-row">
              <label className="notif-toggle-label">
                <input type="checkbox" checked={!!data.notifEnabled} onChange={(e) => toggleNotif(e.target.checked)} />
                Remind me
              </label>
              <input
                type="time"
                className="notif-time-input"
                value={data.notifTime || "08:00"}
                disabled={!data.notifEnabled}
                onChange={(e) => setData((p) => ({ ...p, notifTime: e.target.value }))}
              />
            </div>
            <p className="notif-note">
              Fires at this time when quests are still open. The app has to be running for it to reach you.
            </p>
          </div>
        </div>

        <div className="drawer-section">
          <ObsidianExport
            data={data}
            todayKey={todayKey}
            onVaultChange={(v) => setData((p) => ({ ...p, obsidianVault: v }))}
          />
        </div>

        <div className="drawer-section">
          <p className="eyebrow">Danger zone</p>
          <div className="wipe-row">
            {confirmWipe ? (
              <>
                <span className="wipe-confirm-text">
                  This erases every level, quest, stat and log entry. It cannot be undone.
                </span>
                <button className="btn-wipe-confirm" onClick={() => { onWipe(); setConfirmWipe(false); onClose(); }}>
                  Erase everything
                </button>
                <button className="btn-wipe-cancel" onClick={() => setConfirmWipe(false)}>Keep it</button>
              </>
            ) : (
              <button className="btn-wipe" onClick={() => setConfirmWipe(true)}>Wipe all data</button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}
