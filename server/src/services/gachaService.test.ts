import { describe, it, expect } from "vitest";
import { performPull, nextPityCounter, BASE_RATES, PITY_THRESHOLD, RARITY_POOLS } from "./gachaService.js";

describe("gachaService", () => {
  it("BASE_RATES totalisent bien 100% (contrat de transparence du GDD, section 12)", () => {
    const total = Object.values(BASE_RATES).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);
  });

  it("chaque rareté a au moins un personnage dans son pool", () => {
    for (const rarity of [2, 3, 4, 5] as const) {
      expect(RARITY_POOLS[rarity].length).toBeGreaterThan(0);
    }
  });

  it("performPull retourne toujours un personnage appartenant au pool de sa propre rareté", () => {
    for (let i = 0; i < 200; i++) {
      const result = performPull(0);
      expect(RARITY_POOLS[result.rarity]).toContain(result.characterId);
    }
  });

  it("le pity garantit un ★★★★ ou mieux au seuil configuré", () => {
    for (let i = 0; i < 100; i++) {
      const result = performPull(PITY_THRESHOLD - 1);
      expect(result.rarity).toBeGreaterThanOrEqual(4);
    }
  });

  it("sans pity (compteur à 0), un pull peut aussi être ★★ ou ★★★ (pas de sur-garantie)", () => {
    // Sur un grand nombre de tirages sans pity, on doit voir apparaître au moins un ★★ ou ★★★.
    const rarities = Array.from({ length: 300 }, () => performPull(0).rarity);
    expect(rarities.some((r) => r === 2 || r === 3)).toBe(true);
  });

  it("nextPityCounter remet le compteur à 0 sur un ★★★★+, l'incrémente sinon", () => {
    expect(nextPityCounter(5, 4)).toBe(0);
    expect(nextPityCounter(5, 5)).toBe(0);
    expect(nextPityCounter(5, 3)).toBe(6);
    expect(nextPityCounter(5, 2)).toBe(6);
  });
});
