/**
 * Types partagés entre le client et le serveur.
 * On y ajoutera les interfaces Character, SaveState, Item, etc. au fur et à mesure des phases.
 */

export interface HealthCheckResponse {
  status: "ok" | "error";
  message: string;
}

// --- TYPES BOSS & PHASES (préparés en avance pour la Phase 9, pas encore utilisés en Phase 7) ---

export type BossPhase = "PHASE_1" | "PHASE_2";

export type BossPatternType =
  | "LASER_SWEEP"
  | "MORTAR_SALVO"
  | "SMASH_WAVE"
  | "FAN_PULL"
  | "OVERLOAD_PYLONS";

export interface BossState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  phase: BossPhase;
  currentPattern: BossPatternType | null;
  position: { x: number; y: number };
  isEnraged: boolean;
}
