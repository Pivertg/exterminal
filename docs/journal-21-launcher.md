# Journal de tâche — 21

TÂCHE :
Ajout d'un launcher (écran de lancement) à l'app desktop — un écran qui vérifie que tout est
prêt (connexion serveur, version) avant de basculer sur le vrai jeu, façon Genshin Impact.

FICHIERS CRÉÉS / MODIFIÉS :
- /server/src/api/version.ts (nouveau — route publique GET /api/version)
- /server/src/index.ts (montage de la route version)
- /desktop/launcher.html (nouveau — écran de chargement avec barre de progression)
- /desktop/preload.js (expose window.desktopBridge.launcherReady())
- /desktop/main.js (charge le launcher en premier, bascule sur le jeu une fois prêt)
- /desktop/package.json (launcher.html inclus dans le build empaqueté)

CE QUI A ÉTÉ FAIT :
- Au démarrage de l'app desktop, un écran de launcher s'affiche : vérifie la connexion au
  serveur (/health), compare la version locale à celle du serveur (/api/version), affiche une
  barre de progression, puis charge le vrai jeu.
- Si le serveur est injoignable, le launcher affiche une erreur claire avec un bouton
  "Réessayer" — il ne bascule pas sur un jeu cassé.
- Si une différence de version est détectée, un message informatif s'affiche (pas encore de
  téléchargement automatique de mise à jour — voir limites ci-dessous).

CE QUI N'EST VOLONTAIREMENT PAS FAIT (pour rester simple, section 26 du GDD) :
Un vrai launcher façon Genshin télécharge et vérifie de vrais fichiers de jeu (assets, patches
binaires), avec reprise de téléchargement, etc. — un système bien plus lourd. Ici, le jeu est
un client web léger (quelques centaines de Ko de JS), donc il n'y a pas de gros fichiers à
télécharger séparément : la "mise à jour" consiste en fait à re-builder et redistribuer l'app
desktop. Le launcher actuel vérifie que le SERVEUR est à jour et joignable, ce qui est la
vraie dépendance externe critique pour ce jeu (contrairement à un jeu offline avec des Go
d'assets locaux). Si un jour de gros assets (images, sons) sont ajoutés en téléchargement
séparé, un vrai système de téléchargement/vérification de fichiers devra être ajouté.

TESTS EFFECTUÉS (réellement exécutés, pas de simple lecture de code) :
- Testé le launcher SANS serveur disponible : reste bloqué sur l'écran d'erreur, ne signale
  jamais "prêt" (vérifié via un timeout de sécurité) — confirme qu'il ne laisse pas passer
  vers un jeu qui ne pourrait pas fonctionner.
- Testé le launcher AVEC un serveur réellement lancé (mini-serveur de test avec les vraies
  routes /health et /api/version, le reste de l'API étant bloqué par la limite Prisma
  habituelle de ce bac à sable) : le launcher se connecte, vérifie la version, et signale
  correctement "prêt" — confirmé par un vrai événement IPC reçu côté processus principal.
- `npx tsc --noEmit` côté client et serveur : OK après nettoyage des fichiers de test.

CE QUI RESTE À FAIRE :
- Un vrai design du launcher (actuellement fonctionnel mais simple — dégradé + barre de
  progression, cohérent avec la palette du moodboard-da.md).
- Décider quoi faire concrètement si une mise à jour est détectée (pour l'instant : juste
  informatif, le joueur continue avec son ancienne version).
- Le SERVER_URL du launcher est actuellement câblé en dur sur localhost — à externaliser dans
  un fichier de config avant de distribuer une vraie build (même remarque déjà notée dans
  journal-20 concernant le client).
