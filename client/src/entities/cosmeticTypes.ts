/**
 * Cosmétiques (Phase 15, section 14 du GDD).
 * Aucun avantage compétitif — uniquement visuel (couleur du personnage, titre affiché).
 * Achetables en or (pas de paiement réel dans le MVP, comme le reste).
 */

export interface SkinDefinition {
  id: string;
  name: string;
  color: number;
  cost: number;
}

export interface TitleDefinition {
  id: string;
  name: string;
  cost: number;
}

export const SKIN_DEFINITIONS: Record<string, SkinDefinition> = {
  defaut: { id: "defaut", name: "Défaut", color: 0x4dd0e1, cost: 0 },
  or: { id: "or", name: "Doré", color: 0xffd700, cost: 200 },
  neon: { id: "neon", name: "Néon", color: 0x39ff14, cost: 200 },
  ombre: { id: "ombre", name: "Ombre", color: 0x6a1b9a, cost: 350 },
};

export const TITLE_DEFINITIONS: Record<string, TitleDefinition> = {
  aucun: { id: "aucun", name: "(aucun titre)", cost: 0 },
  survivant: { id: "survivant", name: "Survivant", cost: 100 },
  chasseur_de_boss: { id: "chasseur_de_boss", name: "Chasseur de boss", cost: 250 },
  legende: { id: "legende", name: "Légende", cost: 500 },
};

export const DEFAULT_SKIN_ID = "defaut";
export const DEFAULT_TITLE_ID = "aucun";
