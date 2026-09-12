import { describe, it, expect } from "vitest";
import { rollExpeditionGoldReward } from "./expeditionService.js";

describe("expeditionService", () => {
  it("reste toujours dans la fourchette annoncée (40-70 or)", () => {
    for (let i = 0; i < 200; i++) {
      const reward = rollExpeditionGoldReward();
      expect(reward).toBeGreaterThanOrEqual(40);
      expect(reward).toBeLessThanOrEqual(70);
    }
  });

  it("retourne un entier (pas de fraction d'or)", () => {
    const reward = rollExpeditionGoldReward();
    expect(Number.isInteger(reward)).toBe(true);
  });
});
