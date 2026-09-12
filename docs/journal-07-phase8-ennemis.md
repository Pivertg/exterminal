# Journal de tâche — 07

TÂCHE :
Phase 8 — variété d'ennemis. Jusqu'ici (Phase 7), un seul type d'ennemi existait. Objectif : plusieurs comportements distincts et une difficulté qui progresse dans la durée de l'expédition, sans toucher au boss (Phase 9, pas encore commencée).

FICHIERS MODIFIÉS / CRÉÉS :
- /client/src/entities/enemyTypes.ts (nouveau — définitions data-driven des types d'ennemis + table de spawn pondérée par le temps écoulé)
- /client/src/entities/Enemy.ts (refonte — la classe lit maintenant une EnemyDefinition au lieu d'avoir des stats fixes ; gère le comportement "garde ses distances" pour les ennemis à distance)
- /client/src/entities/Projectile.ts (ajout d'un champ `owner: "player" | "enemy"` pour distinguer les tirs du joueur et ceux des ennemis à distance)
- /client/src/scenes/ExpeditionScene.ts (spawn pondéré selon le temps écoulé, tir des ennemis à distance, collisions séparées par propriétaire du projectile, XP variable selon le type d'ennemi tué)

CE QUI A ÉTÉ AJOUTÉ :
- 4 types d'ennemis : Rôdeur (basique, équivalent à l'ancien ennemi), Traqueur (rapide, fragile), Colosse (lent, tanky, gros dégâts au contact), Cracheur (reste à distance et tire des projectiles).
- Table de spawn progressive : seulement des Rôdeurs les 15 premières secondes, puis Traqueurs, puis Colosses après 35s, puis Cracheurs après 60s — les types se cumulent, ils ne se remplacent pas.
- XP donnée par ennemi désormais variable (10 à 25 selon le type) au lieu d'un montant fixe.
- Système de projectiles génériques réutilisé pour les deux camps (au lieu de dupliquer une classe "projectile ennemi").

CE QUI RESTE À FAIRE :
- Vrais visuels par type d'ennemi (actuellement des carrés de couleurs différentes, en attendant la DA — même limite que les phases précédentes).
- Équilibrage fin des stats/paliers de spawn — les chiffres actuels sont une première estimation, à ajuster après tests joués.
- Boss de fin d'expédition (Phase 9 — specs déjà prêtes dans docs/journal-04-phase9-boss-da.md, pas commencé).
- Éventuellement : un indicateur visuel de portée pour le Cracheur, pour que le joueur comprenne pourquoi il recule/avance.

PROBLÈMES CONNUS :
- Aucun changement de schéma Prisma ni de code serveur cette phase.
- Testé par compilation uniquement (`tsc --noEmit` + `vite build`, tous deux OK) — le ressenti de jeu (équilibrage, lisibilité des types d'ennemis) doit être validé en jouant réellement.

TESTS EFFECTUÉS :
- Client : `npx tsc --noEmit` → OK.
- Client : `npx vite build` → OK (477 modules, aucune erreur).
- Serveur : non touché, pas de nouveau test nécessaire.
