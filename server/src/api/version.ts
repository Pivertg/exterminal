import { Router } from "express";

export const versionRouter = Router();

// Version du jeu actuellement servie. Le launcher desktop compare sa propre version à celle-ci
// pour savoir si une mise à jour est disponible (pas de téléchargement automatique pour
// l'instant — juste un affichage informatif, voir /desktop/launcher.html).
const CURRENT_VERSION = "0.1.0";

versionRouter.get("/", (_req, res) => {
  res.json({ version: CURRENT_VERSION });
});
