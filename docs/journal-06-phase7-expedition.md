# Journal de tâche — 06

TÂCHE :
Phase 7 — première vraie expédition. Ennemis qui apparaissent progressivement, combat automatique façon Brotato, XP/niveaux avec choix d'amélioration temporaire, fin d'expédition avec récompense en or calculée côté serveur.

FICHIERS MODIFIÉS / CRÉÉS :
- /server/src/services/expeditionService.ts (nouveau)
- /server/src/api/expedition.ts (nouveau — POST /api/expedition/complete)
- /server/src/index.ts (montage du routeur expedition)
- /client/src/entities/Enemy.ts (nouveau)
- /client/src/entities/Projectile.ts (nouveau)
- /client/src/entities/Player.ts (ajout PV, dégâts, XP, niveau, cadence de tir)
- /client/src/network/api.ts (completeExpedition)
- /client/src/scenes/ExpeditionScene.ts (nouveau — coeur du gameplay)
- /client/src/main.ts (branche base → expédition → retour base)

CE QUI A ÉTÉ AJOUTÉ :
- Expédition de 90 secondes (dans la fourchette 2-4 min visée par l'équilibrage, à ajuster après premiers tests).
- Ennemis apparaissant sur les bords de l'écran, se dirigeant vers le joueur, infligeant des dégâts au contact.
- Tir automatique du joueur vers l'ennemi le plus proche (façon Brotato).
- XP gagnée par ennemi tué, montée de niveau avec choix entre 3 améliorations temporaires tirées aléatoirement parmi 4 (dégâts, vitesse, cadence de tir, PV max) — conforme à la section 8 du GDD.
- Fin d'expédition (victoire par survie ou défaite si PV à 0) → appel serveur qui calcule et attribue l'or (40-70, fourchette de l'analyse économique) → retour à la base avec l'or à jour.

CE QUI RESTE À FAIRE :
- Ressources de farm (bois, minerai, etc. — section 9), pas seulement de l'or.
- Vrais visuels (actuellement des rectangles/cercles colorés, en attendant la direction artistique Neo-Retro Vectoriel définie dans docs/moodboard-da.md).
- Un vrai boss en fin d'expédition (Phase 9 — les specs sont déjà prêtes dans docs/journal-04-phase9-boss-da.md).
- Plusieurs zones/maps différentes (section 7).
- Vérification serveur qu'une expédition a réellement eu lieu avant de donner la récompense (actuellement, appeler la route suffit — acceptable en solo/prototype, à revoir avant tout mode compétitif ou multijoueur).

PROBLÈMES CONNUS :
- Aucun changement de schéma Prisma cette phase, donc pas de nouvelle migration nécessaire.
- Testé uniquement par compilation : impossible de lancer une vraie requête de base de données dans cet environnement (même limite réseau que les phases précédentes). Le flux complet (jouer → mourir/survivre → recevoir l'or → retour base) doit être testé chez l'utilisateur.

TESTS EFFECTUÉS :
- Client : `npx tsc --noEmit` et `npx vite build` → OK.
- Serveur : `npx tsc --noEmit` → OK (pas de changement de schéma, donc vérification complète possible cette fois).
