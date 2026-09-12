import type { Request, Response, NextFunction } from "express";
import { verifyToken, type TokenPayload } from "./jwt.js";

// Ajoute le champ "user" à l'objet Request pour les routes protégées
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentification requise" });
  }

  const token = header.slice("Bearer ".length);
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}
