export type BossPatternId =
  | "MORTAR_SALVO"
  | "SMASH_WAVE"
  | "LASER_SWEEP"
  | "FAN_PULL"
  | "OVERLOAD_PYLONS";

export interface BossPatternConfig {
  id: BossPatternId;
  telegraphMs: number;
  executeMs: number;
  damage: number;
}

/**
 * Patterns d'attaque de l'Automate Surchauffé (Série X-88), Zone 1.
 * Specs de conception : docs/journal-04-phase9-boss-da.md (Gemini).
 * Chiffres de damage/durée = première estimation MVP, à équilibrer après tests joués.
 */
export const BOSS_PATTERNS: Record<BossPatternId, BossPatternConfig> = {
  MORTAR_SALVO: { id: "MORTAR_SALVO", telegraphMs: 900, executeMs: 400, damage: 18 },
  SMASH_WAVE: { id: "SMASH_WAVE", telegraphMs: 700, executeMs: 300, damage: 22 },
  LASER_SWEEP: { id: "LASER_SWEEP", telegraphMs: 1000, executeMs: 500, damage: 25 },
  FAN_PULL: { id: "FAN_PULL", telegraphMs: 600, executeMs: 700, damage: 5 },
  OVERLOAD_PYLONS: { id: "OVERLOAD_PYLONS", telegraphMs: 800, executeMs: 300, damage: 10 },
};

// Phase 1 (100%-50% PV) : les 3 attaques "classiques"
export const PHASE_1_PATTERNS: BossPatternId[] = ["MORTAR_SALVO", "SMASH_WAVE", "LASER_SWEEP"];

// Phase 2 (50%-0% PV) : patterns plus agressifs, en plus des attaques de phase 1
export const PHASE_2_PATTERNS: BossPatternId[] = [
  "MORTAR_SALVO",
  "SMASH_WAVE",
  "FAN_PULL",
  "OVERLOAD_PYLONS",
];

export const BOSS_MAX_HP = 400;
export const PHASE_2_THRESHOLD = 0.5; // 50% PV
export const PHASE_2_COOLDOWN_MULTIPLIER = 0.8; // "vitesse +20%" de la spec = 20% de cooldown en moins
export const BASE_ATTACK_COOLDOWN_MS = 2200;
