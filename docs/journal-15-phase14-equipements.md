# Journal de tâche — 15

TÂCHE :
Phase 14 — équipements (armes + artéfacts), section 13 du GDD. Répond aussi partiellement à
votre idée notée dans docs/notes-idees-futures.md (système à la Genshin, mais différent).

FICHIERS CRÉÉS / MODIFIÉS :
- /server/prisma/schema.prisma (ajout : equippedWeaponId, equippedArtifactId sur User +
  nouvelle table InventoryItem)
- /server/src/services/equipmentService.ts (nouveau — table de loot pondérée, calcul du slot)
- /server/src/api/equipment.ts (nouveau — GET /api/equipment, POST /api/equipment/equip)
- /server/src/api/expedition.ts (35% de chances de looter un objet en fin d'expédition)
- /server/src/index.ts (montage du routeur équipement)
- /client/src/entities/equipmentTypes.ts (nouveau — 3 armes, 3 artéfacts, calcul des bonus cumulés)
- /client/src/entities/Player.ts (accepte des bonus d'équipement optionnels)
- /client/src/network/api.ts (fetchEquipment, equipItem, itemDropped ajouté à ExpeditionResult)
- /client/src/scenes/EquipmentScreen.ts (nouveau — écran d'équipement)
- /client/src/scenes/BaseScreen.ts (bouton "Équipement")
- /client/src/scenes/ExpeditionScene.ts (affiche l'objet trouvé en fin de run)
- /client/src/main.ts (récupère l'équipement et calcule les bonus avant de lancer l'expédition)

CE QUI A ÉTÉ AJOUTÉ :
- 2 emplacements : arme et artéfact, un seul objet équipé par emplacement pour le MVP.
- 6 objets au total (3 armes, 3 artéfacts), raretés ★★ à ★★★★★, bonus modestes et fixes
  (dégâts, PV max, vitesse, cadence de tir) — pas de sous-stats aléatoires pour l'instant.
- 35% de chances de looter un objet à la fin d'une expédition (un seul exemplaire par objet
  possédé pour le MVP — pas de doublon d'équipement, contrairement aux personnages).
- Le serveur vérifie la possession avant d'autoriser à équiper un objet (jamais de confiance
  aveugle envers le client, section 5 du GDD).
- Les bonus équipés s'appliquent au personnage au moment de lancer une expédition.

CE QUI RESTE À FAIRE (déjà noté dans docs/notes-idees-futures.md pour la suite) :
- Sous-statistiques aléatoires façon Genshin, sets d'artéfacts avec bonus de set.
- Système de fragments/doublons pour les objets déjà possédés (actuellement : rien).
- Une vraie "Forge" (bâtiment de la base, section 6) pour fabriquer/améliorer des équipements
  plutôt que du pur loot aléatoire.
- Visuels des objets (actuellement juste des cartes colorées).

TESTS EFFECTUÉS :
- Client : `npx tsc --noEmit` + `npx vite build` → OK, réellement vérifié.
- Serveur : `npx tsc --noEmit` → passe (même réserve que journal-14 sur la fiabilité du
  typage Prisma dans ce bac à sable spécifiquement).
- Nécessite une migration : `npx prisma migrate dev --name add-equipment`.
