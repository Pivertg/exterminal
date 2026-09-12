# Journal de tâche — 01

TÂCHE :
Mise en place du squelette du projet (Phase 2/3) — architecture de dossiers, client Pixi minimal avec un personnage déplaçable, serveur Express minimal avec une route de santé.

FICHIERS MODIFIÉS / CRÉÉS :
- /client/package.json, tsconfig.json, index.html
- /client/src/main.ts
- /client/src/entities/Player.ts
- /client/src/network/InputManager.ts
- /server/package.json, tsconfig.json
- /server/src/index.ts
- /shared/types/index.ts

CE QUI A ÉTÉ AJOUTÉ :
- Structure de dossiers complète (/client, /server, /shared, /docs) conforme à la section 20.
- Un cercle (personnage placeholder) qui se déplace au clavier (ZQSD/flèches) sur un canvas Pixi.
- Un serveur Express avec une route GET /health pour vérifier qu'il tourne.
- Un fichier de types partagés client/serveur, prêt à être étendu.

CE QUI RESTE À FAIRE :
- Système de compte (inscription/connexion, hash de mot de passe) — Phase 4.
- Sauvegarde de la progression en base (PostgreSQL + Prisma) — Phase 5.
- Remplacer le cercle par un vrai sprite animé.
- Ajouter un premier ennemi et une boucle de combat basique.

PROBLÈMES CONNUS :
- Aucun pour l'instant. Le personnage sort de l'écran si on va trop loin (pas de limites de map définies) — normal à ce stade, sera géré avec la vraie map.

TESTS EFFECTUÉS :
- `npx tsc --noEmit` sur le client : aucune erreur.
- `npx vite build` sur le client : build réussi.
- Serveur lancé localement, `curl http://localhost:3000/health` répond correctement `{"status":"ok",...}`.
