/**
 * NOTE : dupliqué depuis /shared/constants/base.ts pour l'instant.
 * Le monorepo n'a pas encore de config de partage de code entre /client et /server
 * (ça viendra avec un système de "workspaces" npm plus tard). À ne pas oublier
 * de garder les deux fichiers synchronisés en attendant.
 */
const HQ_UPGRADE_COSTS = [100, 250, 500, 900, 1500];

export function getHqUpgradeCost(currentLevel: number): number | null {
  return HQ_UPGRADE_COSTS[currentLevel - 1] ?? null;
}
