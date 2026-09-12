# Journal de tâche — 03

TÂCHE :
Phase 6 — la base du joueur. MVP : un seul bâtiment (le QG) avec un niveau et un coût d'amélioration en or, sauvegardé côté serveur.

FICHIERS MODIFIÉS / CRÉÉS :
- /server/prisma/schema.prisma (ajout des champs hqLevel, gold sur User)
- /server/src/services/baseService.ts (nouveau — coûts d'amélioration)
- /server/src/api/base.ts (nouveau — GET /api/base, POST /api/base/upgrade)
- /server/src/index.ts (montage du routeur base)
- /client/src/network/api.ts (fetchBase, upgradeBase)
- /client/src/scenes/BaseScreen.ts (nouveau)
- /client/src/main.ts (flux : auth → base → expédition)
- /shared/constants/base.ts (nouveau — référence, dupliqué côté serveur pour l'instant)

CE QUI A ÉTÉ AJOUTÉ :
- Le joueur possède un QG de niveau 1 au départ avec 100 d'or.
- Écran "Votre base" après la connexion : niveau du QG, or actuel, bouton d'amélioration (grisé si pas assez d'or ou niveau max), bouton "Partir en expédition" qui lance le jeu actuel (le déplacement du personnage).
- Toute la logique (coût, déduction d'or, montée de niveau) est calculée et validée côté serveur — le client ne fait qu'afficher et demander, jamais décider (conforme à la section 5 du GDD).

CE QUI RESTE À FAIRE :
- Plusieurs bâtiments (Forge, Mine, etc.) au lieu d'un seul QG.
- L'or ne peut pour l'instant pas être gagné en jeu (viendra avec le farm de ressources en expédition, section 9).
- Un vrai visuel de base (actuellement un simple écran de texte, pas de représentation graphique des bâtiments).
- Factoriser le code dupliqué entre /shared/constants/base.ts et /server/src/services/baseService.ts une fois un système de workspace npm mis en place.

PROBLÈMES CONNUS :
- Impossible de vérifier la compilation TypeScript ni de tester les routes serveur depuis cet environnement cette fois : la modification du schéma Prisma nécessite de régénérer le client (`prisma generate`), ce qui échoue ici à cause des restrictions réseau du bac à sable (déjà rencontré à la Phase 4). Le code suit la même structure éprouvée que les routes d'authentification déjà testées et fonctionnelles.
- Le code client compile et build sans erreur (ne dépend pas de Prisma).

TESTS EFFECTUÉS :
- Client : `npx tsc --noEmit` et `npx vite build` → OK.
- Serveur : non testé dans cet environnement (voir ci-dessus). À tester chez l'utilisateur après migration.
