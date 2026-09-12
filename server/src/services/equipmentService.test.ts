import { describe, it, expect } from "vitest";
import { rollEquipmentDrop, getSlotForItem, EQUIPMENT_TABLE } from "./equipmentService.js";

describe("equipmentService", () => {
  it("rollEquipmentDrop retourne soit null, soit un id présent dans EQUIPMENT_TABLE", () => {
    const validIds = EQUIPMENT_TABLE.map((e) => e.id);
    for (let i = 0; i < 300; i++) {
      const drop = rollEquipmentDrop();
      if (drop !== null) expect(validIds).toContain(drop);
    }
  });

  it("rollEquipmentDrop retourne parfois null et parfois un objet (pas 100% ni 0%)", () => {
    const results = Array.from({ length: 500 }, () => rollEquipmentDrop());
    expect(results.some((r) => r === null)).toBe(true);
    expect(results.some((r) => r !== null)).toBe(true);
  });

  it("getSlotForItem retourne le bon emplacement pour un objet connu", () => {
    expect(getSlotForItem("lame_rouillee")).toBe("weapon");
    expect(getSlotForItem("coeur_ancien")).toBe("artifact");
  });

  it("getSlotForItem retourne null pour un objet inconnu", () => {
    expect(getSlotForItem("objet_qui_nexiste_pas")).toBeNull();
  });

  it("aucun objet n'a de poids de drop négatif ou nul (sinon il ne sortirait jamais)", () => {
    for (const entry of EQUIPMENT_TABLE) {
      expect(entry.dropWeight).toBeGreaterThan(0);
    }
  });
});
