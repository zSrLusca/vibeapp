export const POINT_VALUES = {
  POST_REACTION: 2,
  POST_COMMENT: 5,
};

export const LEVELS = [
  { level: 1, title: "Novato", minPoints: 0, icon: "🌱" },
  { level: 2, title: "Membro", minPoints: 30, icon: "⭐" },
  { level: 3, title: "Ativo", minPoints: 80, icon: "🔥" },
  { level: 4, title: "Engajado", minPoints: 150, icon: "💬" },
  { level: 5, title: "Vibeiro", minPoints: 250, icon: "🎮" },
  { level: 6, title: "Lenda", minPoints: 400, icon: "👑" },
];

export function getGamificationStatus(points = 0) {
  const safePoints = Math.max(0, Number(points) || 0);

  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (safePoints >= level.minPoints) current = level;
  }

  const currentIndex = LEVELS.findIndex((l) => l.level === current.level);
  const next = LEVELS[currentIndex + 1] ?? null;

  const progress = next
    ? Math.min(
        100,
        Math.round(
          ((safePoints - current.minPoints) /
            (next.minPoints - current.minPoints)) *
            100
        )
      )
    : 100;

  const pointsToNext = next ? Math.max(0, next.minPoints - safePoints) : 0;

  return {
    points: safePoints,
    level: current.level,
    title: current.title,
    icon: current.icon,
    nextLevel: next?.level ?? null,
    nextTitle: next?.title ?? null,
    progress,
    pointsToNext,
    isMaxLevel: !next,
  };
}
