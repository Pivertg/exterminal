import { describe, it, expect } from "vitest";
import { rollExpeditionXpReward, applyAccountXp, getXpRequiredForLevel } from "./progressionService.js";

describe("progressionService", () => {
  it("rollExpeditionXpReward reste dans la fourchette annoncée (20-35)", () => {
    for (let i = 0; i < 200; i++) {
      const xp = rollExpeditionXpReward();
      expect(xp).toBeGreaterThanOrEqual(20);
      expect(xp).toBeLessThanOrEqual(35);
    }
  });

  it("applyAccountXp ne fait rien monter de niveau si l'XP gagnée est insuffisante", () => {
    const result = applyAccountXp(1, 0, 5); // seuil du niveau 1 = 100
    expect(result.accountLevel).toBe(1);
    expect(result.accountXp).toBe(5);
    expect(result.leveledUp).toBe(false);
  });

  it("applyAccountXp fait monter de niveau pile au seuil", () => {
    const requiredForLevel1 = getXpRequiredForLevel(1)!;
    const result = applyAccountXp(1, 0, requiredForLevel1);
    expect(result.accountLevel).toBe(2);
    expect(result.accountXp).toBe(0);
    expect(result.leveledUp).toBe(true);
  });

  it("applyAccountXp peut faire monter plusieurs niveaux d'un coup si l'XP gagnée est énorme", () => {
    const result = applyAccountXp(1, 0, 100_000);
    // Ne doit pas dépasser le dernier palier connu de la courbe (niveau max du prototype)
    const maxLevel = 6; // ACCOUNT_XP_CURVE a 5 paliers -> niveau max atteignable = 6
    expect(result.accountLevel).toBeLessThanOrEqual(maxLevel);
    expect(result.leveledUp).toBe(true);
  });

  it("getXpRequiredForLevel retourne null au-delà du niveau max du prototype", () => {
    expect(getXpRequiredForLevel(999)).toBeNull();
  });
});
