import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Camera, LogOut, Pencil,
  Settings, Swords, Trophy, Users, Shield as ShieldIcon,
} from "lucide-react";

import { supabase, isSupabaseEnabled } from "./lib/supabase";
import { playSound } from "./lib/sound";
import { resizeImageToBase64 } from "./lib/image";

import { ACHIEVEMENTS, CATEGORIES, STORAGE_KEY, TIERS } from "./game/constants";
import {
  calcStreak, checkNewAchievements, getRankBadge, getRankTitle, getTodayKey,
  getWeeklyBoss, getWeeklyQuestCount, getWeekKey, streakMultiplier, xpNeed,
} from "./game/rules";
import { getDefaultState, parseData, safeLoad } from "./game/state";

import AuthPage from "./AuthPage";
import Leaderboard from "./social/Leaderboard";
import Friends from "./social/Friends";
import Guild from "./social/Guild";

import Analytics from "./components/Analytics";
import QuestCard from "./components/QuestCard";
import QuestModal from "./components/QuestModal";
import SettingsDrawer from "./components/SettingsDrawer";
import SetupModal from "./components/SetupModal";
import StatCard from "./components/StatCard";
import WeeklyBossCard from "./components/WeeklyBossCard";
import { AchievementToast, LevelUpOverlay, LoadingScreen } from "./components/Overlays";

import Monarch from "./art/Monarch";
import { Brackets, GateMark, RankSigil } from "./art/Sigils";
import { EmberField, StreakFlame, XpBurst } from "./art/Effects";

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData]                 = useState(() => safeLoad());
  const [questModal, setQuestModal]     = useState(null);
  const [levelUpData, setLevelUpData]   = useState(null);
  const [notification, setNotification] = useState(null);
  const [achToast, setAchToast]         = useState(null);
  const [activeTab, setActiveTab]       = useState("quests");
  const [bursts, setBursts]             = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const prevLevelRef = useRef(data.level);
  const fileInputRef = useRef(null);
  const syncTimer    = useRef(null);
  const skipNextSync = useRef(false);
  const hasMounted   = useRef(false);
  const dragIndex    = useRef(null);
  const notifTimer   = useRef(null);

  const [session, setSession]       = useState(null);
  const [authReady, setAuthReady]   = useState(!isSupabaseEnabled);
  const [cloudReady, setCloudReady] = useState(!isSupabaseEnabled);

  // ── Auth ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseEnabled) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setAuthReady(true);
      if (session) loadCloudData(session.user.id);
      else setCloudReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "SIGNED_IN")  loadCloudData(session.user.id);
      if (event === "SIGNED_OUT") { setData(getDefaultState()); localStorage.removeItem(STORAGE_KEY); setCloudReady(true); }
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadCloudData(userId) {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles").select("data").eq("id", userId).single();
      if (error?.code === "PGRST116") {
        const fresh = getDefaultState(); setData(fresh); localStorage.removeItem(STORAGE_KEY); return;
      }
      if (error) { console.error("Cloud load error:", error); return; }
      if (!profile?.data) return;
      skipNextSync.current = true;
      const loaded = parseData(profile.data);
      setData((prev) => {
        // Merge cloud data with local state, preserving whichever is more up-to-date.
        // This prevents cloud data from overwriting local completions that haven't synced yet
        // (e.g. user closed app within the 1500ms sync debounce window).
        if (prev.dayKey && loaded.dayKey) {
          if (prev.dayKey > loaded.dayKey) {
            // Local has already advanced past the cloud state (reset ran, or more recent activity).
            // Keep local's done/dayKey/bonusGiven so we don't re-apply stale completions or trigger false penalty.
            return { ...loaded, done: prev.done, dayKey: prev.dayKey, bonusGiven: prev.bonusGiven };
          }
          if (prev.dayKey === loaded.dayKey) {
            // Same day — keep whichever has more quest completions (more up-to-date).
            const prevCount  = Object.keys(prev.done).length;
            const loadedCount = Object.keys(loaded.done).length;
            if (prevCount > loadedCount) {
              return { ...loaded, done: prev.done, bonusGiven: prev.bonusGiven };
            }
          }
        }
        return loaded;
      });
    } finally {
      setCloudReady(true);
    }
  }

  // ── Cloud sync ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSupabaseEnabled || !session) return;
    if (skipNextSync.current) { skipNextSync.current = false; return; }
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      await supabase.from("user_profiles").upsert(
        { id: session.user.id, data, updated_at: new Date().toISOString() }, { onConflict: "id" }
      );
      // Sync public leaderboard data
      const totalXp     = Object.values(data.dailyLog).reduce((a, b) => a + b.xp, 0);
      const totalQuests = Object.values(data.dailyLog).reduce((a, b) => a + b.quests, 0);
      await supabase.from("user_public").upsert({
        id: session.user.id, display_name: data.name, level: data.level,
        xp_total: totalXp, rank_title: getRankTitle(data.level),
        rank_badge: getRankBadge(data.level), quests_total: totalQuests,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
    }, 1500);
    return () => clearTimeout(syncTimer.current);
  }, [data, session]);

  async function signOut() { if (isSupabaseEnabled) await supabase.auth.signOut(); }

  async function wipeAllData() {
    const fresh = {
      ...getDefaultState(),
      setupDone: data.setupDone, timezone: data.timezone,
      weekKey: data.weekKey, name: data.name, avatarUrl: data.avatarUrl,
    };
    setData(fresh);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    if (isSupabaseEnabled && session)
      await supabase.from("user_profiles").upsert({ id: session.user.id, data: fresh });
  }

  const showSetup = cloudReady && (!data.setupDone || !data.timezone);

  // ── Daily reset + penalty + shield ──────────────────────────────────────────
  useEffect(() => {
    if (!data.timezone) return;
    const tick = () => {
      const today = getTodayKey(data.timezone);
      const week  = getWeekKey(data.timezone);
      setData((p) => {
        if (p.dayKey === today) return p;

        // Notification on new day
        if (p.dayKey && "Notification" in window && Notification.permission === "granted") {
          new Notification("Hunter's Journal", { body: "A new day has begun. Your quests await, Hunter.", icon: "/pwa-192x192.png" });
        }

        const weekChanged = p.weekKey !== week;
        // If dailyLog records all quests were completed yesterday, trust that over done state
        // (done can be stale if cloud data won a race against local completions)
        const allDoneYesterday = !!(p.dailyLog?.[p.dayKey]?.allDone);
        const missedQuests = allDoneYesterday
          ? []
          : (p.quests || []).filter((q) => q.repeat === "daily" && !p.done[q.id]);

        // Penalty: -5 per missed quest per stat
        const penaltyStats = { ...p.stats };
        let penaltyApplied = false;
        if (p.dayKey && missedQuests.length > 0) {
          missedQuests.forEach((q) => {
            const stat = CATEGORIES[q.category]?.stat;
            if (stat) { penaltyStats[stat] = Math.max(0, (penaltyStats[stat] || 0) - 5); penaltyApplied = true; }
          });
        }

        // Shield: auto-consume if no activity yesterday
        const hadActivity = Object.keys(p.done).length > 0 || (p.dailyLog?.[p.dayKey]?.quests || 0) > 0;
        let shields = p.streakShields || 0;
        let shieldedDays = [...(p.shieldedDays || [])];
        if (p.dayKey && !hadActivity && shields > 0) {
          shields--;
          shieldedDays.push(p.dayKey);
        }

        const resetIds = new Set(
          (p.quests || []).filter((q) => q.repeat === "daily" || (q.repeat === "weekly" && weekChanged)).map((q) => q.id)
        );
        const newDone = Object.fromEntries(Object.entries(p.done).filter(([id]) => !resetIds.has(id)));

        return {
          ...p, dayKey: today, weekKey: week, done: newDone,
          stats: penaltyApplied ? penaltyStats : p.stats,
          streakShields: shields, shieldedDays,
          bonusGiven: false,
          _penaltyCount: penaltyApplied ? missedQuests.length : 0,
        };
      });
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [data.timezone]);

  // Show penalty toast
  useEffect(() => {
    if (!hasMounted.current) return;
    if ((data._penaltyCount || 0) > 0) {
      notify(`⚠️ Penalty: -5 to stats for ${data._penaltyCount} missed quest${data._penaltyCount > 1 ? "s" : ""}`);
      playSound("penalty");
    }
  }, [data._penaltyCount]); // eslint-disable-line

  // Bonus XP notification
  useEffect(() => {
    if (!hasMounted.current) return;
    if (data.bonusGiven) {
      notify("🏆 All quests complete! +50 Bonus EXP!");
      playSound("bonus");
    }
  }, [data.bonusGiven]); // eslint-disable-line

  // Persist
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }, [data]);

  // Level-up detection
  useEffect(() => {
    if (data.level > prevLevelRef.current) {
      prevLevelRef.current = data.level;
      setLevelUpData({ level: data.level });
      playSound("levelup");
      const t = setTimeout(() => setLevelUpData(null), 3500);
      return () => clearTimeout(t);
    }
  }, [data.level]);

  // Achievement check
  useEffect(() => {
    if (!hasMounted.current) { hasMounted.current = true; return; }
    const streak  = calcStreak(data.dailyLog, data.shieldedDays);
    const newOnes = checkNewAchievements(data, streak);
    if (newOnes.length === 0) return;
    setData((p) => ({ ...p, achievements: [...(p.achievements || []), ...newOnes.map((a) => a.id)] }));
    setAchToast(newOnes[0]);
    playSound("achievement");
  }, [data.level, data.history.length]); // eslint-disable-line

  useEffect(() => {
    if (!achToast) return;
    const t = setTimeout(() => setAchToast(null), 4500);
    return () => clearTimeout(t);
  }, [achToast]);

  // Shield earning: every 7-day streak milestone
  useEffect(() => {
    if (!hasMounted.current) return;
    const streak    = calcStreak(data.dailyLog, data.shieldedDays);
    const milestone = Math.floor(streak / 7) * 7;
    if (milestone >= 7 && milestone > data.lastShieldMilestone && data.streakShields < 3) {
      setData((p) => ({ ...p, streakShields: p.streakShields + 1, lastShieldMilestone: milestone }));
      notify(`🛡️ Streak shield earned! (${Math.min(3, data.streakShields + 1)}/3)`);
    }
  }, [data.dailyLog]); // eslint-disable-line

  // Notification reminder scheduling
  useEffect(() => {
    clearTimeout(notifTimer.current);
    if (!data.notifEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
    function scheduleNext() {
      const [h, m] = (data.notifTime || "08:00").split(":").map(Number);
      const now  = new Date();
      const next = new Date(now);
      next.setHours(h, m, 0, 0);
      if (next <= now) next.setDate(next.getDate() + 1);
      notifTimer.current = setTimeout(() => {
        const daily = (data.quests || []).filter((q) => q.repeat !== "once");
        const incomplete = daily.filter((q) => !data.done[q.id]).length;
        if (incomplete > 0) {
          new Notification("Hunter's Journal", {
            body: `⚔️ ${incomplete} quest${incomplete > 1 ? "s" : ""} awaiting completion, Hunter!`,
            icon: "/pwa-192x192.png",
          });
        }
        scheduleNext();
      }, next - now);
    }
    scheduleNext();
    return () => clearTimeout(notifTimer.current);
  }, [data.notifEnabled, data.notifTime]); // eslint-disable-line

  const need           = useMemo(() => xpNeed(data.level), [data.level]);
  const progress       = useMemo(() => Math.min(100, Math.round((data.xp / need) * 100)), [data.xp, need]);
  const completedCount = useMemo(() => Object.keys(data.done).length, [data.done]);

  function notify(msg) { setNotification(msg); setTimeout(() => setNotification(null), 3500); }

  function completeSetup({ name, timezone }) {
    setData((prev) => ({ ...prev, name, timezone, setupDone: true, dayKey: getTodayKey(timezone), weekKey: getWeekKey(timezone) }));
    if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
  }

  async function handleAvatarFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const b = await resizeImageToBase64(file); setData((p) => ({ ...p, avatarUrl: b })); notify("Avatar updated."); }
    catch { notify("Could not load image."); }
    e.target.value = "";
  }

  function completeQuest(q, evt) {
    if (data.done[q.id]) return;
    const streak = calcStreak(data.dailyLog, data.shieldedDays);
    const multi  = streakMultiplier(streak);

    // Fire the burst where the button actually is, so the reward reads as
    // coming from the thing you clicked.
    if (evt?.currentTarget) {
      const r  = evt.currentTarget.getBoundingClientRect();
      const id = `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setBursts((b) => [
        ...b,
        {
          id,
          amount: Math.round(TIERS[q.tier || "E"].xp * multi),
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          crit: multi > 1,
        },
      ]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1500);
    }

    setData((prev) => {
      if (prev.done[q.id]) return prev;
      const cat    = CATEGORIES[q.category];
      const xpGain = Math.round(TIERS[q.tier || "E"].xp * multi);
      const newDone = { ...prev.done, [q.id]: true };

      // Bonus XP if all daily quests now done
      const dailyQs = prev.quests.filter((qq) => qq.repeat !== "once");
      const allDone = dailyQs.length > 0 && dailyQs.every((qq) => newDone[qq.id]);
      const bonus   = (allDone && !prev.bonusGiven) ? 50 : 0;

      let level = prev.level, xp = prev.xp + xpGain + bonus, needNow = xpNeed(level);
      while (xp >= needNow) { xp -= needNow; level++; needNow = xpNeed(level); }

      const stats   = { ...prev.stats, [cat.stat]: (prev.stats[cat.stat] || 0) + xpGain };
      const history = [
        { t: new Date().toISOString(), name: q.name, xp: xpGain, stat: cat.stat, category: q.category, tier: q.tier || "E" },
        ...prev.history,
      ].slice(0, 50);

      const todayKey = getTodayKey(prev.timezone || "UTC");
      const pd = prev.dailyLog?.[todayKey] || { xp: 0, quests: 0, byCategory: {} };
      const dailyLog = {
        ...prev.dailyLog,
        [todayKey]: {
          xp:         pd.xp + xpGain + bonus,
          quests:     pd.quests + 1,
          byCategory: { ...pd.byCategory, [q.category]: (pd.byCategory?.[q.category] || 0) + xpGain },
          ...(allDone ? { allDone: true } : {}),
        },
      };
      return { ...prev, level, xp, stats, done: newDone, history, dailyLog, bonusGiven: allDone ? true : prev.bonusGiven };
    });
    playSound("complete");
    const bonusLabel = multi >= 2.0 ? " · ×2 streak" : multi >= 1.5 ? " · ×1.5 streak" : multi >= 1.25 ? " · ×1.25 streak" : "";
    notify(`Cleared ${q.name}${bonusLabel}`);
    if (q.repeat === "once") {
      setTimeout(() => {
        setData((prev) => ({
          ...prev,
          quests: prev.quests.filter((cq) => cq.id !== q.id),
          done:   Object.fromEntries(Object.entries(prev.done).filter(([k]) => k !== q.id)),
        }));
      }, 1800);
    }
  }

  function saveQuest(values, editId) {
    if (editId) {
      setData((prev) => ({ ...prev, quests: prev.quests.map((q) => q.id === editId ? { ...q, ...values } : q) }));
      notify("Quest updated.");
    } else {
      setData((prev) => ({ ...prev, quests: [...prev.quests, { ...values, id: `q-${Date.now()}` }] }));
      notify("New quest registered in the System.");
    }
  }

  function deleteQuest(id) {
    setData((prev) => ({
      ...prev,
      quests: prev.quests.filter((q) => q.id !== id),
      done:   Object.fromEntries(Object.entries(prev.done).filter(([k]) => k !== id)),
    }));
  }

  function completeBoss() {
    const boss = getWeeklyBoss(data.weekKey);
    setData((prev) => {
      if (prev.weeklyBossDefeated === prev.weekKey) return prev;
      let level = prev.level, xp = prev.xp + 500, needNow = xpNeed(level);
      while (xp >= needNow) { xp -= needNow; level++; needNow = xpNeed(level); }
      const todayKey = getTodayKey(prev.timezone || "UTC");
      const pd = prev.dailyLog?.[todayKey] || { xp: 0, quests: 0, byCategory: {} };
      const history = [
        { t: new Date().toISOString(), name: boss.name, xp: 500, stat: "ALL", category: "COMBAT", tier: "S" },
        ...prev.history,
      ].slice(0, 50);
      const dailyLog = { ...prev.dailyLog, [todayKey]: { ...pd, xp: pd.xp + 500, quests: pd.quests + 1 } };
      return { ...prev, level, xp, weeklyBossDefeated: prev.weekKey, history, dailyLog };
    });
    playSound("bonus");
    notify(`⚔️ Weekly Boss defeated! +500 EXP!`);
  }

  function renameHunter() {
    const n = prompt("Enter your hunter name:", data.name);
    if (n?.trim()) setData((p) => ({ ...p, name: n.trim() }));
  }

  function handleDragStart(index) { dragIndex.current = index; }
  function handleDrop(index) {
    if (dragIndex.current === null || dragIndex.current === index) return;
    setData((p) => {
      const quests = [...p.quests];
      const [moved] = quests.splice(dragIndex.current, 1);
      quests.splice(index, 0, moved);
      dragIndex.current = null;
      return { ...p, quests };
    });
  }

  if (!authReady || !cloudReady) return <LoadingScreen />;
  if (isSupabaseEnabled && !session) return <AuthPage />;

  const NAV_TABS = [
    { id: "quests",  label: "Quests",  Icon: Swords     },
    { id: "hunters", label: "Ranking", Icon: Trophy     },
    { id: "friends", label: "Allies",  Icon: Users      },
    { id: "guild",   label: "Guild",   Icon: ShieldIcon },
  ];

  const streak     = calcStreak(data.dailyLog, data.shieldedDays);
  const rankBadge  = getRankBadge(data.level);
  const openQuests = data.quests.length - completedCount;

  return (
    <div className="app-root">
      <div className="bg-layer" />
      <EmberField count={24} />
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarFile} />

      <AnimatePresence>{showSetup && <SetupModal onComplete={completeSetup} />}</AnimatePresence>
      <AnimatePresence>{levelUpData && <LevelUpOverlay level={levelUpData.level} />}</AnimatePresence>
      <AnimatePresence>{achToast && <AchievementToast achievement={achToast} />}</AnimatePresence>

      <AnimatePresence>
        {settingsOpen && (
          <SettingsDrawer
            data={data}
            setData={setData}
            todayKey={getTodayKey(data.timezone || "UTC")}
            onWipe={wipeAllData}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </AnimatePresence>

      {bursts.map((b) => (
        <XpBurst key={b.id} amount={b.amount} x={b.x} y={b.y} crit={b.crit} />
      ))}

      <AnimatePresence>
        {notification && (
          <motion.div key={notification} initial={{ opacity: 0, y: -24, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -16, x: "-50%" }} className="sys-toast">
            <span className="sys-toast-tag">System</span>{notification}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {questModal && (
          <QuestModal mode={questModal.mode} initialQuest={questModal.quest} userLevel={data.level} onSave={saveQuest} onClose={() => setQuestModal(null)} />
        )}
      </AnimatePresence>

      <div className="page-wrap">
        {/* Top bar */}
        <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="header-panel">
          <div className="brand-lockup">
            <span className="brand-mark"><GateMark size={30} /></span>
            <span className="brand-text">
              <span className="brand-name">Hunter's Journal</span>
              <span className="brand-sub">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </span>
          </div>

          <p className="header-meta">
            <span className="blue-glow">{completedCount}/{data.quests.length}</span>
            <span>cleared today</span>
            {data.timezone && <><span className="sep">·</span><span className="tz-chip">{data.timezone.replace(/_/g, " ")}</span></>}
          </p>

          <div className="header-actions">
            {isSupabaseEnabled && session && (
              <div className="sync-badge" title={`Signed in as ${session.user.email}`}>
                <span className="sync-dot" />{session.user.email}
              </div>
            )}
            <button onClick={() => setSettingsOpen(true)} className="btn-ghost" title="Settings">
              <Settings size={15} /> Settings
            </button>
            {isSupabaseEnabled && session && (
              <button onClick={signOut} className="btn-ghost btn-signout" title="Sign out">
                <LogOut size={15} /> Sign out
              </button>
            )}
          </div>
        </motion.header>

        {/* Command rail */}
        <nav className="app-nav">
          {NAV_TABS.map((t) => (
            <button
              key={t.id}
              className={`nav-tab ${activeTab === t.id ? "nav-tab-active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="nav-tab-glyph"><t.Icon size={14} /></span>
              {t.label}
              {t.id === "quests" && openQuests > 0 && <span className="tab-count">{openQuests}</span>}
            </button>
          ))}
        </nav>

        {/* Social views */}
        {activeTab === "hunters" && <Leaderboard session={session} />}
        {activeTab === "friends" && <Friends session={session} />}
        {activeTab === "guild"   && <Guild session={session} hunterName={data.name} />}

        {/* Main quests view */}
        {activeTab === "quests" && (
          <>
            {/* ── Hero band: the character IS the status window ──────────── */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="hero-band"
            >
              <Brackets />

              <div
                className="monarch-stage"
                onClick={() => fileInputRef.current?.click()}
                title="Set your portrait"
              >
                <Monarch
                  level={data.level}
                  rank={rankBadge}
                  streak={streak}
                  awakened={!!levelUpData}
                  avatarUrl={data.avatarUrl}
                />
                <div className="avatar-cam"><Camera size={12} /></div>
                <div className="monarch-plate"><small>LV</small>{data.level}</div>
              </div>

              <div className="hud">
                <div className="char-identity">
                  <span className="rank-emblem" title={rankBadge}>
                    <RankSigil rank={rankBadge} size={40} />
                  </span>
                  <div className="char-info">
                    <div className="char-name-row">
                      <p className="char-name" onClick={renameHunter}>{data.name}</p>
                      <button className="rename-btn" onClick={renameHunter} title="Rename"><Pencil size={13} /></button>
                    </div>
                    <p className="char-rank">{getRankTitle(data.level)}</p>
                    <span className="rank-chip">{rankBadge}</span>
                  </div>
                </div>

                <div className="xp-block">
                  <div className="xp-meta">
                    <span className="xp-meta-label">Experience</span>
                    <span className="blue-glow">{data.xp} / {need}</span>
                    <span className="xp-pct">{progress}%</span>
                  </div>
                  <div className="xp-track">
                    <motion.div
                      className="xp-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <div className="xp-shine" />
                  </div>
                </div>

                <div className="streak-block">
                  <StreakFlame streak={streak} size={34} />
                  <div className="streak-copy">
                    <span className="streak-count">{streak}<span> day{streak === 1 ? "" : "s"}</span></span>
                    <span className="streak-note">
                      {streak === 0
                        ? "Clear one quest to start a streak."
                        : streak >= 30 ? "Double EXP on every quest."
                        : streak >= 14 ? "1.5× EXP. Next tier at 30 days."
                        : streak >= 7  ? "1.25× EXP. Next tier at 14 days."
                        : `${7 - streak} more day${7 - streak === 1 ? "" : "s"} to reach 1.25× EXP.`}
                    </span>
                  </div>

                  {data.streakShields > 0 && (
                    <div className="shield-row">
                      <span className="shield-label">Shields</span>
                      <div className="shield-icons">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className={`shield-icon ${i < data.streakShields ? "shield-active" : "shield-empty"}`}>
                            <ShieldIcon size={15} fill={i < data.streakShields ? "currentColor" : "none"} />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="stats-section">
                  <p className="eyebrow">Attributes</p>
                  <div className="stats-grid">
                    {Object.entries(data.stats).map(([key, val]) => <StatCard key={key} statKey={key} value={val} />)}
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="main-grid">

              {/* Quest board */}
              <motion.main
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="quest-main"
              >
                <Brackets />
                <div className="board-header">
                  <div>
                    <p className="eyebrow">Quest board</p>
                    <h2 className="board-title">Today's quests</h2>
                    <p className="board-sub">
                      {openQuests === 0 && data.quests.length > 0
                        ? "Everything is cleared. Come back tomorrow."
                        : `${openQuests} still open. Clearing one raises the attribute it trains.`}
                    </p>
                  </div>
                  <button className="btn-add" onClick={() => setQuestModal({ mode: "add" })}>
                    <Plus size={16} /> Add quest
                  </button>
                </div>

                <WeeklyBossCard
                  boss={getWeeklyBoss(data.weekKey)}
                  defeated={data.weeklyBossDefeated === data.weekKey}
                  weeklyQuests={getWeeklyQuestCount(data.dailyLog, data.weekKey)}
                  onDefeat={completeBoss}
                />

                {data.quests.length === 0 ? (
                  <div className="empty-board">
                    <p className="empty-title">The board is empty</p>
                    <p className="empty-sub">
                      Add something you want to do every day. The System turns it into EXP.
                    </p>
                    <button className="btn-add" onClick={() => setQuestModal({ mode: "add" })}>
                      <Plus size={16} /> Add your first quest
                    </button>
                  </div>
                ) : (
                  <motion.div layout className="quest-grid">
                    <AnimatePresence mode="popLayout">
                      {data.quests.map((q, i) => (
                        <QuestCard
                          key={q.id} quest={q} done={!!data.done[q.id]}
                          onComplete={completeQuest}
                          onEdit={() => setQuestModal({ mode: "edit", quest: q })}
                          onDelete={() => deleteQuest(q.id)}
                          onDragStart={() => handleDragStart(i)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => handleDrop(i)}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.main>

              {/* Side column */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="side-column"
              >
                <div className="log-panel">
                  <Brackets />
                  <p className="eyebrow">Recent activity</p>
                  <div className="log-list">
                    {data.history.length === 0 ? (
                      <p className="log-empty">Nothing logged yet. Clear a quest and it shows up here.</p>
                    ) : (
                      data.history.slice(0, 10).map((h, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="log-row">
                          <span className={`log-dot ld-${CATEGORIES[h.category]?.color || "blue"}`} />
                          <span className="log-name">{h.name}</span>
                          <span className={`log-stat lt-${CATEGORIES[h.category]?.color || "blue"}`}>
                            +{h.xp} · {h.stat}
                            {h.tier && <span className="log-tier"> [{h.tier}]</span>}
                          </span>
                          <span className="log-time">{(() => {
                            const d = new Date(h.t);
                            const today = new Date();
                            const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
                            const sameDay = (a, b) => a.toLocaleDateString() === b.toLocaleDateString();
                            if (sameDay(d, today)) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                            if (sameDay(d, yesterday)) return `Yesterday ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                            return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                          })()}</span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {data.achievements?.length > 0 && (
                  <div className="ach-section">
                    <Brackets />
                    <p className="eyebrow">Achievements</p>
                    <div className="ach-grid">
                      {ACHIEVEMENTS.filter((a) => data.achievements.includes(a.id)).map((a) => (
                        <div key={a.id} className="ach-badge" title={`${a.label} — ${a.desc}`}>
                          <span className="ach-icon">{a.icon}</span>
                        </div>
                      ))}
                    </div>
                    <p className="ach-count">{data.achievements.length} of {ACHIEVEMENTS.length} unlocked</p>
                  </div>
                )}
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
              <Analytics
                dailyLog={data.dailyLog} shieldedDays={data.shieldedDays}
                stats={data.stats} completedToday={completedCount} totalToday={data.quests.length}
              />
            </motion.div>

            <p className="footer-line">Arise. The gate closes at midnight.</p>
          </>
        )}
      </div>
    </div>
  );
}
