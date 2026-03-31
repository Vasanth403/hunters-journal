import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { RefreshCw } from "lucide-react";

export default function Leaderboard({ session }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("user_public")
      .select("id, display_name, level, xp_total, rank_title, rank_badge, quests_total")
      .order("level",    { ascending: false })
      .order("xp_total", { ascending: false })
      .limit(100);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const top3Colors = ["#f59e0b", "#94a3b8", "#cd7c2f"];

  return (
    <div className="social-panel">
      <div className="social-head">
        <div>
          <p className="eyebrow">GLOBAL RANKINGS</p>
          <h2 className="social-title">Hunter Leaderboard</h2>
        </div>
        <button className="btn-icon-sm" onClick={load} title="Refresh" disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin" : ""} />
        </button>
      </div>

      {loading ? (
        <p className="log-empty">Loading rankings…</p>
      ) : rows.length === 0 ? (
        <p className="log-empty">No hunters registered yet.</p>
      ) : (
        <div className="lb-list">
          {rows.map((row, i) => {
            const isSelf = row.id === session?.user?.id;
            const isTop3 = i < 3;
            return (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.025, 0.5) }}
                className={`lb-row ${isSelf ? "lb-row-self" : ""}`}
              >
                <span className="lb-pos" style={{ color: isTop3 ? top3Colors[i] : undefined }}>
                  {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <div className="lb-info">
                  <span className="lb-name">{row.display_name}{isSelf && <span className="lb-you"> (You)</span>}</span>
                  <span className="lb-meta">{row.rank_title} · {row.quests_total} quests</span>
                </div>
                <div className="lb-right">
                  <span className="lb-level">LV.{row.level}</span>
                  <span className="lb-badge">{row.rank_badge}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
