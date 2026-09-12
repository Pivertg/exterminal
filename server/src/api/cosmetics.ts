import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { findCosmeticCost, getCosmeticKind } from "../services/cosmeticService.js";

export const cosmeticsRouter = Router();

cosmeticsRouter.use(requireAuth);

cosmeticsRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { cosmetics: true },
  });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  res.json({
    gold: user.gold,
    owned: user.cosmetics.map((c: { itemId: string }) => c.itemId),
    equippedSkinId: user.equippedSkinId,
    equippedTitleId: user.equippedTitleId,
  });
});

cosmeticsRouter.post("/buy", async (req: AuthenticatedRequest, res) => {
  const { itemId } = req.body ?? {};
  if (typeof itemId !== "string") return res.status(400).json({ error: "itemId manquant" });

  const cost = findCosmeticCost(itemId);
  if (cost === null) return res.status(400).json({ error: "Objet cosmétique inconnu" });

  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { cosmetics: true },
  });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  if (user.cosmetics.some((c: { itemId: string }) => c.itemId === itemId)) {
    return res.status(409).json({ error: "Déjà possédé" });
  }
  if (user.gold < cost) {
    return res.status(400).json({ error: "Pas assez d'or" });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      gold: user.gold - cost,
      cosmetics: { create: { itemId } },
    },
    include: { cosmetics: true },
  });

  res.json({
    gold: updated.gold,
    owned: updated.cosmetics.map((c: { itemId: string }) => c.itemId),
  });
});

cosmeticsRouter.post("/equip", async (req: AuthenticatedRequest, res) => {
  const { itemId } = req.body ?? {};
  if (typeof itemId !== "string") return res.status(400).json({ error: "itemId manquant" });

  const kind = getCosmeticKind(itemId);
  if (!kind) return res.status(400).json({ error: "Objet cosmétique inconnu" });

  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { cosmetics: true },
  });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  const isFree = findCosmeticCost(itemId) === 0;
  const owns = isFree || user.cosmetics.some((c: { itemId: string }) => c.itemId === itemId);
  if (!owns) return res.status(403).json({ error: "Vous ne possédez pas cet objet" });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: kind === "skin" ? { equippedSkinId: itemId } : { equippedTitleId: itemId },
  });

  res.json({
    equippedSkinId: updated.equippedSkinId,
    equippedTitleId: updated.equippedTitleId,
  });
});
