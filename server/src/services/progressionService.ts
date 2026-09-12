/**
 * NOTE : dupliqué depuis /shared/constants/progression.ts pour l'instant.
 * Même limitation déjà documentée dans /server/src/services/baseService.ts —
 * pas encore de workspace npm partagé entre /client, /server et /shared.
 */

const ACCOUNT_XP_CURVE = [100, 220, 400, 650, 1000];

const MIN_EXPEDITION_XP = 20;
const MAX_EXPEDITION_XP = 35;

export function getXpRequiredForLevel(currentLevel: number): number | null {
  return ACCOUNT_XP_CURVE[currentLevel - 1] ?? null; // null = niveau max du prototype
}

/**
 * Montant d'XP de compte gagné en terminant une expédition.
 * Comme pour l'or (voir expeditionService.ts), c'est TOUJOURS le serveur qui tire ce nombre.
 */
export function rollExpeditionXpReward(): number {
  return Math.floor(Math.random() * (MAX_EXPEDITION_XP - MIN_EXPEDITION_XP + 1)) + MIN_EXPEDITION_XP;
}

export interface XpApplyResult {
  accountLevel: number;
  accountXp: number;
  leveledUp: boolean;
}

/**
 * Ajoute de l'XP au compte et gère la montée de niveau (potentiellement plusieurs
 * paliers d'un coup si l'XP gagnée est importante).
 */
export function applyAccountXp(currentLevel: number, currentXp: number, gainedXp: number): XpApplyResult {
  let level = currentLevel;
  let xp = currentXp + gainedXp;
  let leveledUp = false;

  let requiredXp = getXpRequiredForLevel(level);
  while (requiredXp !== null && xp >= requiredXp) {
    xp -= requiredXp;
    level += 1;
    leveledUp = true;
    requiredXp = getXpRequiredForLevel(level);
  }

  // Niveau max atteint pour le prototype : on plafonne l'XP affichée au dernier palier
  // plutôt que de la laisser grimper indéfiniment sans plus jamais servir à rien.
  if (requiredXp === null) {
    xp = Math.min(xp, ACCOUNT_XP_CURVE[ACCOUNT_XP_CURVE.length - 1]);
  }

  return { accountLevel: level, accountXp: xp, leveledUp };
}

export interface AchievementStats {
  accountLevel: number;
  hqLevel: number;
  expeditionsCompleted: number;
  gold: number;
}

interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  isUnlocked: (stats: AchievementStats) => boolean;
}

const ACHIEVEMENTS: AchievementDefinition[] = [
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

export interface AchievementView {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export function computeAchievements(stats: AchievementStats): AchievementView[] {
  return ACHIEVEMENTS.map((a) => ({
    id: a.id,
    name: a.name,
    description: a.description,
    unlocked: a.isUnlocked(stats),
  }));
}
