import { describe, it, expect } from "vitest";
import { pickEnemyType, getSpawnTable } from "./enemyTypes";

describe("enemyTypes", () => {
  it("au tout début (0ms), seul GRUNT peut apparaître", () => {
    for (let i = 0; i < 50; i++) {
      expect(pickEnemyType(0)).toBe("GRUNT");
    }
  });

  it("après 60s, PYLON n'apparaît jamais via la table de spawn normale (réservé au boss)", () => {
    for (let i = 0; i < 100; i++) {
      expect(pickEnemyType(120_000)).not.toBe("PYLON");
    }
  });

  it("getSpawnTable retourne toujours au moins un type possible", () => {
    expect(getSpawnTable(0).length).toBeGreaterThan(0);
    expect(getSpawnTable(999_999).length).toBeGreaterThan(0);
  });

  it("pickEnemyType retourne toujours un type présent dans la table du moment", () => {
    const elapsed = 40_000;
    const table = getSpawnTable(elapsed);
    const validTypes = table.map((e) => e.type);
    for (let i = 0; i < 100; i++) {
      expect(validTypes).toContain(pickEnemyType(elapsed));
    }
  });
});
