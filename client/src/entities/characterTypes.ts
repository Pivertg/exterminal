/**
 * Définitions des personnages jouables (Phases 11 et 13, section 11 du GDD).
 *
 * Portée volontairement réduite pour cette phase : seules les statistiques de base, le
 * style de jeu (rôle) et la rareté diffèrent d'un personnage à l'autre, en réutilisant le
 * système de combat existant (tir automatique vers l'ennemi le plus proche, Phase 7). Les
 * compétences, compétences ultimes, passifs et équipements décrits en section 11 du GDD ne
 * sont PAS encore implémentés — ça viendra progressivement (section 26 : simple → fonctionnel
 * → testé → amélioré).
 *
 * "recrue" est possédée par défaut par tout compte (voir progressionService.ts côté serveur).
 * Les autres s'obtiennent via le recrutement (Phase 13, voir gachaService.ts).
 */

export type CharacterRole = "TANK" | "DPS_DISTANCE" | "DPS_CORPS_A_CORPS" | "INVOCATEUR";

export type CharacterRarity = 2 | 3 | 4 | 5;

export interface CharacterDefinition {
  id: string;
  name: string;
  role: CharacterRole;
  roleLabel: string;
  description: string;
  color: number;
  rarity: CharacterRarity;
  baseHp: number;
  baseDamage: number;
  baseSpeed: number;
  baseFireRateMs: number;
}

export const CHARACTER_DEFINITIONS: Record<string, CharacterDefinition> = {
  recrue: {
    id: "recrue",
    name: "Recrue",
    role: "DPS_CORPS_A_CORPS",
    roleLabel: "DPS corps à corps",
    description: "Personnage de base, simple et fiable. Toujours possédé, même sans recrutement.",
    color: 0x9e9e9e,
    rarity: 2,
    baseHp: 110,
    baseDamage: 9,
    baseSpeed: 3.6,
    baseFireRateMs: 550,
  },
  eclaireuse: {
    id: "eclaireuse",
    name: "Éclaireuse",
    role: "DPS_DISTANCE",
    roleLabel: "DPS à distance",
    description: "Rapide et précise, mais fragile. Le personnage du MVP initial (Phase 7).",
    color: 0x4dd0e1,
    rarity: 3,
    baseHp: 100,
    baseDamage: 10,
    baseSpeed: 4,
    baseFireRateMs: 500,
  },
  colosse: {
    id: "colosse",
    name: "Colosse",
    role: "TANK",
    roleLabel: "Tank",
    description: "Lent et moins puissant à distance, mais encaisse bien plus de dégâts.",
    color: 0xff8a65,
    rarity: 4,
    baseHp: 180,
    baseDamage: 7,
    baseSpeed: 2.6,
    baseFireRateMs: 650,
  },
  invocateur: {
    id: "invocateur",
    name: "Invocateur",
    role: "INVOCATEUR",
    roleLabel: "Invocateur",
    description: "Le personnage le plus rare : statistiques élevées sur tous les plans. Les vraies compétences d'invocation viendront plus tard.",
    color: 0xb388ff,
    rarity: 5,
    baseHp: 140,
    baseDamage: 13,
    baseSpeed: 3.4,
    baseFireRateMs: 420,
  },
};

export const DEFAULT_CHARACTER_ID = "recrue";

export function getCharacterDefinition(characterId: string): CharacterDefinition {
  return CHARACTER_DEFINITIONS[characterId] ?? CHARACTER_DEFINITIONS[DEFAULT_CHARACTER_ID];
}
