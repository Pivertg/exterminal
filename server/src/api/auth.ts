import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { hashPassword, verifyPassword } from "../auth/hash.js";
import { signToken } from "../auth/jwt.js";
import { requireAuth, type AuthenticatedRequest } from "../auth/middleware.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const { username, email, password } = req.body ?? {};

  if (typeof username !== "string" || username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: "Le pseudo doit contenir entre 3 et 20 caractères" });
  }
  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Email invalide" });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    return res.status(409).json({ error: "Pseudo ou email déjà utilisé" });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      // Personnage de départ, toujours possédé (voir characterTypes.ts côté client).
      characters: { create: { characterId: "recrue" } },
    },
  });

  const token = signToken({ userId: user.id, username: user.username });
  res.status(201).json({
    token,
    user: { id: user.id, username: user.username, accountLevel: user.accountLevel },
  });
});

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};

  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Pseudo et mot de passe requis" });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  // Message volontairement générique pour ne pas révéler si le pseudo existe
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: "Identifiants incorrects" });
  }

  const token = signToken({ userId: user.id, username: user.username });
  res.json({
    token,
    user: { id: user.id, username: user.username, accountLevel: user.accountLevel },
  });
});

// Exemple de route protégée : le client doit fournir "Authorization: Bearer <token>"
authRouter.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  res.json({ id: user.id, username: user.username, accountLevel: user.accountLevel });
});
