/**
 * Logique d'équipement (Phase 14, section 13 du GDD).
 * NOTE : dupliqué depuis /client/src/entities/equipmentTypes.ts (même convention que
 * baseService.ts et gachaService.ts — pas encore de partage de code client/serveur).
 */

export type EquipmentSlot = "weapon" | "artifact";

export interface EquipmentStats {
  bonusDamage: number;
  bonusMaxHp: number;
  bonusSpeed: number;
  bonusFireRateMs: number;
}

interface EquipmentEntry extends EquipmentStats {
  id: string;
  slot: EquipmentSlot;
  dropWeight: number; // poids relatif dans la table de loot (plus rare = poids plus faible)
}

export const EQUIPMENT_TABLE: EquipmentEntry[] = [
  { id: "lame_rouillee", slot: "weapon", dropWeight: 40, bonusDamage: 2, bonusMaxHp: 0, bonusSpeed: 0, bonusFireRateMs: 0 },
  { id: "fusil_precision", slot: "weapon", dropWeight: 20, bonusDamage: 5, bonusMaxHp: 0, bonusSpeed: 0, bonusFireRateMs: -30 },
  { id: "canon_surchauffe", slot: "weapon", dropWeight: 6, bonusDamage: 10, bonusMaxHp: 0, bonusSpeed: 0, bonusFireRateMs: -60 },
  { id: "coeur_ancien", slot: "artifact", dropWeight: 20, bonusDamage: 0, bonusMaxHp: 40, bonusSpeed: 0, bonusFireRateMs: 0 },
  { id: "bottes_legeres", slot: "artifact", dropWeight: 20, bonusDamage: 0, bonusMaxHp: 0, bonusSpeed: 0.6, bonusFireRateMs: 0 },
  { id: "noyau_x88", slot: "artifact", dropWeight: 4, bonusDamage: 6, bonusMaxHp: 30, bonusSpeed: 0, bonusFireRateMs: 0 },
];

export const EQUIPMENT_DROP_CHANCE = 0.35; // 35% de chances de loot un objet par expédition

/** Retourne un itemId tiré aléatoirement, ou null si le loot n'a pas eu lieu ce run. */
export function rollEquipmentDrop(): string | null {
  if (Math.random() > EQUIPMENT_DROP_CHANCE) return null;

  const total = EQUIPMENT_TABLE.reduce((sum, e) => sum + e.dropWeight, 0);
  let roll = Math.random() * total;
  for (const entry of EQUIPMENT_TABLE) {
    if (roll < entry.dropWeight) return entry.id;
    roll -= entry.dropWeight;
  }
  return null;
}

export function getEquipmentEntry(itemId: string): EquipmentEntry | undefined {
  return EQUIPMENT_TABLE.find((e) => e.id === itemId);
}

export function getSlotForItem(itemId: string): EquipmentSlot | null {
  return getEquipmentEntry(itemId)?.slot ?? null;
}
