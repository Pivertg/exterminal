# Journal de tâche — 08

TÂCHE :
Phase 10 — progression du compte (section 15 du GDD) : niveau de compte basé sur l'XP,
compteur d'expéditions terminées, et un premier système de succès.

⚠️ POINT IMPORTANT AVANT DE LIRE LA SUITE :
D'après les journaux disponibles (docs/journal-04-phase9-boss-da.md), la Phase 9 (Boss)
n'a été livrée que comme document de conception — aucun code de boss n'existe encore dans
`/client` ou `/server`. On est donc passé de la Phase 8 (ennemis) directement à la Phase 10,
en sautant la Phase 9, alors que la section 22 du GDD demande de tester chaque fonctionnalité
avant de passer à la suivante et que la section 25 fixe un ordre de phases précis.
Je n'ai pas bloqué le travail pour autant (autant avancer sur quelque chose d'utile plutôt que
d'attendre), mais la Phase 9 reste à faire — merci de confirmer si c'est un choix assumé ou un
oubli avant que je continue vers la Phase 11.

Par ailleurs, la section 15 du GDD inclut aussi Personnages et Équipements dans la
« progression » — ces systèmes n'existent pas encore (Phases 11/13/14), donc cette Phase 10
ne couvre que ce qui est réellement en place aujourd'hui : niveau de compte (XP), niveau de
base (déjà existant), or, nombre d'expéditions et succès.

FICHIERS MODIFIÉS / CRÉÉS :
- /server/prisma/schema.prisma (ajout de `accountXp` et `expeditionsCompleted` sur `User`)
- /server/src/services/progressionService.ts (nouveau)
- /server/src/api/progression.ts (nouveau — GET /api/progression)
- /server/src/api/expedition.ts (modifié — attribue aussi de l'XP de compte à la fin d'une expédition)
- /server/src/index.ts (montage du routeur progression)
- /shared/constants/progression.ts (nouveau — courbe d'XP et définitions des succès, documentation de référence)
- /client/src/network/api.ts (ProgressionState, fetchProgression, ExpeditionResult étendu)
- /client/src/scenes/BaseScreen.ts (nouveau panneau : niveau de compte + barre d'XP, expéditions terminées, liste de succès)
- /client/src/scenes/ExpeditionScene.ts (le texte de fin d'expédition affiche aussi l'XP gagnée et une montée de niveau éventuelle)

CE QUI A ÉTÉ AJOUTÉ :
- Courbe d'XP de compte (100/220/400/650/1000 — 5 paliers, plafonné pour le prototype, même
  logique que HQ_UPGRADE_COSTS pour la base).
- Chaque expédition terminée donne maintenant, en plus de l'or (40-70), de l'XP de compte
  (20-35), tirée et appliquée uniquement côté serveur (jamais par le client — section 5 du GDD).
  Gère aussi le cas de plusieurs montées de niveau d'un coup.
- Compteur `expeditionsCompleted`, incrémenté par le serveur à chaque expédition complétée.
- 6 succès basés sur les données déjà réelles (pas de fausses statistiques) : première
  expédition, 10 et 50 expéditions, niveau de compte 5, QG niveau 3, 500 or possédé.
- Nouvelle route GET /api/progression qui renvoie tout l'état de progression + succès calculés.
- Écran de base : barre d'XP avec pourcentage, nombre d'expéditions, liste de succès
  (verrouillés/déverrouillés visuellement).

CE QUI RESTE À FAIRE :
- Boss (Phase 9 — voir l'avertissement ci-dessus).
- Personnages et équipements (Phases 11/13/14) — la progression ne les couvre pas encore.
- Les succès sont recalculés à la volée depuis les stats existantes plutôt que stockés
  individuellement en base ; ça suffit tant qu'aucun succès n'a d'effet de bord (récompense
  ponctuelle par ex.) — à revoir si un jour un succès doit donner une récompense unique.
- Équilibrage des paliers d'XP (chiffres de départ, comme pour l'or à la Phase 7) à ajuster
  après tests joués.
- Un vrai visuel pour le panneau de progression (actuellement du HTML simple, en attendant la DA).

PROBLÈMES CONNUS :
- Nouveau changement de schéma Prisma (`accountXp`, `expeditionsCompleted`) → nécessite
  `npx prisma migrate dev` chez vous avant de lancer le serveur.
- Comme aux phases 3, 6 et 7 : impossible d'installer les dépendances ou de faire tourner
  `prisma generate`/`tsc` complet dans cet environnement (accès réseau désactivé côté bac à
  sable). Les erreurs obtenues sont uniquement des « module introuvable » (express, pixi.js,
  @prisma/client, etc.), identiques à celles déjà documentées précédemment — pas d'erreur liée
  au nouveau code. Le flux complet (expédition → XP → niveau → panneau de progression) doit
  être testé chez vous.

TESTS EFFECTUÉS :
- Relecture manuelle ligne par ligne de tous les fichiers modifiés (pas d'erreur de syntaxe
  ou de typage repérée).
- `npx tsc --noEmit` côté client et serveur : mêmes erreurs de modules manquants que les
  phases précédentes dans cet environnement, aucune erreur propre au nouveau code.

À FAIRE CHEZ VOUS AVANT DE JOUER :
1. `cd server && npx prisma migrate dev --name phase10-progression`
2. `npm install` puis `npm run dev` (ou équivalent) côté client et serveur
3. Jouer une expédition complète et vérifier : gain d'XP affiché, montée de niveau si palier
   atteint, panneau de progression sur l'écran de base à jour.
