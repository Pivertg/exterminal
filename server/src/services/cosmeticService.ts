/**
 * Cosmétiques (Phase 15, section 14 du GDD). Aucun avantage compétitif, achat en or uniquement.
 * NOTE : dupliqué depuis /client/src/entities/cosmeticTypes.ts (même convention que les autres
 * services — pas encore de partage de code client/serveur).
 */

interface CostEntry {
  id: string;
  cost: number;
}

export const SKIN_COSTS: CostEntry[] = [
  { id: "defaut", cost: 0 },
  { id: "or", cost: 200 },
  { id: "neon", cost: 200 },
  { id: "ombre", cost: 350 },
];

export const TITLE_COSTS: CostEntry[] = [
  { id: "aucun", cost: 0 },
  { id: "survivant", cost: 100 },
  { id: "chasseur_de_boss", cost: 250 },
  { id: "legende", cost: 500 },
];

export function findCosmeticCost(itemId: string): number | null {
  const entry = [...SKIN_COSTS, ...TITLE_COSTS].find((e) => e.id === itemId);
  return entry ? entry.cost : null;
}

export function getCosmeticKind(itemId: string): "skin" | "title" | null {
  if (SKIN_COSTS.some((e) => e.id === itemId)) return "skin";
  if (TITLE_COSTS.some((e) => e.id === itemId)) return "title";
  return null;
}
