import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { Search, UserPlus, Check, X, Users } from "lucide-react";

export default function Friends({ session }) {
  const [tab, setTab]               = useState("friends");
  const [friends, setFriends]       = useState([]);
  const [pending, setPending]       = useState([]);
  const [searchQ, setSearchQ]       = useState("");
  const [results, setResults]       = useState([]);
  const [searching, setSearching]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [sentIds, setSentIds]       = useState(new Set());

  const me = session?.user?.id;

  async function loadFriends() {
    setLoading(true);
    const { data: fs } = await supabase
      .from("friendships")
      .select("id, requester_id, receiver_id, status, user_public!friendships_requester_id_fkey(display_name,level,rank_title,rank_badge), user_public!friendships_receiver_id_fkey(display_name,level,rank_title,rank_badge)")
      .or(`requester_id.eq.${me},receiver_id.eq.${me}`);

    if (!fs) { setLoading(false); return; }
    const accepted = [], pend = [];
    fs.forEach((f) => {
      const isSender = f.requester_id === me;
      const other = isSender ? f.user_public2 : f.user_public;
      const profile = isSender
        ? (f["user_public!friendships_receiver_id_fkey"]  || f.user_public2)
        : (f["user_public!friendships_requester_id_fkey"] || f.user_public);
      if (f.status === "accepted") accepted.push({ ...f, profile });
      else if (f.status === "pending" && f.receiver_id === me) pend.push({ ...f, profile });
    });
    setFriends(accepted);
    setPending(pend);
    setLoading(false);
  }

  useEffect(() => { loadFriends(); }, []); // eslint-disable-line

  async function search(q) {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    const { data } = await supabase
      .from("user_public")
      .select("id, display_name, level, rank_title, rank_badge")
      .ilike("display_name", `%${q}%`)
      .neq("id", me)
      .limit(10);
    setResults(data || []);
    setSearching(false);
  }

  useEffect(() => {
    const t = setTimeout(() => search(searchQ), 400);
    return () => clearTimeout(t);
  }, [searchQ]); // eslint-disable-line

  async function sendRequest(userId) {
    const { error } = await supabase.from("friendships").insert({ requester_id: me, receiver_id: userId });
    if (!error) setSentIds((p) => new Set([...p, userId]));
  }

  async function acceptRequest(friendshipId) {
    await supabase.from("friendships").update({ status: "accepted" }).eq("id", friendshipId);
    loadFriends();
  }

  async function declineRequest(friendshipId) {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    loadFriends();
  }

  async function removeFriend(friendshipId) {
    await supabase.from("friendships").delete().eq("id", friendshipId);
    loadFriends();
  }

  function getProfile(f) {
    try {
      const isSender = f.requester_id === me;
      return isSender
        ? (f["user_public!friendships_receiver_id_fkey"]  || {})
        : (f["user_public!friendships_requester_id_fkey"] || {});
    } catch { return {}; }
  }

  return (
    <div className="social-panel">
      <p className="eyebrow">SOCIAL</p>
      <h2 className="social-title">Friends</h2>

      <div className="social-tabs">
        <button className={`social-tab ${tab === "friends" ? "social-tab-active" : ""}`} onClick={() => setTab("friends")}>
          Friends {friends.length > 0 && <span className="tab-count">{friends.length}</span>}
        </button>
        <button className={`social-tab ${tab === "pending" ? "social-tab-active" : ""}`} onClick={() => setTab("pending")}>
          Requests {pending.length > 0 && <span className="tab-count tab-count-orange">{pending.length}</span>}
        </button>
        <button className={`social-tab ${tab === "search" ? "social-tab-active" : ""}`} onClick={() => setTab("search")}>
          Find Hunters
        </button>
      </div>

      {tab === "search" && (
        <div className="friend-search">
          <div className="search-wrap">
            <Search size={15} className="search-icon" />
            <input
              className="field-input search-input"
              placeholder="Search by hunter name…"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              autoFocus
            />
          </div>
          {searching && <p className="log-empty">Searching…</p>}
          {results.map((u) => (
            <div key={u.id} className="friend-row">
              <div className="friend-info">
                <span className="friend-name">{u.display_name}</span>
                <span className="friend-meta">LV.{u.level} · {u.rank_title}</span>
              </div>
              <button
                className="btn-friend-add"
                onClick={() => sendRequest(u.id)}
                disabled={sentIds.has(u.id)}
              >
                {sentIds.has(u.id) ? <Check size={14} /> : <UserPlus size={14} />}
                {sentIds.has(u.id) ? "Sent" : "Add"}
              </button>
            </div>
          ))}
          {!searching && searchQ && results.length === 0 && (
            <p className="log-empty">No hunters found.</p>
          )}
        </div>
      )}

      {tab === "pending" && (
        <div className="friend-list">
          {loading ? <p className="log-empty">Loading…</p>
          : pending.length === 0 ? <p className="log-empty">No pending requests.</p>
          : pending.map((f) => {
              const p = getProfile(f);
              return (
                <div key={f.id} className="friend-row">
                  <div className="friend-info">
                    <span className="friend-name">{p.display_name || "Hunter"}</span>
                    <span className="friend-meta">LV.{p.level || 1} · {p.rank_title || "Unranked"}</span>
                  </div>
                  <div className="friend-actions">
                    <button className="btn-friend-accept" onClick={() => acceptRequest(f.id)}><Check size={14} /> Accept</button>
                    <button className="btn-friend-decline" onClick={() => declineRequest(f.id)}><X size={14} /></button>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {tab === "friends" && (
        <div className="friend-list">
          {loading ? <p className="log-empty">Loading…</p>
          : friends.length === 0 ? (
            <div className="social-empty">
              <Users size={32} />
              <p>No friends yet. Search for hunters to add them.</p>
            </div>
          ) : friends.map((f) => {
              const p = getProfile(f);
              return (
                <div key={f.id} className="friend-row">
                  <div className="friend-info">
                    <span className="friend-name">{p.display_name || "Hunter"}</span>
                    <span className="friend-meta">LV.{p.level || 1} · {p.rank_title || "Unranked"}</span>
                  </div>
                  <div className="friend-actions">
                    <span className="lb-badge" style={{ fontSize: "0.6rem" }}>{p.rank_badge || "UNRANKED"}</span>
                    <button className="btn-friend-decline" onClick={() => removeFriend(f.id)} title="Remove friend"><X size={14} /></button>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}
    </div>
  );
}
