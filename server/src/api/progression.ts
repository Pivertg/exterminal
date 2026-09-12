import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { getXpRequiredForLevel, computeAchievements } from "../services/progressionService.js";

export const progressionRouter = Router();

progressionRouter.use(requireAuth);

/**
 * Vue d'ensemble de la progression du compte (Phase 10, section 15 du GDD) :
 * niveau de compte + XP, niveau de base, or, nombre d'expéditions et succès.
 * Personnages/équipements pas encore inclus (pas encore modélisés — Phases 11/13/14).
 */
progressionRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  const stats = {
    accountLevel: user.accountLevel,
    hqLevel: user.hqLevel,
    expeditionsCompleted: user.expeditionsCompleted,
    gold: user.gold,
  };

  res.json({
    accountLevel: user.accountLevel,
    accountXp: user.accountXp,
    xpForNextLevel: getXpRequiredForLevel(user.accountLevel),
    hqLevel: user.hqLevel,
    gold: user.gold,
    expeditionsCompleted: user.expeditionsCompleted,
    achievements: computeAchievements(stats),
  });
});
