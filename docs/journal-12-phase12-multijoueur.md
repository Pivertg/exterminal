# Journal de tâche — 12

TÂCHE :
Phase 12 — multijoueur, prototype à 2 joueurs (décision prise dans journal-05 : Colyseus,
architecture serveur autoritaire à terme).

FICHIERS CRÉÉS / MODIFIÉS :
- /server/src/rooms/GameRoomState.ts (nouveau — schéma d'état partagé : position + perso par joueur)
- /server/src/rooms/GameRoom.ts (nouveau — room à 2 joueurs max, auth par JWT existant)
- /server/src/index.ts (serveur HTTP partagé entre l'API Express et Colyseus)
- /client/src/network/multiplayer.ts (nouveau — connexion à la room)
- /client/src/scenes/MultiplayerLobbyScreen.ts (nouveau — écran "Solo" vs "Partie à 2 joueurs")
- /client/src/scenes/ExpeditionScene.ts (room optionnelle : sync de position + affichage des
  autres joueurs sous forme de cercles fantômes)
- /client/src/main.ts (lobby inséré entre le choix du personnage et l'expédition)

PROBLÈME RENCONTRÉ ET RÉSOLU EN COURS DE ROUTE :
Colyseus a deux "générations" d'API incompatibles entre elles :
- Colyseus 0.18 (dernière version) : API très différente (orientée framework complet avec
  base de données/auth intégrées), bien trop lourde pour nos besoins.
- Colyseus 0.16 : plus proche de ce qu'on veut, mais tire une quantité de dépendances énorme
  (Redis, uWebSockets, PM2, auth/session) — a échoué à s'installer proprement dans mon
  bac à sable et va totalement à l'encontre du principe "architecture simple" du GDD pour
  un prototype à 2 joueurs.
- Colyseus 0.15.57 (retenu) : API classique et légère (`new Server({ server: httpServer })`,
  `Room.setState()`, décorateurs `@type` de `@colyseus/schema`), sans dépendances superflues.
Piège additionnel : la version du client (`colyseus.js`) doit utiliser la MÊME version majeure
de `@colyseus/schema` que le serveur, sinon la synchronisation échoue silencieusement avec des
erreurs "definition mismatch". Versions retenues et validées ensemble :
- Serveur : colyseus@0.15.57 + @colyseus/schema@2.0.35
- Client : colyseus.js@0.15.28 (même branche @colyseus/schema@^2.0.4)

CE QUI A ÉTÉ AJOUTÉ :
- Room "game_room", 2 joueurs maximum (conforme à la section 4 du GDD : commencer petit).
- Authentification de la room par le même JWT que le reste du jeu (pas de compte "invité").
- Écran de lobby : "Solo" (comportement inchangé) ou "Partie à 2 joueurs" (matchmaking simple
  via joinOrCreate — pas de code de partie à saisir pour l'instant).
- Position du joueur envoyée au serveur ~10 fois/seconde ; les autres joueurs connectés
  s'affichent comme des cercles jaunes semi-transparents dans l'expédition.

LIMITE IMPORTANTE ET VOLONTAIRE (documentée aussi dans GameRoom.ts) :
Seule la POSITION des joueurs est synchronisée. Les ennemis, le boss, les collisions et les
récompenses restent simulés localement par chaque client, comme en solo. Ce n'est donc PAS
encore une architecture serveur autoritaire pour le combat lui-même — uniquement pour la
présence des joueurs. C'est un choix assumé pour avancer par petites étapes (section 22 du
GDD) : la prochaine itération multijoueur devra synchroniser les ennemis/le boss et valider
les dégâts côté serveur avant que ce mode soit utilisable pour de vraies récompenses en groupe.

TESTS EFFECTUÉS :
- `npx tsc --noEmit` + `npx vite build` (client) et `npx tsc --noEmit` (serveur) : OK.
- Test réseau réel (pas seulement compilation) : deux clients Colyseus connectés à la même
  room, envoi d'un message "move" par le client 1, vérifié que le client 2 voit bien la
  position mise à jour dans son state. Confirme que la synchronisation fonctionne de bout
  en bout, pas seulement que le code compile.
- Non testé : le flux complet dans le vrai jeu (lobby → expédition à 2 fenêtres de navigateur
  en parallèle) — à faire chez vous, avec deux comptes différents dans deux onglets/navigateurs.

CE QUI RESTE À FAIRE :
- Synchroniser les ennemis/le boss (actuellement chacun voit sa propre simulation locale —
  déconseillé de jouer à 2 en pensant voir les mêmes ennemis, ce n'est pas encore le cas).
- Un vrai lobby avec code de partie à partager entre amis (section 4 : "invitation d'amis"),
  au lieu du matchmaking automatique actuel.
- Gérer la reconnexion si un joueur perd la connexion en cours de partie.
- Rate limiting / validation de la position côté serveur (mentionné dans la revue
  d'architecture de ChatGPT) — pas fait ici, la position envoyée par le client est acceptée
  telle quelle pour l'instant.
