import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { Copy, Check, LogOut, Plus, Hash } from "lucide-react";

export default function Guild({ session, hunterName }) {
  const [membership, setMembership] = useState(null); // { guild, role }
  const [members, setMembers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [mode, setMode]             = useState("menu"); // menu | create | join
  const [guildName, setGuildName]   = useState("");
  const [guildDesc, setGuildDesc]   = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied]         = useState(false);
  const [error, setError]           = useState(null);

  const me = session?.user?.id;

  async function loadGuild() {
    setLoading(true);
    const { data } = await supabase
      .from("guild_members")
      .select("role, guilds(id, name, description, invite_code, leader_id)")
      .eq("user_id", me)
      .maybeSingle();

    if (data?.guilds) {
      setMembership({ guild: data.guilds, role: data.role });
      loadMembers(data.guilds.id);
    } else {
      setMembership(null);
    }
    setLoading(false);
  }

  async function loadMembers(guildId) {
    const { data } = await supabase
      .from("guild_members")
      .select("user_id, role, joined_at, user_public(display_name, level, rank_title, rank_badge)")
      .eq("guild_id", guildId)
      .order("joined_at", { ascending: true });
    setMembers(data || []);
  }

  useEffect(() => { loadGuild(); }, []); // eslint-disable-line

  async function createGuild(e) {
    e.preventDefault();
    setError(null);
    if (!guildName.trim()) return;
    const { data: guild, error: err } = await supabase
      .from("guilds")
      .insert({ name: guildName.trim(), description: guildDesc.trim(), leader_id: me })
      .select().single();
    if (err) { setError(err.message.includes("unique") ? "A guild with that name already exists." : err.message); return; }
    await supabase.from("guild_members").insert({ guild_id: guild.id, user_id: me, role: "leader" });
    loadGuild();
  }

  async function joinGuild(e) {
    e.preventDefault();
    setError(null);
    const { data: guild, error: err } = await supabase
      .from("guilds")
      .select("id, name")
      .eq("invite_code", inviteCode.toUpperCase().trim())
      .maybeSingle();
    if (err || !guild) { setError("Invalid invite code."); return; }
    const { error: joinErr } = await supabase.from("guild_members").insert({ guild_id: guild.id, user_id: me });
    if (joinErr) { setError("Could not join guild."); return; }
    loadGuild();
  }

  async function leaveGuild() {
    if (!membership) return;
    if (membership.role === "leader") {
      const isLast = members.length === 1;
      if (isLast) {
        // Disband guild
        await supabase.from("guilds").delete().eq("id", membership.guild.id);
      } else {
        // Transfer leadership to next member
        const nextMember = members.find((m) => m.user_id !== me);
        if (nextMember) {
          await supabase.from("guilds").update({ leader_id: nextMember.user_id }).eq("id", membership.guild.id);
          await supabase.from("guild_members").update({ role: "leader" }).eq("guild_id", membership.guild.id).eq("user_id", nextMember.user_id);
        }
      }
    }
    await supabase.from("guild_members").delete().eq("user_id", me).eq("guild_id", membership.guild.id);
    setMembership(null); setMembers([]); setMode("menu");
  }

  function copyCode() {
    navigator.clipboard.writeText(membership.guild.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="social-panel"><p className="log-empty">Loading guild…</p></div>;

  if (membership) {
    const { guild, role } = membership;
    return (
      <div className="social-panel">
        <div className="social-head">
          <div>
            <p className="eyebrow">GUILD</p>
            <h2 className="social-title">{guild.name}</h2>
            {guild.description && <p className="guild-desc">{guild.description}</p>}
          </div>
          <button className="btn-leave" onClick={leaveGuild} title={role === "leader" && members.length === 1 ? "Disband guild" : "Leave guild"}>
            <LogOut size={14} /> {role === "leader" && members.length === 1 ? "Disband" : "Leave"}
          </button>
        </div>

        {role === "leader" && (
          <div className="invite-box">
            <span className="invite-label">INVITE CODE</span>
            <span className="invite-code">{guild.invite_code}</span>
            <button className="btn-icon-sm" onClick={copyCode}>{copied ? <Check size={14} /> : <Copy size={14} />}</button>
          </div>
        )}

        <p className="analytics-sub-label" style={{ marginTop: "1.25rem" }}>MEMBERS — {members.length}</p>
        <div className="guild-members">
          {members.map((m, i) => {
            const p = m.user_public || {};
            const isLeader = m.role === "leader";
            return (
              <motion.div key={m.user_id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className={`guild-member-row ${m.user_id === me ? "gm-self" : ""}`}>
                <span className="gm-pos">#{i + 1}</span>
                <div className="friend-info">
                  <span className="friend-name">{p.display_name || "Hunter"}{isLeader && <span className="leader-crown"> 👑</span>}</span>
                  <span className="friend-meta">LV.{p.level || 1} · {p.rank_title || "Unranked"}</span>
                </div>
                <span className="lb-badge" style={{ fontSize: "0.58rem" }}>{p.rank_badge || "UNRANKED"}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="social-panel">
      <p className="eyebrow">GUILD</p>
      <h2 className="social-title">Join a Guild</h2>

      {mode === "menu" && (
        <div className="guild-menu">
          <button className="guild-opt" onClick={() => { setMode("create"); setError(null); }}>
            <Plus size={20} />
            <span className="guild-opt-label">Create Guild</span>
            <span className="guild-opt-desc">Start your own guild and invite others</span>
          </button>
          <button className="guild-opt" onClick={() => { setMode("join"); setError(null); }}>
            <Hash size={20} />
            <span className="guild-opt-label">Join with Code</span>
            <span className="guild-opt-desc">Enter an invite code to join a guild</span>
          </button>
        </div>
      )}

      {mode === "create" && (
        <form onSubmit={createGuild} className="guild-form">
          {error && <div className="auth-feedback auth-error">{error}</div>}
          <div className="field">
            <label className="field-label">Guild Name</label>
            <input className="field-input" placeholder="e.g. Shadow Army" value={guildName} onChange={(e) => setGuildName(e.target.value)} autoFocus required />
          </div>
          <div className="field">
            <label className="field-label">Description <span className="optional">(optional)</span></label>
            <input className="field-input" placeholder="What is your guild about?" value={guildDesc} onChange={(e) => setGuildDesc(e.target.value)} />
          </div>
          <div className="guild-form-actions">
            <button type="button" className="btn-restore" onClick={() => setMode("menu")}>Back</button>
            <button type="submit" className="btn-submit" style={{ flex: 1 }}>Create Guild</button>
          </div>
        </form>
      )}

      {mode === "join" && (
        <form onSubmit={joinGuild} className="guild-form">
          {error && <div className="auth-feedback auth-error">{error}</div>}
          <div className="field">
            <label className="field-label">Invite Code</label>
            <input className="field-input" placeholder="e.g. A3F8B2C1" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} autoFocus required style={{ letterSpacing: "0.2em", textTransform: "uppercase" }} />
          </div>
          <div className="guild-form-actions">
            <button type="button" className="btn-restore" onClick={() => setMode("menu")}>Back</button>
            <button type="submit" className="btn-submit" style={{ flex: 1 }}>Join Guild</button>
          </div>
        </form>
      )}
    </div>
  );
}
