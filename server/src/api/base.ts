import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { getHqUpgradeCost } from "../services/baseService.js";

export const baseRouter = Router();

// Toutes les routes de base nécessitent d'être connecté
baseRouter.use(requireAuth);

baseRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  res.json({
    hqLevel: user.hqLevel,
    gold: user.gold,
    nextUpgradeCost: getHqUpgradeCost(user.hqLevel), // null = niveau max
  });
});

baseRouter.post("/upgrade", async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  const cost = getHqUpgradeCost(user.hqLevel);
  if (cost === null) {
    return res.status(400).json({ error: "Niveau maximum déjà atteint" });
  }
  if (user.gold < cost) {
    return res.status(400).json({ error: "Pas assez d'or" });
  }

  // Le serveur seul décide de l'or et du niveau (section 5 du GDD) — jamais le client.
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      gold: user.gold - cost,
      hqLevel: user.hqLevel + 1,
    },
  });

  res.json({
    hqLevel: updated.hqLevel,
    gold: updated.gold,
    nextUpgradeCost: getHqUpgradeCost(updated.hqLevel),
  });
});
