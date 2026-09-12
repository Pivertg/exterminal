# Journal de tâche — 16

TÂCHE :
Phase 15 (cosmétiques) et Phase 16 (classements), sections 14 et 16 du GDD.

FICHIERS CRÉÉS / MODIFIÉS :
- /server/prisma/schema.prisma (equippedSkinId, equippedTitleId sur User + table OwnedCosmetic)
- /server/src/services/cosmeticService.ts (nouveau — coûts, détection skin/titre)
- /server/src/api/cosmetics.ts (nouveau — GET/POST buy/POST equip)
- /server/src/api/leaderboard.ts (nouveau — top 20 par expéditions terminées)
- /server/src/index.ts (montage des deux routeurs)
- /client/src/entities/cosmeticTypes.ts (nouveau — 4 skins, 4 titres)
- /client/src/scenes/CosmeticsScreen.ts (nouveau)
- /client/src/scenes/LeaderboardScreen.ts (nouveau)
- /client/src/scenes/BaseScreen.ts (boutons "Cosmétiques" et "Classement")
- /client/src/entities/Player.ts (accepte une couleur de skin optionnelle)
- /client/src/scenes/ExpeditionScene.ts (affiche le titre équipé dans le HUD)
- /client/src/main.ts (récupère skin/titre équipés avant l'expédition)
- /client/src/network/api.ts (fonctions cosmétiques + classement)

CE QUI A ÉTÉ AJOUTÉ :
- 4 skins (dont 1 gratuit par défaut) et 4 titres (dont 1 par défaut), achetables en or —
  aucun avantage compétitif, uniquement visuel, conforme à la section 14 du GDD.
- Le skin équipé change réellement la couleur du personnage en expédition ; le titre s'affiche
  dans le HUD à côté du nom.
- Un classement simple (top 20 par expéditions terminées), accessible depuis la base.

CE QUI RESTE À FAIRE :
- Plus de types de classements (meilleur score, boss vaincus, temps — mentionnés en section 16).
- Plus de cosmétiques (effets d'attaque/ultime, emotes, décorations de base — section 14).
- Vrais visuels pour les skins (actuellement juste un changement de couleur du cercle).

TESTS EFFECTUÉS :
- Client : `npx tsc --noEmit` + `npx vite build` → OK.
- Serveur : `npx tsc --noEmit` → OK (même réserve que d'habitude sur le typage Prisma ici).
- Nécessite une migration : `npx prisma migrate dev --name add-cosmetics-leaderboard`.
