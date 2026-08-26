import React from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   SIGILS — original glyph set for ranks, categories and tiers.
   Everything is stroke-on-currentColor so a single CSS color drives the mark.
   Rank complexity climbs deliberately: Unranked is a broken ring, S is a
   full mandala. Progression should be readable across a room.
   ═══════════════════════════════════════════════════════════════════════════ */

export function RankSigil({ rank = "UNRANKED", size = 48, className = "" }) {
  const key = String(rank).replace("-RANK", "").toUpperCase();
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={`sigil ${className}`} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
        {key === "UNRANKED" && (
          <>
            <circle cx="24" cy="24" r="15" strokeDasharray="4 5" opacity="0.55" />
            <path d="M18 24h12" opacity="0.5" />
          </>
        )}
        {key === "E" && (
          <>
            <path d="M24 7 41 24 24 41 7 24Z" />
            <circle cx="24" cy="24" r="2.6" fill="currentColor" stroke="none" />
          </>
        )}
        {key === "D" && (
          <>
            <path d="M24 7 41 24 24 41 7 24Z" />
            <path d="M24 15 32 28H16Z" opacity="0.85" />
          </>
        )}
        {key === "C" && (
          <>
            <path d="M24 6 39 15v18l-15 9-15-9V15Z" />
            <path d="M24 15 32 20v8l-8 5-8-5v-8Z" opacity="0.7" />
            <path d="M14 24h-6M40 24h-6" />
          </>
        )}
        {key === "B" && (
          <>
            <path d="M24 5 40 14v20L24 43 8 34V14Z" />
            <path d="M24 14 33 24l-9 10-9-10Z" opacity="0.8" />
            <circle cx="24" cy="24" r="2.4" fill="currentColor" stroke="none" />
            <path d="M24 5v-3M24 46v-3M8 14 5 12M43 12l-3 2" opacity="0.6" />
          </>
        )}
        {key === "A" && (
          <>
            <path d="M24 3 30 15l13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2Z" />
            <path d="M24 16 30 24l-6 8-6-8Z" opacity="0.85" />
            <circle cx="24" cy="24" r="1.8" fill="currentColor" stroke="none" />
          </>
        )}
        {key === "S" && (
          <>
            <circle cx="24" cy="24" r="20" opacity="0.45" />
            <circle cx="24" cy="24" r="16" />
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <path
                key={deg}
                d="M24 8v5"
                transform={`rotate(${deg} 24 24)`}
                opacity="0.75"
              />
            ))}
            <path d="M24 10 32 24l-8 14-8-14Z" />
            <path d="M10 24h28" opacity="0.5" />
            <circle cx="24" cy="24" r="3.4" fill="currentColor" stroke="none" />
          </>
        )}
      </g>
    </svg>
  );
}

/* ── Category glyphs ──────────────────────────────────────────────────────
   Drawn rather than borrowed so the five disciplines read as one family:
   same stroke weight, same 24-unit box, same optical mass.               */

export function CategoryGlyph({ category, size = 18, className = "" }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={`cglyph ${className}`} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {category === "COMBAT" && (
          <>
            <path d="M4 3 14.5 13.5M20 3 9.5 13.5" />
            <path d="M3.5 20.5 8 16M20.5 20.5 16 16" />
            <path d="M13 15.5 15.5 13M11 15.5 8.5 13" opacity="0.7" />
            <circle cx="12" cy="18" r="1.6" fill="currentColor" stroke="none" />
          </>
        )}
        {category === "KNOWLEDGE" && (
          <>
            <path d="M12 6.5C10 4.6 7.4 4 4 4.4v13.2c3.4-.4 6 .2 8 2.1 2-1.9 4.6-2.5 8-2.1V4.4c-3.4-.4-6 .2-8 2.1Z" />
            <path d="M12 6.5v13.2" />
            <path d="M6.5 9h3M6.5 12h3M14.5 9h3M14.5 12h3" opacity="0.55" />
          </>
        )}
        {category === "DISCIPLINE" && (
          <>
            <path d="M12 3 20 6v6.5c0 4.4-3.2 7.4-8 8.5-4.8-1.1-8-4.1-8-8.5V6Z" />
            <path d="M8.5 12h7" />
            <path d="M12 8.5v7" opacity="0.55" />
          </>
        )}
        {category === "VITALITY" && (
          <>
            <path d="M12 3c4 4.6 6 7.9 6 10.8A6 6 0 0 1 6 13.8C6 10.9 8 7.6 12 3Z" />
            <path d="M7.5 14h2l1.5-3 2 5.5 1.5-2.5h2" />
          </>
        )}
        {category === "CREATION" && (
          <>
            <path d="M12 2.5v6M12 15.5v6M2.5 12h6M15.5 12h6" />
            <path d="M6.2 6.2 9.8 9.8M17.8 6.2 14.2 9.8M6.2 17.8l3.6-3.6M17.8 17.8l-3.6-3.6" opacity="0.6" />
            <circle cx="12" cy="12" r="2.4" />
          </>
        )}
      </g>
    </svg>
  );
}

/* ── Corner brackets ──────────────────────────────────────────────────────
   The system-window motif. Four L-marks that frame a panel without a
   full border — lets the panel bleed into the void at its edges.        */

export function Brackets({ className = "" }) {
  return (
    <span className={`brackets ${className}`} aria-hidden="true">
      <i className="bk bk-tl" /><i className="bk bk-tr" />
      <i className="bk bk-bl" /><i className="bk bk-br" />
    </span>
  );
}

/* ── Gate mark ────────────────────────────────────────────────────────────
   Used as the app's own icon: a portal arch with a rift down the middle. */

export function GateMark({ size = 28, className = "" }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id="gateMarkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--arise)" />
          <stop offset="100%" stopColor="var(--monarch)" />
        </linearGradient>
      </defs>
      <path
        d="M16 1.5c7 0 12 5.6 12 13v16H4v-16c0-7.4 5-13 12-13Z"
        fill="none"
        stroke="url(#gateMarkFill)"
        strokeWidth="1.8"
      />
      <path d="M16 6.5 19.5 17 16 30.5 12.5 17Z" fill="url(#gateMarkFill)" opacity="0.9" />
    </svg>
  );
}
