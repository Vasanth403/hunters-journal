import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CATEGORIES, CAT_COLORS_HEX, CAT_ORDER } from "../game/constants";
import { calcStreak } from "../game/rules";
import { buildHeatmap, buildWeek, cellColor, cellGlow } from "../game/analytics";
import { Brackets } from "../art/Sigils";

// ─── StatRadarChart ───────────────────────────────────────────────────────────
const RADAR_AXES = [
  { key: "STR", color: "#ff5a47" },
  { key: "MND", color: "#4ca8ff" },
  { key: "DIS", color: "#8b6bff" },
  { key: "VIT", color: "#3fd9a0" },
  { key: "CRE", color: "#e8b33c" },
];

function StatRadarChart({ stats }) {
  // r is kept small enough that the outer value labels stay inside the box.
  const cx = 110, cy = 110, r = 62, n = RADAR_AXES.length;
  const maxVal = Math.max(1, ...RADAR_AXES.map((a) => stats[a.key] || 0));

  function pt(i, ratio) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) };
  }
  function poly(ratio) {
    return RADAR_AXES.map((_, i) => { const p = pt(i, ratio); return `${p.x},${p.y}`; }).join(" ");
  }

  // Floor the ratio so a zeroed stat still shows a vertex rather than collapsing.
  const dataPoints = RADAR_AXES.map((a, i) => pt(i, Math.max(0.04, (stats[a.key] || 0) / maxVal)));
  const dataPoly = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 220 220" className="radar-svg">
      {[0.25, 0.5, 0.75, 1].map((ratio, gi) => (
        <polygon key={gi} points={poly(ratio)} fill="none"
          stroke={gi === 3 ? "rgba(140,116,214,0.3)" : "rgba(140,116,214,0.11)"} strokeWidth="1" />
      ))}
      {RADAR_AXES.map((_, i) => {
        const p = pt(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(140,116,214,0.18)" strokeWidth="1" />;
      })}
      <polygon points={dataPoly} fill="rgba(109,74,255,0.18)" stroke="#8b6bff" strokeWidth="1.6" strokeLinejoin="round" />
      {RADAR_AXES.map((a, i) => {
        const p = dataPoints[i];
        return <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={a.color} style={{ filter: `drop-shadow(0 0 4px ${a.color})` }} />;
      })}
      {RADAR_AXES.map((a, i) => {
        const lp = pt(i, 1.32);
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
            fill={a.color} fontSize="10" fontFamily="'Chakra Petch', sans-serif" fontWeight="700" letterSpacing="1">
            {a.key}
          </text>
        );
      })}
      {RADAR_AXES.map((a, i) => {
        const vp = pt(i, 1.64);
        return (
          <text key={`v-${i}`} x={vp.x} y={vp.y} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(164,156,190,0.85)" fontSize="8.5" fontFamily="'Chakra Petch', sans-serif">
            {stats[a.key] || 0}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export default function Analytics({ dailyLog, shieldedDays, stats, completedToday, totalToday }) {
  const [tooltip, setTooltip] = useState(null);

  const streak   = useMemo(() => calcStreak(dailyLog, shieldedDays),  [dailyLog, shieldedDays]);
  const heatmap  = useMemo(() => buildHeatmap(dailyLog, shieldedDays), [dailyLog, shieldedDays]);
  const weekDays = useMemo(() => buildWeek(dailyLog),                  [dailyLog]);

  const totals = useMemo(() => {
    let totalXp = 0, totalDays = 0, bestDay = 0, totalQuests = 0;
    Object.values(dailyLog).forEach((d) => {
      totalXp += d.xp; totalDays++; totalQuests += d.quests;
      if (d.quests > bestDay) bestDay = d.quests;
    });
    return { totalXp, totalDays, bestDay, totalQuests };
  }, [dailyLog]);

  const catTotals = useMemo(() => {
    const acc = {};
    Object.values(dailyLog).forEach((d) =>
      Object.entries(d.byCategory || {}).forEach(([cat, xp]) => { acc[cat] = (acc[cat] || 0) + xp; })
    );
    return acc;
  }, [dailyLog]);

  const maxCatXp      = Math.max(1, ...Object.values(catTotals));
  const maxWeekQuests = Math.max(1, ...weekDays.map((d) => d.quests));

  return (
    <div className="analytics-panel">
      <Brackets />
      <p className="eyebrow">Record</p>

      <div className="analytics-pills">
        {[
          { val: streak,             label: "Day streak"     },
          { val: totals.totalQuests, label: "Quests cleared" },
          { val: totals.totalXp,     label: "EXP earned"     },
          { val: totals.bestDay,     label: "Best day"       },
          { val: totals.totalDays,   label: "Active days"    },
          { val: totalToday > 0 ? `${Math.round((completedToday / totalToday) * 100)}%` : "—", label: "Today" },
        ].map((p) => (
          <div key={p.label} className="a-pill">
            <span className="a-pill-val">{p.val}</span>
            <span className="a-pill-label">{p.label}</span>
          </div>
        ))}
      </div>

      <div className="heatmap-section">
        <p className="analytics-sub-label">
          Last 14 weeks <span className="heatmap-legend-note">🛡️ marks a day a shield covered</span>
        </p>
        <div className="heatmap-grid">
          {heatmap.map((week, wi) => (
            <div key={wi} className="heatmap-week">
              {week.map((day) => (
                <div key={day.key} className="heatmap-cell"
                  style={{ background: cellColor(day.quests, day.shielded), boxShadow: cellGlow(day.quests, day.shielded) }}
                  onMouseMove={(e) => setTooltip({ day, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {tooltip && (
          <div className="heatmap-tooltip" style={{
            left: tooltip.x + 14,
            // Flip above the cursor near the bottom edge so it never clips off-screen.
            top: tooltip.y > window.innerHeight - 80 ? tooltip.y - 60 : tooltip.y + 16,
          }}>
            <span className="ht-date">{tooltip.day.label}</span>
            <span className="ht-val">
              {tooltip.day.shielded
                ? "Shield spent"
                : tooltip.day.quests === 0
                  ? "Nothing cleared"
                  : `${tooltip.day.quests} quest${tooltip.day.quests !== 1 ? "s" : ""} · ${tooltip.day.xp} EXP`}
            </span>
          </div>
        )}

        <div className="hl-row">
          <span className="hl-label">Less</span>
          {[0, 1, 2, 3, 4].map((q) => (
            <div key={q} className="heatmap-cell"
              style={{ background: cellColor(q, false), display: "inline-block", margin: "0 2px" }} />
          ))}
          <span className="hl-label">More</span>
        </div>
      </div>

      <div className="analytics-bottom">
        <div className="radar-section">
          <p className="analytics-sub-label">Attribute spread</p>
          <StatRadarChart stats={stats} />
        </div>

        <div className="week-chart">
          <p className="analytics-sub-label">This week</p>
          <div className="week-bars">
            {weekDays.map((day, i) => (
              <div key={i} className="week-bar-col">
                <div className="week-bar-wrap">
                  <div
                    className={`week-bar ${day.isToday ? "week-bar-today" : ""}`}
                    style={{ height: `${Math.max(4, Math.round((day.quests / maxWeekQuests) * 100))}%` }}
                  >
                    {/* Each bar is stacked by where that day's EXP actually went. */}
                    <div className="week-bar-inner">
                      {CAT_ORDER.map((cat) => {
                        const catXp = day.byCategory?.[cat] || 0;
                        return catXp > 0
                          ? <div key={cat} style={{ flex: catXp / (day.xp || 1), background: CAT_COLORS_HEX[cat], opacity: 0.85 }} />
                          : null;
                      })}
                    </div>
                  </div>
                </div>
                <span className={`week-day-label ${day.isToday ? "wdl-today" : ""}`}>{day.label}</span>
                <span className="week-quest-count">{day.quests}</span>
              </div>
            ))}
          </div>
          <div className="cat-legend">
            {CAT_ORDER.map((cat) => (
              <div key={cat} className="cat-legend-item">
                <span className="cat-legend-dot" style={{ background: CAT_COLORS_HEX[cat] }} />
                <span className="cat-legend-label">{CATEGORIES[cat].label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cat-breakdown">
          <p className="analytics-sub-label">Where your EXP went</p>
          {totals.totalXp === 0 ? (
            <p className="log-empty">Clear a quest and this fills in.</p>
          ) : (
            <div className="cat-bars">
              {CAT_ORDER.map((cat) => {
                const xp  = catTotals[cat] || 0;
                const pct = Math.round((xp / maxCatXp) * 100);
                const c   = CATEGORIES[cat];
                return (
                  <div key={cat} className="cat-bar-row">
                    <div className="cat-bar-label-cell">
                      <span className={`stat-tag st-${c.color}`}>{c.stat}</span>
                      <span className="cat-bar-name">{c.label}</span>
                    </div>
                    <div className="cat-bar-track">
                      <motion.div className={`cat-bar-fill cbf-${c.color}`}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }} />
                    </div>
                    <span className="cat-bar-xp">{xp}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
