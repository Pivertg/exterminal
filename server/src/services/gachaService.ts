/**
 * Logique de recrutement (Phase 13, section 12 du GDD).
 *
 * Les probabilités sont volontairement affichées ici en clair (et exposées telles quelles par
 * l'API — voir api/gacha.ts) : le GDD exige la transparence des taux.
 *
 * NOTE : la liste des personnages par rareté est dupliquée depuis
 * /client/src/entities/characterTypes.ts, comme pour baseService.ts (pas encore de partage de
 * code entre client et serveur — voir la note dans baseService.ts). À garder synchronisé.
 */

export type Rarity = 2 | 3 | 4 | 5;

export const RARITY_POOLS: Record<Rarity, string[]> = {
  2: ["recrue"],
  3: ["eclaireuse"],
  4: ["colosse"],
  5: ["invocateur"],
};

// Probabilités de base (avant pity), en pourcentage — doivent totaliser 100.
export const BASE_RATES: Record<Rarity, number> = {
  2: 60,
  3: 30,
  4: 8,
  5: 2,
};

export const PULL_COST_CRYSTALS = 100;
export const PITY_THRESHOLD = 10; // garantit un ★★★★ ou mieux tous les 10 pulls sans en avoir eu

export interface PullResult {
  characterId: string;
  rarity: Rarity;
}

function rollRarity(pullsSincePity: number): Rarity {
  // Pity : si on a fait PITY_THRESHOLD-1 pulls sans ★★★★+, le prochain pull en garantit un.
  const forceHighRarity = pullsSincePity >= PITY_THRESHOLD - 1;

  const rates = forceHighRarity
    ? { 2: 0, 3: 0, 4: BASE_RATES[4], 5: BASE_RATES[5] }
    : BASE_RATES;

  const total = Object.values(rates).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [rarityStr, chance] of Object.entries(rates)) {
    if (roll < chance) return Number(rarityStr) as Rarity;
    roll -= chance;
  }
  return 2; // filet de sécurité, ne devrait jamais arriver
}

export function performPull(pullsSincePity: number): PullResult {
  const rarity = rollRarity(pullsSincePity);
  const pool = RARITY_POOLS[rarity];
  const characterId = pool[Math.floor(Math.random() * pool.length)];
  return { characterId, rarity };
}

/** Nouveau compteur de pity après un pull : remis à 0 si ★★★★+, sinon incrémenté. */
export function nextPityCounter(currentCounter: number, rarityObtained: Rarity): number {
  return rarityObtained >= 4 ? 0 : currentCounter + 1;
}
