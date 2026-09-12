/**
 * Équipements (Phase 14, section 13 du GDD).
 *
 * MVP volontairement simple : une arme + un artéfact, chacun avec un bonus de statistique
 * fixe (pas de sous-stats aléatoires, pas de sets à la Genshin pour l'instant — voir
 * docs/notes-idees-futures.md pour l'idée plus élaborée notée pour plus tard).
 *
 * Obtenus uniquement via le loot d'expédition pour l'instant (pas de paiement réel, comme
 * pour le recrutement). Attention pay-to-win (section 13 du GDD) : les bonus restent modestes.
 */

export type EquipmentSlot = "weapon" | "artifact";
export type EquipmentRarity = 2 | 3 | 4 | 5;

export interface EquipmentDefinition {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  description: string;
  color: number;
  // Bonus appliqués au personnage quand équipé (additifs sur les stats de base).
  bonusDamage?: number;
  bonusMaxHp?: number;
  bonusSpeed?: number;
  bonusFireRateMs?: number; // négatif = tire plus vite
}

export const EQUIPMENT_DEFINITIONS: Record<string, EquipmentDefinition> = {
  lame_rouillee: {
    id: "lame_rouillee",
    name: "Lame rouillée",
    slot: "weapon",
    rarity: 2,
    description: "Une arme de fortune trouvée dans les ruines. Mieux que rien.",
    color: 0x9e9e9e,
    bonusDamage: 2,
  },
  fusil_precision: {
    id: "fusil_precision",
    name: "Fusil de précision",
    slot: "weapon",
    rarity: 3,
    description: "Cadence correcte, dégâts solides.",
    color: 0x4dd0e1,
    bonusDamage: 5,
    bonusFireRateMs: -30,
  },
  canon_surchauffe: {
    id: "canon_surchauffe",
    name: "Canon Surchauffé",
    slot: "weapon",
    rarity: 4,
    description: "Récupéré sur un automate vaincu. Dégâts très élevés.",
    color: 0xef233c,
    bonusDamage: 10,
    bonusFireRateMs: -60,
  },
  coeur_ancien: {
    id: "coeur_ancien",
    name: "Cœur ancien",
    slot: "artifact",
    rarity: 3,
    description: "Un artéfact qui renforce l'endurance.",
    color: 0xffd166,
    bonusMaxHp: 40,
  },
  bottes_legeres: {
    id: "bottes_legeres",
    name: "Bottes légères",
    slot: "artifact",
    rarity: 3,
    description: "Améliore nettement la mobilité.",
    color: 0x66bb6a,
    bonusSpeed: 0.6,
  },
  noyau_x88: {
    id: "noyau_x88",
    name: "Noyau X-88",
    slot: "artifact",
    rarity: 5,
    description: "Fragment du cœur de l'Automate Surchauffé. Puissant et rare.",
    color: 0xb388ff,
    bonusDamage: 6,
    bonusMaxHp: 30,
  },
};

export function getEquipmentDefinition(itemId: string): EquipmentDefinition | undefined {
  return EQUIPMENT_DEFINITIONS[itemId];
}

export interface EquipmentBonuses {
  bonusDamage: number;
  bonusMaxHp: number;
  bonusSpeed: number;
  bonusFireRateMs: number;
}

/** Cumule les bonus de l'arme + de l'artéfact équipés (l'un ou l'autre peut être absent). */
export function computeEquipmentBonuses(weaponId: string | null, artifactId: string | null): EquipmentBonuses {
  const weapon = weaponId ? EQUIPMENT_DEFINITIONS[weaponId] : undefined;
  const artifact = artifactId ? EQUIPMENT_DEFINITIONS[artifactId] : undefined;

  return {
    bonusDamage: (weapon?.bonusDamage ?? 0) + (artifact?.bonusDamage ?? 0),
    bonusMaxHp: (weapon?.bonusMaxHp ?? 0) + (artifact?.bonusMaxHp ?? 0),
    bonusSpeed: (weapon?.bonusSpeed ?? 0) + (artifact?.bonusSpeed ?? 0),
    bonusFireRateMs: (weapon?.bonusFireRateMs ?? 0) + (artifact?.bonusFireRateMs ?? 0),
  };
}
