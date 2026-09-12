# Journal de tâche — 19

TÂCHE :
Phase 19 (déploiement) et Phase 20 (monétisation légale), sections 25/19 du GDD.

FICHIERS CRÉÉS / MODIFIÉS :
- /server/src/index.ts (CORS restreint à ALLOWED_ORIGINS au lieu de tout autoriser — corrige
  un point resté en suspens depuis la revue d'architecture ChatGPT de la Phase 7)
- /client/src/network/api.ts (URL du serveur configurable via VITE_API_URL)
- /client/src/network/multiplayer.ts (URL Colyseus configurable via VITE_WS_URL)
- /client/src/vite-env.d.ts (nouveau — types pour les variables d'environnement Vite)
- /server/Dockerfile (nouveau)
- /server/.dockerignore (nouveau)
- /server/.env.production.example (nouveau)
- /client/.env.production.example (nouveau)
- /docs/DEPLOYMENT.md (nouveau — guide pas à pas)
- /docs/MONETIZATION-LEGAL-NOTES.md (nouveau — checklist factuelle, pas un avis juridique)

CE QUI A ÉTÉ FAIT (Phase 19) :
- Correctif de sécurité : CORS n'autorise plus que des origines explicitement configurées
  (variable ALLOWED_ORIGINS), au lieu d'accepter n'importe quel site.
- URLs serveur (API + WebSocket) sorties du code en dur, configurables par variable
  d'environnement au moment du build — nécessaire pour pointer vers un vrai serveur déployé.
- Dockerfile de production pour le serveur (build multi-étapes, exécute les migrations au
  démarrage).
- Guide complet expliquant : choix d'hébergeur (serveur ET client, ce sont deux besoins
  différents), passage impératif de SQLite à PostgreSQL en production, variables
  d'environnement à configurer, étapes de vérification finale.

CE QUI N'A PAS PU ÊTRE FAIT (nécessite des actions de votre côté) :
- Le déploiement réel lui-même : je ne peux pas créer de compte Railway/Fly.io/Render/
  Vercel/Netlify à votre place, ni acheter un nom de domaine. Le guide vous accompagne
  étape par étape quand vous serez prêt.
- Impossible de tester le Dockerfile dans mon bac à sable (pas d'accès Docker), à valider
  chez vous ou directement chez l'hébergeur choisi.

CE QUI A ÉTÉ FAIT (Phase 20) :
- Un document factuel (pas un avis juridique) couvrant : pourquoi une monétisation progressive
  est aussi la plus sûre légalement, le point de vigilance principal sur les mécanismes
  aléatoires payants (gacha) dont la réglementation varie fortement par pays, le RGPD (déjà
  partiellement respecté : mots de passe hashés ; manque encore un moyen de suppression de
  compte), les CGU, la classification par âge, et les prestataires de paiement.
- Conclusion explicite : aucune action légale urgente tant qu'il n'y a pas de paiement réel,
  mais un vrai avis juridique sera nécessaire avant d'en introduire.

TESTS EFFECTUÉS :
- Client : `npx tsc --noEmit` + `npx vite build` → OK (build toujours aussi optimisé qu'à la
  Phase 17).
- Serveur : `npx tsc --noEmit` → OK.
- Non testable ici : le Dockerfile (pas de Docker dans ce bac à sable) et tout déploiement réel.

---

Avec cette phase, les 20 phases du document de coordination initial sont couvertes, au niveau
MVP/prototype. Le projet reste évolutif (voir tous les "CE QUI RESTE À FAIRE" accumulés dans
les journaux précédents) mais a maintenant une boucle de jeu complète, testée, jouable en
solo et en multijoueur basique, avec une base économique fonctionnelle et une voie claire vers
un vrai déploiement.
