import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import {
  performPull,
  nextPityCounter,
  BASE_RATES,
  PULL_COST_CRYSTALS,
  PITY_THRESHOLD,
} from "../services/gachaService.js";

export const gachaRouter = Router();

gachaRouter.use(requireAuth);

gachaRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { characters: true },
  });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  res.json({
    crystals: user.crystals,
    pullsSincePity: user.pullsSincePity,
    pullCost: PULL_COST_CRYSTALS,
    pityThreshold: PITY_THRESHOLD,
    rates: BASE_RATES, // transparence des taux, exigée par la section 12 du GDD
    ownedCharacterIds: user.characters.map((c: { characterId: string }) => c.characterId),
  });
});

gachaRouter.post("/pull", async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { characters: true },
  });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  if (user.crystals < PULL_COST_CRYSTALS) {
    return res.status(400).json({ error: "Pas assez de cristaux" });
  }

  // Le serveur seul décide du résultat du tirage — jamais le client (section 5 du GDD).
  const result = performPull(user.pullsSincePity);
  const alreadyOwned = user.characters.some((c: { characterId: string }) => c.characterId === result.characterId);
  const newPityCounter = nextPityCounter(user.pullsSincePity, result.rarity);

  // Doublon : pas de nouveau personnage, mais on rembourse une partie des cristaux en
  // "fragments" (ici simplifié : remboursement direct en cristaux, un vrai système de
  // fragments d'artéfacts/personnages est noté dans docs/notes-idees-futures.md pour plus tard).
  const consolationRefund = alreadyOwned ? Math.round(PULL_COST_CRYSTALS * 0.3) : 0;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      crystals: user.crystals - PULL_COST_CRYSTALS + consolationRefund,
      pullsSincePity: newPityCounter,
      ...(alreadyOwned
        ? {}
        : { characters: { create: { characterId: result.characterId } } }),
    },
  });

  res.json({
    characterId: result.characterId,
    rarity: result.rarity,
    isNew: !alreadyOwned,
    consolationRefund,
    crystals: updated.crystals,
    pullsSincePity: updated.pullsSincePity,
  });
});
