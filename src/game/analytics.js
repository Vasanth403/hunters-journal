/* ═══════════════════════════════════════════════════════════════════════════
   Shaping the daily log into things a chart can draw.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Returns weeks of 7 days, oldest first — the shape the heatmap grid renders. */
export function buildHeatmap(dailyLog, shieldedDays = [], weeks = 14) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const shields = new Set(shieldedDays || []);
  const days = [];
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toLocaleDateString("en-CA");
    days.push({
      key, quests: dailyLog[key]?.quests || 0, xp: dailyLog[key]?.xp || 0,
      shielded: shields.has(key),
      label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    });
  }
  const result = [];
  for (let i = 0; i < days.length; i += 7) result.push(days.slice(i, i + 7));
  return result;
}

/** The trailing seven days, today last. */
export function buildWeek(dailyLog) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    const key = d.toLocaleDateString("en-CA"); const entry = dailyLog[key];
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      quests: entry?.quests || 0,
      xp: entry?.xp || 0,
      byCategory: entry?.byCategory || {},
      isToday: i === 6,
    };
  });
}

/* Heatmap ramps through the monarch violet and tops out near white-violet, so
   the best days read as reward rather than just "more blue". Shielded days go
   gold — they're a resource you spent, not a day you worked. */
export function cellColor(q, shielded) {
  if (shielded) return "rgba(232,179,60,0.34)";
  if (q === 0) return "rgba(140,116,214,0.07)";
  if (q === 1) return "rgba(109,74,255,0.3)";
  if (q === 2) return "rgba(109,74,255,0.55)";
  if (q === 3) return "rgba(140,105,255,0.8)";
  return "rgba(182,149,255,0.98)";
}

export function cellGlow(q, shielded) {
  if (shielded) return "0 0 7px rgba(232,179,60,0.45)";
  if (q >= 4) return "0 0 9px rgba(140,105,255,0.7)";
  if (q >= 2) return "0 0 5px rgba(109,74,255,0.35)";
  return "none";
}
