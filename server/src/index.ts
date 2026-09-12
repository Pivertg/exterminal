import express from "express";
import cors from "cors";
import http from "http";
import colyseus from "colyseus";
const { Server } = colyseus;
import { authRouter } from "./api/auth.js";
import { baseRouter } from "./api/base.js";
import { expeditionRouter } from "./api/expedition.js";
import { progressionRouter } from "./api/progression.js";
import { gachaRouter } from "./api/gacha.js";
import { equipmentRouter } from "./api/equipment.js";
import { cosmeticsRouter } from "./api/cosmetics.js";
import { leaderboardRouter } from "./api/leaderboard.js";
import { versionRouter } from "./api/version.js";
import { GameRoom } from "./rooms/GameRoom.js";

const app = express();

// CORS restreint aux origines autorisées (corrige le point soulevé dans la revue d'architecture
// de ChatGPT — docs/analysis/architecture-review-phase7.md : "CORS actuellement ouvert").
// ALLOWED_ORIGINS = liste séparée par des virgules, ex: "https://monjeu.com,https://www.monjeu.com"
// En développement, si la variable n'est pas définie, on autorise localhost par défaut.
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Pas d'en-tête Origin (app desktop Electron chargée via file://, curl, apps mobiles...)
      // → on laisse passer : ce n'est pas un navigateur web, le risque CORS classique ne
      // s'applique pas de la même façon. Un vrai navigateur, lui, enverra toujours un Origin,
      // et sera filtré normalement contre la liste ci-dessus.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origine non autorisée par CORS"));
      }
    },
  })
);
app.use(express.json());

// Sert les fichiers de mise à jour de l'app desktop (electron-updater les lit ici).
// Placez-y le contenu généré par `npm run dist:win` (ou mac/linux) depuis /desktop/release
// avant de lancer le serveur — voir /server/updates/README.md pour le détail.
app.use("/updates", express.static("updates"));

// Route de vérification — permet de tester que le serveur tourne (règle 22 : tester avant de continuer)
app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Serveur du jeu opérationnel" });
});

app.use("/api/auth", authRouter);
app.use("/api/base", baseRouter);
app.use("/api/expedition", expeditionRouter);
app.use("/api/progression", progressionRouter);
app.use("/api/gacha", gachaRouter);
app.use("/api/equipment", equipmentRouter);
app.use("/api/cosmetics", cosmeticsRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/version", versionRouter);

// Le serveur HTTP est partagé entre l'API REST (Express) et le serveur temps réel (Colyseus).
const httpServer = http.createServer(app);
const gameServer = new Server({ server: httpServer });
gameServer.define("game_room", GameRoom);

const PORT = process.env.PORT ?? 3000;
httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT} (API + Colyseus)`);
});
