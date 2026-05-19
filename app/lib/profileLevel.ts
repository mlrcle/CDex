export function getLevelFromXp(totalXp: number) {
  let level = 1;
  let requiredXp = 100;
  let remainingXp = totalXp;

  while (remainingXp >= requiredXp) {
    remainingXp -= requiredXp;
    level += 1;
    requiredXp = Math.round(requiredXp * 1.25);
  }

  const progress = Math.round((remainingXp / requiredXp) * 100);

  return {
    level,
    currentXp: remainingXp,
    nextLevelXp: requiredXp,
    progress,
    totalXp,
  };
}