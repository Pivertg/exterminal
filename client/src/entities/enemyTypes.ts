/**
 * Définitions des types d'ennemis — Phase 8 du GDD.
 *
 * Approche volontairement data-driven plutôt qu'une hiérarchie de classes :
 * ajouter un nouveau type d'ennemi = ajouter une entrée ici, pas un nouveau
 * fichier. On garde une seule classe Enemy (voir Enemy.ts) qui lit ces
 * définitions. Si un type a un jour un comportement vraiment unique
 * (ex: invocateur), on pourra le sortir dans sa propre classe à ce moment-là.
 */

export type EnemyTypeId = "GRUNT" | "RUNNER" | "BRUTE" | "SPITTER" | "PYLON";

export interface EnemyDefinition {
  id: EnemyTypeId;
  label: string;
  hp: number;
  speed: number;
  contactDamage: number;
  xpReward: number;
  color: number;
  radius: number;
  /** Si présent, l'ennemi attaque à distance au lieu de foncer au contact. */
  ranged?: {
    preferredDistance: number;
    projectileDamage: number;
    cooldownMs: number;
  };
}

export const ENEMY_DEFINITIONS: Record<EnemyTypeId, EnemyDefinition> = {
  GRUNT: {
    id: "GRUNT",
    label: "Rôdeur",
    hp: 20,
    speed: 1.3,
    contactDamage: 5,
    xpReward: 10,
    color: 0xef233c,
    radius: 12,
  },
  RUNNER: {
    id: "RUNNER",
    label: "Traqueur",
    hp: 12,
    speed: 2.6,
    contactDamage: 4,
    xpReward: 12,
    color: 0xffb703,
    radius: 9,
  },
  BRUTE: {
    id: "BRUTE",
    label: "Colosse",
    hp: 70,
    speed: 0.8,
    contactDamage: 12,
    xpReward: 25,
    color: 0x6a4c93,
    radius: 18,
  },
  SPITTER: {
    id: "SPITTER",
    label: "Cracheur",
    hp: 16,
    speed: 1.0,
    contactDamage: 3,
    xpReward: 18,
    color: 0x2ec4b6,
    radius: 11,
    ranged: {
      preferredDistance: 220,
      projectileDamage: 8,
      cooldownMs: 1800,
    },
  },
  // Pylône : cible fixe apparaissant pendant le pattern OVERLOAD_PYLONS du boss (Phase 9).
  // Pas de déplacement, pas de dégâts au contact — uniquement une cible à détruire.
  // N'apparaît jamais via la table de spawn normale (voir pickEnemyType), seulement spawné
  // manuellement par ExpeditionScene pendant le combat de boss.
  PYLON: {
    id: "PYLON",
    label: "Pylône",
    hp: 25,
    speed: 0,
    contactDamage: 0,
    xpReward: 0,
    color: 0x00f5d4,
    radius: 14,
  },
};

/**
 * Table de spawn progressive : plus l'expédition avance, plus les types
 * difficiles apparaissent. Chaque palier est cumulatif (les types des
 * paliers précédents restent disponibles, avec un poids réduit).
 */
export interface SpawnWeight {
  type: EnemyTypeId;
  weight: number;
}

export function getSpawnTable(elapsedMs: number): SpawnWeight[] {
  if (elapsedMs < 15_000) {
    return [{ type: "GRUNT", weight: 1 }];
  }
  if (elapsedMs < 35_000) {
    return [
      { type: "GRUNT", weight: 3 },
      { type: "RUNNER", weight: 2 },
    ];
  }
  if (elapsedMs < 60_000) {
    return [
      { type: "GRUNT", weight: 2 },
      { type: "RUNNER", weight: 3 },
      { type: "BRUTE", weight: 1 },
    ];
  }
  return [
    { type: "GRUNT", weight: 1 },
    { type: "RUNNER", weight: 2 },
    { type: "BRUTE", weight: 2 },
    { type: "SPITTER", weight: 2 },
  ];
}

export function pickEnemyType(elapsedMs: number): EnemyTypeId {
  const table = getSpawnTable(elapsedMs);
  const totalWeight = table.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) return entry.type;
  }
  return table[0].type;
}
