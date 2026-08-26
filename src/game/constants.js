/* ═══════════════════════════════════════════════════════════════════════════
   The data tables the game is built on. Everything here is static — no logic,
   no React. Tuning the game (XP curves, unlock levels, boss roster) happens
   in this file and nowhere else.
   ═══════════════════════════════════════════════════════════════════════════ */

export const STORAGE_KEY = "rpg-productivity-v5";

// ─── Categories ───────────────────────────────────────────────────────────────
export const CATEGORIES = {
  COMBAT:     { label: "Combat",     stat: "STR", color: "red",    desc: "Physical training & exercise" },
  KNOWLEDGE:  { label: "Knowledge",  stat: "MND", color: "blue",   desc: "Study, reading & learning"    },
  DISCIPLINE: { label: "Discipline", stat: "DIS", color: "purple", desc: "Habits & self-control"        },
  VITALITY:   { label: "Vitality",   stat: "VIT", color: "green",  desc: "Sleep, health & nutrition"    },
  CREATION:   { label: "Creation",   stat: "CRE", color: "amber",  desc: "Creative work & projects"     },
};

export const CAT_ORDER = ["COMBAT", "KNOWLEDGE", "DISCIPLINE", "VITALITY", "CREATION"];

export const STAT_NAMES = { STR: "Strength", MND: "Mind", DIS: "Discipline", VIT: "Vitality", CRE: "Creativity" };

/* Chart colors. These mirror the --c-* tokens in index.css; SVG fills can't
   read CSS custom properties through the `style` prop, so they live here too.
   Change both together. */
export const CAT_COLORS_HEX = {
  COMBAT: "#ff5a47", KNOWLEDGE: "#4ca8ff", DISCIPLINE: "#8b6bff",
  VITALITY: "#3fd9a0", CREATION: "#e8b33c",
};

// ─── Difficulty tiers ─────────────────────────────────────────────────────────
export const TIERS = {
  E: { xp: 20,  color: "slate",  hex: "#8b839f", unlockLevel: 1  },
  D: { xp: 40,  color: "green",  hex: "#3fd9a0", unlockLevel: 5  },
  C: { xp: 70,  color: "blue",   hex: "#4ca8ff", unlockLevel: 12 },
  B: { xp: 110, color: "purple", hex: "#8b6bff", unlockLevel: 20 },
  A: { xp: 160, color: "amber",  hex: "#e8b33c", unlockLevel: 30 },
  S: { xp: 250, color: "red",    hex: "#ff5a47", unlockLevel: 45 },
};

export const TIER_ORDER = ["E", "D", "C", "B", "A", "S"];

// ─── Weekly boss ──────────────────────────────────────────────────────────────
export const BOSS_THRESHOLD = 25;

export const WEEKLY_BOSSES = [
  { name: "The Iron Colossus",  desc: "A towering construct of pure discipline. Push beyond your limits this week." },
  { name: "Shadow Drake",       desc: "A beast born from accumulated laziness. Face it before the week ends."       },
  { name: "The Forgotten King", desc: "An ancient ruler who thrived on inconsistency. Dethrone him."                },
  { name: "Void Sentinel",      desc: "Guardian of stagnation. Prove your growth has no ceiling."                   },
  { name: "Abyssal Tyrant",     desc: "Born from your weakest moments. Conquer yourself this week."                 },
  { name: "The Hollow Knight",  desc: "An empty shell of potential. Fill it with decisive action."                  },
  { name: "Storm Warden",       desc: "Commands the chaos of the week. Stand firm and claim your XP."               },
];

// ─── Achievements ─────────────────────────────────────────────────────────────
export const ACHIEVEMENTS = [
  { id: "first_quest",  icon: "⚔️", label: "First Blood",       desc: "Complete your first quest"          },
  { id: "streak_3",     icon: "🔥", label: "On a Roll",          desc: "Maintain a 3-day streak"            },
  { id: "streak_7",     icon: "💥", label: "Unstoppable",        desc: "Maintain a 7-day streak"            },
  { id: "streak_30",    icon: "👁️", label: "Shadow Discipline",  desc: "30-day streak"                      },
  { id: "level_5",      icon: "🏅", label: "Awakened",           desc: "Reach level 5"                      },
  { id: "level_20",     icon: "🥇", label: "Ranked Hunter",      desc: "Reach level 20"                     },
  { id: "level_50",     icon: "👑", label: "S-Rank Ascension",   desc: "Reach level 50"                     },
  { id: "xp_1000",      icon: "⚡", label: "Power Surge",        desc: "Earn 1,000 total XP"                },
  { id: "xp_10000",     icon: "🌟", label: "Monarch's Path",     desc: "Earn 10,000 total XP"               },
  { id: "quests_50",    icon: "🗡️", label: "Seasoned Hunter",    desc: "Complete 50 quests total"           },
  { id: "all_cats",     icon: "🎯", label: "Well-Rounded",       desc: "Complete a quest in every category" },
  { id: "s_tier",       icon: "💎", label: "S-Rank Quest",       desc: "Complete an S-tier quest"           },
  { id: "shield_used",  icon: "🛡️", label: "Protected",          desc: "Use a streak shield"                },
];

// ─── Timezones ────────────────────────────────────────────────────────────────
export const TIMEZONES = [
  { value: "Pacific/Honolulu",    label: "Hawaii — UTC−10"          },
  { value: "America/Anchorage",   label: "Alaska — UTC−9"           },
  { value: "America/Los_Angeles", label: "Pacific US — UTC−8/7"     },
  { value: "America/Denver",      label: "Mountain US — UTC−7/6"    },
  { value: "America/Chicago",     label: "Central US — UTC−6/5"     },
  { value: "America/New_York",    label: "Eastern US — UTC−5/4"     },
  { value: "America/Sao_Paulo",   label: "Brazil — UTC−3"           },
  { value: "Europe/London",       label: "London — UTC+0/1"         },
  { value: "Europe/Paris",        label: "Paris / Berlin — UTC+1/2" },
  { value: "Europe/Helsinki",     label: "Helsinki — UTC+2/3"       },
  { value: "Europe/Moscow",       label: "Moscow — UTC+3"           },
  { value: "Asia/Dubai",          label: "Dubai — UTC+4"            },
  { value: "Asia/Karachi",        label: "Karachi — UTC+5"          },
  { value: "Asia/Kolkata",        label: "India — UTC+5:30"         },
  { value: "Asia/Dhaka",          label: "Dhaka — UTC+6"            },
  { value: "Asia/Bangkok",        label: "Bangkok — UTC+7"          },
  { value: "Asia/Singapore",      label: "Singapore — UTC+8"        },
  { value: "Asia/Tokyo",          label: "Tokyo — UTC+9"            },
  { value: "Asia/Seoul",          label: "Seoul — UTC+9"            },
  { value: "Australia/Sydney",    label: "Sydney — UTC+10/11"       },
  { value: "Pacific/Auckland",    label: "Auckland — UTC+12/13"     },
];
