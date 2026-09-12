import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { rollExpeditionGoldReward } from "../services/expeditionService.js";
import { rollExpeditionXpReward, applyAccountXp, getXpRequiredForLevel } from "../services/progressionService.js";
import { rollEquipmentDrop } from "../services/equipmentService.js";

export const expeditionRouter = Router();

expeditionRouter.use(requireAuth);

/**
 * Le client appelle cette route quand une expédition se termine (mort ou survie complète).
 * MVP : pas encore de vérification que l'expédition a vraiment eu lieu (viendra avec un
 * système de session d'expédition plus robuste). Le point important pour l'instant est que
 * le MONTANT de la récompense est toujours décidé par le serveur, jamais envoyé par le client.
 */
expeditionRouter.post("/complete", async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { inventory: true },
  });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  const reward = rollExpeditionGoldReward();
  const xpGained = rollExpeditionXpReward();
  const crystalsGained = 15; // modeste et fixe pour le MVP — alimente le recrutement sans paiement réel

  // Le serveur seul décide de l'or ET de l'XP/niveau de compte (section 5 du GDD).
  const { accountLevel, accountXp, leveledUp } = applyAccountXp(
    user.accountLevel,
    user.accountXp,
    xpGained
  );

  const droppedItemId = rollEquipmentDrop();
  const alreadyOwnsDrop = droppedItemId
    ? user.inventory.some((i: { itemId: string }) => i.itemId === droppedItemId)
    : false;
  const itemGranted = droppedItemId !== null && !alreadyOwnsDrop;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      gold: user.gold + reward,
      crystals: user.crystals + crystalsGained,
      accountLevel,
      accountXp,
      expeditionsCompleted: user.expeditionsCompleted + 1,
      ...(itemGranted ? { inventory: { create: { itemId: droppedItemId! } } } : {}),
    },
  });

  res.json({
    reward,
    gold: updated.gold,
    crystalsGained,
    crystals: updated.crystals,
    xpGained,
    accountLevel: updated.accountLevel,
    accountXp: updated.accountXp,
    xpForNextLevel: getXpRequiredForLevel(updated.accountLevel),
    leveledUp,
    expeditionsCompleted: updated.expeditionsCompleted,
    itemDropped: itemGranted ? droppedItemId : null, // null aussi si déjà possédé (pas de doublon d'objet pour le MVP)
  });
});
