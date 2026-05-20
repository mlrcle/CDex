export function getLevelFromXp(totalXp: number) {
  let level = 1;
  let requiredXp = 100;
  let remainingXp = totalXp;

  while (remainingXp >= requiredXp) {
    remainingXp -= requiredXp;
    level += 1;

    if (level < 10) {
      requiredXp = Math.round(requiredXp * 1.10);
    } else if (level < 25) {
      requiredXp = Math.round(requiredXp * 1.07);
    } else if (level < 50) {
      requiredXp = Math.round(requiredXp * 1.035);
    } else {
      requiredXp = Math.round(requiredXp * 1.012);
    }
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