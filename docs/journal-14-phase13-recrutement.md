# Journal de tâche — 14

TÂCHE :
Phase 13 — recrutement (gacha), section 12 du GDD.

FICHIERS CRÉÉS / MODIFIÉS :
- /server/prisma/schema.prisma (ajout : crystals, pullsSincePity sur User + nouvelle table
  PlayerCharacter, comme prévu dans les décisions de journal-05)
- /server/src/services/gachaService.ts (nouveau — taux, pity, tirage)
- /server/src/api/gacha.ts (nouveau — GET /api/gacha, POST /api/gacha/pull)
- /server/src/api/auth.ts (le personnage "recrue" est offert à l'inscription)
- /server/src/api/expedition.ts (ajout d'une récompense fixe de 15 cristaux par expédition)
- /server/src/index.ts (montage du routeur gacha)
- /client/src/entities/characterTypes.ts (ajout de la rareté + 2 nouveaux personnages :
  "recrue" ★★ possédée par défaut, "invocateur" ★★★★★ rare)
- /client/src/network/api.ts (fetchGacha, pullGacha, cristaux ajoutés à ExpeditionResult)
- /client/src/scenes/GachaScreen.ts (nouveau — écran de recrutement)
- /client/src/scenes/BaseScreen.ts (bouton "Centre de recrutement")
- /client/src/scenes/CharacterSelectScreen.ts (ne montre plus que les personnages possédés)
- /client/src/main.ts (passe le token à CharacterSelectScreen)

CE QUI A ÉTÉ AJOUTÉ :
- 4 personnages avec rareté : recrue ★★ (offerte), éclaireuse ★★★, colosse ★★★★,
  invocateur ★★★★★.
- Monnaie "cristaux" : 300 offerts à la création du compte, +15 par expédition terminée.
- Un pull coûte 100 cristaux. Taux affichés en clair dans l'écran (60/30/8/2 %).
- Pity : garantit un ★★★★ ou mieux au bout de 10 pulls sans en avoir eu.
- Doublon = pas de nouveau personnage, mais remboursement de 30% des cristaux dépensés
  (système de fragments plus élaboré noté dans docs/notes-idees-futures.md pour plus tard).
- Le tirage est entièrement calculé et appliqué côté serveur (section 5 du GDD) ; le client
  ne fait qu'afficher le résultat.
- L'écran de choix de personnage ne propose plus que les personnages réellement possédés.

POINT IMPORTANT DE TRANSPARENCE SUR LES TESTS :
En travaillant sur cette phase, j'ai découvert que le client Prisma généré dans mon bac à
sable est tombé en mode `PrismaClient: any` (généré partiellement à cause des mêmes
restrictions réseau que d'habitude). Résultat : mes vérifications `tsc --noEmit` précédentes
sur le code serveur touchant à Prisma n'auraient PAS détecté d'erreurs de type sur les
requêtes Prisma elles-mêmes (champs inexistants, mauvais types, etc.) — seul le reste du code
(routing, Colyseus, logique métier hors Prisma) était vraiment vérifié. Je le signale pour ne
pas surestimer la fiabilité de mes tests passés sur ce point précis. La vraie vérification
reste, comme toujours pour les changements de schéma, le test chez vous après migration.

CE QUI RESTE À FAIRE :
- Vrai système de fragments de doublons (au lieu du remboursement direct en cristaux).
- Bannières de recrutement thématiques / rate-up (actuellement un seul pool global).
- Lien avec les futures idées d'armes/artéfacts et de compagnons (docs/notes-idees-futures.md).
- Vérifier après migration que la contrainte @@unique([userId, characterId]) se comporte bien
  avec Prisma "create" imbriqué en cas de double pull rapide (edge case rare, à surveiller).

TESTS EFFECTUÉS :
- Client : `npx tsc --noEmit` + `npx vite build` → OK, réellement vérifié.
- Serveur : `npx tsc --noEmit` → passe, mais voir le point de transparence ci-dessus sur sa
  fiabilité limitée pour le code Prisma cette fois. Nécessite une migration
  (`npx prisma migrate dev --name add-gacha`) et un vrai test chez vous.
