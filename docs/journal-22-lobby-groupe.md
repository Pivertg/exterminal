# Journal de tâche — 22

TÂCHE :
Salon de groupe multijoueur (chat + choix du personnage et d'un compagnon avant de lancer
l'expédition), inspiré d'une publicité mentionnée où chaque joueur choisit son rôle et son
compagnon avant le départ. Implémente aussi les compagnons, notés comme idée future dans
docs/notes-idees-futures.md.

FICHIERS CRÉÉS / MODIFIÉS :
- /client/src/entities/companionTypes.ts (nouveau — 4 compagnons avec bonus passifs, tous
  débloqués par défaut pour l'instant, pas de gacha compagnon)
- /server/src/rooms/GameRoomState.ts (ajout de companionId, ready, expeditionStarted au state)
- /server/src/rooms/GameRoom.ts (messages chat, select-character, select-companion,
  toggle-ready ; démarrage synchronisé de l'expédition une fois tous les joueurs prêts)
- /client/src/scenes/PartyLobbyScreen.ts (nouveau — chat, sélection perso/compagnon, statut prêt)
- /client/src/scenes/MultiplayerLobbyScreen.ts (bascule sur le salon de groupe après connexion
  au lieu de démarrer l'expédition immédiatement)
- /client/src/main.ts (récupère le personnage/compagnon finalement choisis dans le salon,
  cumule le bonus du compagnon avec celui de l'équipement)

CE QUI A ÉTÉ AJOUTÉ :
- Chat textuel simple dans le lobby multijoueur (relayé par le serveur, pas de stockage ni de
  modération pour le MVP — limite de 200 caractères par message).
- Chaque joueur peut changer de personnage (parmi ceux qu'il possède réellement — revérifié
  côté client via /api/gacha, pas de confiance aveugle envers un choix arbitraire) et choisir
  un compagnon parmi 4 (dont "aucun").
- Un bouton "Prêt" par joueur ; l'expédition démarre automatiquement pour tout le monde dès
  que les 2 joueurs sont prêts (signal "expedition-start" diffusé par le serveur).
- Le bonus du compagnon s'additionne à celui de l'équipement (arme + artéfact) au moment de
  lancer l'expédition.
- En solo, ce salon est entièrement sauté (comportement inchangé) — il n'apparaît qu'en
  multijoueur, cohérent avec la demande initiale.

CE QUI RESTE À FAIRE :
- Les compagnons sont pour l'instant tous gratuits/débloqués — pas de vrai système
  d'obtention (pourrait rejoindre le recrutement, Phase 13, plus tard).
- Pas de validation serveur que le compagnon choisi est "légitime" (contrairement aux
  personnages, vérifiés via la possession réelle) — acceptable tant qu'aucun compagnon n'est
  payant ou à débloquer.
- Le chat n'a aucune modération (pas de filtre de mots, pas de limite de fréquence d'envoi
  au-delà de la limite de caractères) — à revoir avant une ouverture publique.
- Toujours la même limite déjà documentée dans journal-12 : les ennemis/le boss restent
  simulés localement par chaque client pendant l'expédition elle-même, seule la position est
  synchronisée.

TESTS EFFECTUÉS :
- `npx tsc --noEmit` (client + serveur) : OK.
- Non testé en conditions réelles à 2 fenêtres/navigateurs différents dans cet environnement
  (nécessite une vraie session multijoueur complète, pas juste des messages isolés comme pour
  les tests précédents de la Phase 12) — à valider chez vous.
