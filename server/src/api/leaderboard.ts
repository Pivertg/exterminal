import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../auth/middleware.js";

export const leaderboardRouter = Router();

leaderboardRouter.use(requireAuth);

/**
 * Classement simple (Phase 16, section 16 du GDD) : les 20 meilleurs comptes par nombre
 * d'expéditions terminées. D'autres classements (meilleur score, boss vaincus, temps) viendront
 * plus tard — l'architecture (juste trier par un champ du compte) permettra de les ajouter
 * facilement sans tout redécouper.
 */
leaderboardRouter.get("/", async (_req, res) => {
  const topUsers = await prisma.user.findMany({
    orderBy: { expeditionsCompleted: "desc" },
    take: 20,
    select: {
      username: true,
      accountLevel: true,
      expeditionsCompleted: true,
    },
  });

  res.json({
    entries: topUsers.map((u: { username: string; accountLevel: number; expeditionsCompleted: number }, index: number) => ({
      rank: index + 1,
      username: u.username,
      accountLevel: u.accountLevel,
      expeditionsCompleted: u.expeditionsCompleted,
    })),
  });
});
