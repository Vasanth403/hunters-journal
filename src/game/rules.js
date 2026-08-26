import { ACHIEVEMENTS, CAT_ORDER, WEEKLY_BOSSES } from "./constants";

/* ═══════════════════════════════════════════════════════════════════════════
   Pure game rules. Every function here takes state and returns a value —
   nothing reads localStorage, touches the DOM, or renders. That makes the
   progression system testable on its own.
   ═══════════════════════════════════════════════════════════════════════════ */

// ─── Levelling ────────────────────────────────────────────────────────────────

/** EXP required to clear the given level. Quadratic, so late levels bite. */
export function xpNeed(level) {
  return Math.round(100 + level * 25 + level * level * 5);
}

export function getRankTitle(level) {
  if (level >= 100) return "Shadow Monarch";
  if (level >= 80)  return "National-Level Hunter";
  if (level >= 60)  return "S-Rank Hunter";
  if (level >= 45)  return "A-Rank Hunter";
  if (level >= 30)  return "B-Rank Hunter";
  if (level >= 20)  return "C-Rank Hunter";
  if (level >= 12)  return "D-Rank Hunter";
  if (level >= 5)   return "E-Rank Hunter";
  return "Unranked";
}

export function getRankBadge(level) {
  if (level >= 60) return "S-RANK";
  if (level >= 45) return "A-RANK";
  if (level >= 30) return "B-RANK";
  if (level >= 20) return "C-RANK";
  if (level >= 12) return "D-RANK";
  if (level >= 5)  return "E-RANK";
  return "UNRANKED";
}

// ─── Day boundaries ───────────────────────────────────────────────────────────
/* Keys are en-CA (YYYY-MM-DD) so they sort lexicographically, which the cloud
   merge in App relies on to tell which device is further ahead. */

export function getTodayKey(tz) {
  try { return new Date().toLocaleDateString("en-CA", { timeZone: tz }); }
  catch { return new Date().toLocaleDateString("en-CA"); }
}

/** Monday-anchored week key. */
export function getWeekKey(tz) {
  try {
    const s = new Date().toLocaleDateString("en-CA", { timeZone: tz });
    const d = new Date(s + "T00:00:00");
    d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
    return d.toLocaleDateString("en-CA");
  } catch { return new Date().toLocaleDateString("en-CA"); }
}

// ─── Streaks ──────────────────────────────────────────────────────────────────

/** Counts back from today; a shielded day keeps the chain alive. */
export function calcStreak(dailyLog, shieldedDays = []) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const shields = new Set(shieldedDays || []);
  let streak = 0;
  const d = new Date(today);
  while (true) {
    const key = d.toLocaleDateString("en-CA");
    if ((dailyLog[key]?.quests || 0) > 0 || shields.has(key)) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
}

/** EXP multiplier earned by the current streak. */
export function streakMultiplier(streak) {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.5;
  if (streak >= 7)  return 1.25;
  return 1.0;
}

// ─── Weekly boss ──────────────────────────────────────────────────────────────

/** Same boss all week, rotating deterministically so it can't be rerolled. */
export function getWeeklyBoss(weekKey) {
  if (!weekKey) return WEEKLY_BOSSES[0];
  const d = new Date(weekKey + "T00:00:00");
  const weekNum = Math.floor(d.getTime() / (7 * 24 * 60 * 60 * 1000));
  return WEEKLY_BOSSES[Math.abs(weekNum) % WEEKLY_BOSSES.length];
}

export function getWeeklyQuestCount(dailyLog, weekKey) {
  if (!weekKey) return 0;
  let count = 0;
  const start = new Date(weekKey + "T00:00:00");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  for (const d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    count += dailyLog[d.toLocaleDateString("en-CA")]?.quests || 0;
  }
  return count;
}

// ─── Achievements ─────────────────────────────────────────────────────────────

/** Returns only achievements newly satisfied — already-held ones are filtered. */
export function checkNewAchievements(data, streak) {
  const already     = new Set(data.achievements || []);
  const totalXp     = Object.values(data.dailyLog).reduce((a, b) => a + b.xp, 0);
  const totalQuests = Object.values(data.dailyLog).reduce((a, b) => a + b.quests, 0);
  const cats        = new Set((data.history || []).map((h) => h.category));
  const hasSQuest   = (data.history || []).some((h) => h.tier === "S");
  const usedShield  = (data.shieldedDays || []).length > 0;

  const passes = {
    first_quest:  totalQuests >= 1,
    streak_3:     streak >= 3,
    streak_7:     streak >= 7,
    streak_30:    streak >= 30,
    level_5:      data.level >= 5,
    level_20:     data.level >= 20,
    level_50:     data.level >= 50,
    xp_1000:      totalXp >= 1000,
    xp_10000:     totalXp >= 10000,
    quests_50:    totalQuests >= 50,
    all_cats:     CAT_ORDER.every((c) => cats.has(c)),
    s_tier:       hasSQuest,
    shield_used:  usedShield,
  };
  return ACHIEVEMENTS.filter((a) => !already.has(a.id) && passes[a.id]);
}
