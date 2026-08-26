import { STORAGE_KEY } from "./constants";

/* ═══════════════════════════════════════════════════════════════════════════
   Save shape and loading.

   parseData is deliberately total: every field gets a default, so a save
   written by an older build (or a half-synced cloud row) still loads instead
   of crashing the app on a missing key.
   ═══════════════════════════════════════════════════════════════════════════ */

export function getDefaultState() {
  return {
    name: "Hunter", avatarUrl: "",
    level: 1, xp: 0,
    stats: { STR: 0, MND: 0, DIS: 0, VIT: 0, CRE: 0 },
    done: {}, history: [],
    dayKey: "", weekKey: "",
    quests: [], dailyLog: {},
    timezone: null, setupDone: false,
    achievements: [],
    streakShields: 0,
    shieldedDays: [],
    lastShieldMilestone: 0,
    bonusGiven: false,
    notifEnabled: false,
    notifTime: "08:00",
    weeklyBossDefeated: "",
    obsidianVault: "",
  };
}

export function parseData(d) {
  return {
    name:                d.name ?? "Hunter",
    avatarUrl:           d.avatarUrl ?? "",
    level:               Number(d.level) || 1,
    xp:                  Number(d.xp) || 0,
    stats: {
      STR: Number(d?.stats?.STR) || 0, MND: Number(d?.stats?.MND) || 0,
      DIS: Number(d?.stats?.DIS) || 0, VIT: Number(d?.stats?.VIT) || 0,
      CRE: Number(d?.stats?.CRE) || 0,
    },
    done:                d.done || {},
    history:             Array.isArray(d.history) ? d.history : [],
    dayKey:              d.dayKey ?? "",
    weekKey:             d.weekKey ?? "",
    quests:              Array.isArray(d.quests) ? d.quests : [],
    dailyLog:            d.dailyLog && typeof d.dailyLog === "object" ? d.dailyLog : {},
    timezone:            d.timezone ?? null,
    setupDone:           d.setupDone ?? false,
    achievements:        Array.isArray(d.achievements) ? d.achievements : [],
    streakShields:       Number(d.streakShields) || 0,
    shieldedDays:        Array.isArray(d.shieldedDays) ? d.shieldedDays : [],
    lastShieldMilestone: Number(d.lastShieldMilestone) || 0,
    bonusGiven:          d.bonusGiven ?? false,
    notifEnabled:        d.notifEnabled ?? false,
    notifTime:           d.notifTime ?? "08:00",
    weeklyBossDefeated:  d.weeklyBossDefeated ?? "",
    obsidianVault:       d.obsidianVault ?? "",
  };
}

/** Never throws — a corrupt save falls back to a fresh one rather than a blank screen. */
export function safeLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    return parseData(JSON.parse(raw));
  } catch { return getDefaultState(); }
}
