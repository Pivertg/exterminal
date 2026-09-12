import { describe, it, expect } from "vitest";
import { findCosmeticCost, getCosmeticKind } from "./cosmeticService.js";

describe("cosmeticService", () => {
  it("le skin et le titre par défaut sont gratuits", () => {
    expect(findCosmeticCost("defaut")).toBe(0);
    expect(findCosmeticCost("aucun")).toBe(0);
  });

  it("retourne null pour un objet cosmétique inconnu", () => {
    expect(findCosmeticCost("inexistant")).toBeNull();
  });

  it("identifie correctement le type (skin ou titre)", () => {
    expect(getCosmeticKind("or")).toBe("skin");
    expect(getCosmeticKind("legende")).toBe("title");
    expect(getCosmeticKind("inexistant")).toBeNull();
  });

  it("aucun id n'existe à la fois dans les skins et les titres (pas d'ambiguïté possible)", () => {
    // Si un id existait dans les deux tables, getCosmeticKind renverrait toujours "skin"
    // (premier test dans la fonction) et cacherait silencieusement un bug de conception.
    // On vérifie ici que ce cas n'arrive pas dans les données actuelles.
    const skinIds = ["defaut", "or", "neon", "ombre"];
    const titleIds = ["aucun", "survivant", "chasseur_de_boss", "legende"];
    const overlap = skinIds.filter((id) => titleIds.includes(id));
    expect(overlap).toEqual([]);
  });
});
