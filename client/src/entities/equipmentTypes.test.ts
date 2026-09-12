import { describe, it, expect } from "vitest";
import { computeEquipmentBonuses } from "./equipmentTypes";

describe("equipmentTypes — computeEquipmentBonuses", () => {
  it("retourne des bonus nuls si aucune arme ni artéfact équipé", () => {
    const bonuses = computeEquipmentBonuses(null, null);
    expect(bonuses).toEqual({ bonusDamage: 0, bonusMaxHp: 0, bonusSpeed: 0, bonusFireRateMs: 0 });
  });

  it("applique les bonus de l'arme seule", () => {
    const bonuses = computeEquipmentBonuses("fusil_precision", null);
    expect(bonuses.bonusDamage).toBe(5);
    expect(bonuses.bonusFireRateMs).toBe(-30);
  });

  it("cumule les bonus de l'arme ET de l'artéfact", () => {
    const bonuses = computeEquipmentBonuses("canon_surchauffe", "coeur_ancien");
    expect(bonuses.bonusDamage).toBe(10); // vient de l'arme
    expect(bonuses.bonusMaxHp).toBe(40); // vient de l'artéfact
  });

  it("ignore silencieusement un id d'objet inconnu plutôt que de planter", () => {
    const bonuses = computeEquipmentBonuses("objet_qui_nexiste_pas", null);
    expect(bonuses.bonusDamage).toBe(0);
  });
});
