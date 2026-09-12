# Journal de tâche — 17

TÂCHE :
Phase 17 — optimisation, section 25 du GDD.

FICHIERS MODIFIÉS :
- /client/src/main.ts (CharacterSelectScreen, MultiplayerLobbyScreen, ExpeditionScene chargés
  via import() dynamique au lieu d'imports statiques)
- /client/src/scenes/BaseScreen.ts (GachaScreen, EquipmentScreen, CosmeticsScreen,
  LeaderboardScreen chargés à la demande, au clic sur leur bouton respectif)

CE QUI A ÉTÉ FAIT :
Le seul vrai problème de performance visible jusqu'ici était l'avertissement de Vite sur la
taille du bundle (dépassait 500 Ko après la Phase 16, à cause de Pixi.js + Colyseus.js + tous
les écrans chargés d'un coup au démarrage). Solution : découpage du code en chargement à la
demande (imports dynamiques), pour que le navigateur ne télécharge que ce dont il a besoin au
moment où il en a besoin.

RÉSULTAT MESURÉ (avant/après, taille du plus gros fichier initial nécessaire à l'affichage) :
- Avant : un seul fichier ~600 Ko chargé immédiatement au démarrage.
- Après : fichier initial ~15 Ko. Le moteur de jeu (Pixi, ~490 Ko) et Colyseus.js (~78 Ko) ne
  se chargent que lorsque le joueur clique sur "Partir en expédition" / choisit le multijoueur.
  Plus aucun avertissement de taille de chunk de la part de Vite.

CE QUI RESTE À FAIRE (autres pistes d'optimisation pour plus tard, pas urgentes pour un
prototype) :
- Réduire encore la taille du chunk ExpeditionScene lui-même (Pixi.js est en grande partie
  incompressible, mais on pourrait éventuellement ne charger que les modules Pixi utilisés).
- Côté serveur : rien d'urgent pour l'instant (charge très faible en développement). À revisiter
  si le nombre de joueurs simultanés augmente réellement (voir aussi la Phase 19, déploiement).
- Profiler les performances de rendu Pixi une fois de vrais sprites/animations en place
  (actuellement des formes géométriques simples, peu coûteuses).

TESTS EFFECTUÉS :
- `npx tsc --noEmit` : OK.
- `npx vite build` : plus aucun avertissement de taille de chunk. Chunks vérifiés un par un
  (CharacterSelectScreen, GachaScreen, EquipmentScreen, CosmeticsScreen, LeaderboardScreen,
  MultiplayerLobbyScreen, ExpeditionScene) — tous générés séparément comme attendu.
- Non testé ici : le comportement réel dans le navigateur (temps de chargement perçu) — à
  confirmer chez vous, mais le principe du code-splitting est standard et fiable.
