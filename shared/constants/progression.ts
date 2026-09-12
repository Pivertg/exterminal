/**
 * Référence pour la progression du compte (Phase 10, section 15 du GDD).
 * Personnages et équipements ne sont pas encore modélisés (Phases 11/13/14) :
 * la progression du compte se limite pour l'instant au niveau de compte (XP),
 * au niveau de base (déjà existant, /shared/constants/base.ts), à l'or et aux succès.
 *
 * Dupliqué côté serveur dans /server/src/services/progressionService.ts en attendant
 * un système de workspace npm partagé (même limitation que HQ_UPGRADE_COSTS, voir
 * /shared/constants/base.ts).
 */

// XP nécessaire pour passer du niveau N au niveau N+1. Index 0 = niveau 1 → 2.
export const ACCOUNT_XP_CURVE = [100, 220, 400, 650, 1000];

export function getXpRequiredForLevel(currentLevel: number): number | null {
  return ACCOUNT_XP_CURVE[currentLevel - 1] ?? null; // null = niveau max du prototype
}

export interface AchievementStats {
  accountLevel: number;
  hqLevel: number;
  expeditionsCompleted: number;
  gold: number;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  isUnlocked: (stats: AchievementStats) => boolean;
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: "first_expedition",
    name: "Premiers pas",
    description: "Terminer une première expédition",
    isUnlocked: (s) => s.expeditionsCompleted >= 1,
  },
  {
    id: "veteran_10",
    name: "Vétéran",
    description: "Terminer 10 expéditions",
    isUnlocked: (s) => s.expeditionsCompleted >= 10,
  },
  {
    id: "veteran_50",
    name: "Habitué",
    description: "Terminer 50 expéditions",
    isUnlocked: (s) => s.expeditionsCompleted >= 50,
  },
  {
    id: "account_level_5",
    name: "Montée en puissance",
    description: "Atteindre le niveau de compte 5",
    isUnlocked: (s) => s.accountLevel >= 5,
  },
  {
    id: "hq_level_3",
    name: "Bâtisseur",
    description: "Amener le QG au niveau 3",
    isUnlocked: (s) => s.hqLevel >= 3,
  },
  {
    id: "gold_hoarder",
    name: "Petit trésor",
    description: "Posséder 500 or ou plus",
    isUnlocked: (s) => s.gold >= 500,
  },
];
