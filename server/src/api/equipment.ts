import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";
import { getSlotForItem } from "../services/equipmentService.js";

export const equipmentRouter = Router();

equipmentRouter.use(requireAuth);

equipmentRouter.get("/", async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { inventory: true },
  });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  res.json({
    inventory: user.inventory.map((i: { itemId: string }) => i.itemId),
    equippedWeaponId: user.equippedWeaponId,
    equippedArtifactId: user.equippedArtifactId,
  });
});

equipmentRouter.post("/equip", async (req: AuthenticatedRequest, res) => {
  const { itemId } = req.body ?? {};
  if (typeof itemId !== "string") {
    return res.status(400).json({ error: "itemId manquant" });
  }

  const slot = getSlotForItem(itemId);
  if (!slot) {
    return res.status(400).json({ error: "Objet inconnu" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { inventory: true },
  });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  const owns = user.inventory.some((i: { itemId: string }) => i.itemId === itemId);
  if (!owns) {
    return res.status(403).json({ error: "Vous ne possédez pas cet objet" });
  }

  // Le serveur vérifie la possession avant d'équiper — jamais de confiance aveugle envers le
  // client sur ce qu'il "dit" posséder (section 5 du GDD).
  const updated = await prisma.user.update({
    where: { id: user.id },
    data:
      slot === "weapon"
        ? { equippedWeaponId: itemId }
        : { equippedArtifactId: itemId },
  });

  res.json({
    equippedWeaponId: updated.equippedWeaponId,
    equippedArtifactId: updated.equippedArtifactId,
  });
});
