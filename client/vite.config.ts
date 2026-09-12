import { defineConfig } from "vite";

export default defineConfig({
  // Chemins relatifs plutôt qu'absolus dans le build : nécessaire pour qu'Electron puisse
  // charger les fichiers via file:// (les chemins absolus type "/assets/..." ne fonctionnent
  // pas avec ce protocole). N'a aucun impact sur le déploiement web classique (Vercel/Netlify).
  base: "./",
});
