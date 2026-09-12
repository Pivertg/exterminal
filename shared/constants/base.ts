/**
 * Coût en or pour passer le QG au niveau suivant.
 * Index 0 = coût pour passer du niveau 1 au niveau 2, etc.
 * Volontairement simple pour le MVP — sera remplacé par une vraie courbe d'équilibrage plus tard.
 */
export const HQ_UPGRADE_COSTS = [100, 250, 500, 900, 1500];

export function getHqUpgradeCost(currentLevel: number): number | null {
  const cost = HQ_UPGRADE_COSTS[currentLevel - 1];
  return cost ?? null; // null = niveau max atteint pour le MVP
}
