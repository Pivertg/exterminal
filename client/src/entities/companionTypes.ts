/**
 * Compagnons — idée notée dans docs/notes-idees-futures.md, maintenant implémentée en
 * version simple : chaque compagnon donne un bonus passif pendant l'expédition, choisi dans
 * le lobby de groupe avant de partir (inspiré de la pub mentionnée : choix de rôle + compagnon
 * avant de lancer la partie).
 *
 * MVP : tous les compagnons sont débloqués par défaut (pas de gacha compagnon pour l'instant,
 * pour rester simple — section 26 du GDD). Un système de déblocage/rareté pourra être ajouté
 * plus tard, sur le même principe que le recrutement de personnages (Phase 13).
 */

export interface CompanionDefinition {
  id: string;
  name: string;
  description: string;
  color: number;
  bonusDamage: number;
  bonusMaxHp: number;
  bonusSpeed: number;
  bonusFireRateMs: number;
}

export const COMPANION_DEFINITIONS: Record<string, CompanionDefinition> = {
  aucun: {
    id: "aucun",
    name: "(aucun compagnon)",
    description: "Partir sans compagnon.",
    color: 0x555555,
    bonusDamage: 0,
    bonusMaxHp: 0,
    bonusSpeed: 0,
    bonusFireRateMs: 0,
  },
  faucon: {
    id: "faucon",
    name: "Faucon éclaireur",
    description: "Repère les ennemis à l'avance : légère hausse de vitesse.",
    color: 0xffd166,
    bonusDamage: 0,
    bonusMaxHp: 0,
    bonusSpeed: 0.4,
    bonusFireRateMs: 0,
  },
  golem: {
    id: "golem",
    name: "Golem de garde",
    description: "Renforce l'endurance du groupe.",
    color: 0x8d99ae,
    bonusDamage: 0,
    bonusMaxHp: 25,
    bonusSpeed: 0,
    bonusFireRateMs: 0,
  },
  esprit_feu: {
    id: "esprit_feu",
    name: "Esprit de feu",
    description: "Enflamme les tirs : bonus de dégâts.",
    color: 0xef233c,
    bonusDamage: 4,
    bonusMaxHp: 0,
    bonusSpeed: 0,
    bonusFireRateMs: 0,
  },
};

export function getCompanionDefinition(id: string): CompanionDefinition {
  return COMPANION_DEFINITIONS[id] ?? COMPANION_DEFINITIONS.aucun;
}
