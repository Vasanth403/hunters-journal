import { useState } from "react";

const quests = [
  { id: 1, name: "Workout", xp: 20, stat: "strength" },
  { id: 2, name: "Study 1 hour", xp: 30, stat: "mind" },
  { id: 3, name: "No doomscrolling", xp: 15, stat: "discipline" },
  { id: 4, name: "Sleep on time", xp: 25, stat: "discipline" }
];

export default function App() {

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  const [stats, setStats] = useState({
    strength: 0,
    mind: 0,
    discipline: 0
  });

  const completeQuest = (quest) => {

    let newXP = xp + quest.xp;
    let newLevel = level;

    if (newXP >= 100) {
      newXP -= 100;
      newLevel += 1;
    }

    setXp(newXP);
    setLevel(newLevel);

    setStats({
      ...stats,
      [quest.stat]: stats[quest.stat] + quest.xp
    });
  };

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      
      <h1>RPG Productivity Tracker</h1>

      <h2>Level: {level}</h2>
      <h3>XP: {xp}/100</h3>

      <h3>Stats</h3>
      <p>Strength: {stats.strength}</p>
      <p>Mind: {stats.mind}</p>
      <p>Discipline: {stats.discipline}</p>

      <h3>Daily Quests</h3>

      {quests.map((quest) => (
        <div key={quest.id} style={{ marginBottom: 10 }}>
          <button onClick={() => completeQuest(quest)}>
            {quest.name} (+{quest.xp} XP)
          </button>
        </div>
      ))}

    </div>
  );
}