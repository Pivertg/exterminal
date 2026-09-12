import { describe, it, expect } from "vitest";
import { getHqUpgradeCost } from "./baseService.js";

describe("baseService", () => {
  it("retourne un coût croissant à chaque niveau", () => {
    const cost1 = getHqUpgradeCost(1)!;
    const cost2 = getHqUpgradeCost(2)!;
    const cost3 = getHqUpgradeCost(3)!;
    expect(cost2).toBeGreaterThan(cost1);
    expect(cost3).toBeGreaterThan(cost2);
  });

  it("retourne null au-delà du niveau max configuré (pas d'amélioration infinie)", () => {
    expect(getHqUpgradeCost(999)).toBeNull();
  });
});
