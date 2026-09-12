# Journal de tâche — 23

TÂCHE :
Auto-updater pour l'app desktop : le launcher télécharge et installe automatiquement les
nouvelles versions déjà compilées (demandé pour faciliter les tests entre amis, qui se
connecteront tous à votre serveur).

FICHIERS CRÉÉS / MODIFIÉS :
- /server/src/index.ts (sert le dossier /server/updates en statique sur /updates)
- /server/updates/README.md (nouveau — comment publier une nouvelle version)
- /desktop/package.json (dépendance electron-updater, config "publish" en mode "generic"
  pointant vers votre serveur)
- /desktop/main.js (intégration complète d'electron-updater : vérifie, télécharge, installe
  et redémarre automatiquement l'app quand une mise à jour est prête)
- /desktop/preload.js (expose les événements de progression de la mise à jour au launcher)
- /desktop/launcher.html (affiche la progression du téléchargement de la mise à jour)

CE QUI A ÉTÉ FAIT :
- Le serveur héberge maintenant les fichiers de mise à jour sur /updates (dossier
  /server/updates, avec un README expliquant comment y déposer une nouvelle version après un
  npm run dist:win).
- Au lancement, l'app vérifie en parallèle : (1) que le serveur de jeu répond (launcher.html,
  déjà en place), et (2) qu'une nouvelle version de l'APP elle-même n'est pas disponible
  (electron-updater, nouveau). Le jeu ne se lance qu'une fois les deux vérifications passées.
- Si une mise à jour de l'app est trouvée : téléchargement avec barre de progression affichée,
  puis installation et redémarrage automatiques — aucune action manuelle pour vos amis testeurs.
- Filet de sécurité ajouté : si l'auto-updater ne répond jamais dans les 8 secondes (observé
  en test, voir ci-dessous), le jeu se lance quand même avec la version actuelle plutôt que de
  rester bloqué indéfiniment.

LIMITE DÉCOUVERTE EN TESTANT (documentée officiellement par electron-updater, pas un bug de
notre code) :
electron-updater ne se comporte de façon fiable QUE dans une vraie app empaquetée
(electron-builder avec un vrai installateur). En mode développement non empaqueté (ce que je
peux tester dans mon bac à sable), il peut rester silencieux sans émettre d'événement ni
d'erreur claire — d'où le filet de sécurité ajouté. La vraie vérification de l'auto-update
(détection + téléchargement + installation d'une nouvelle version) ne pourra se faire que
chez vous, avec deux vraies versions empaquetées (npm run dist:win avec deux numéros de
version différents dans package.json).

TESTS RÉELLEMENT EFFECTUÉS (et une fausse alerte corrigée en cours de route) :
- Testé le launcher SANS serveur actif : reste bloqué (déjà validé précédemment).
- Première tentative avec serveur actif : semblait ne rien faire — j'ai cru à un bug.
  En creusant avec des logs de debug temporaires, j'ai découvert que mon serveur de TEST
  s'était simplement arrêté entre deux commandes (timeout expiré), pas un problème de code.
  Une fois le test refait avec le serveur et Electron lancés dans le même bloc de commande :
  confirmé que "launcher-ready" est bien reçu côté processus principal.
- Test de bout en bout final : intercepté les appels loadFile() du vrai main.js (sans
  modification) pour confirmer la navigation réelle launcher.html -> client/dist/index.html
  une fois toutes les vérifications passées. Les deux navigations sont bien observées dans
  l'ordre attendu.
- npx tsc --noEmit (client + serveur) après nettoyage de tous les fichiers de test : OK.

CE QUI RESTE À FAIRE :
- Publier une vraie première version dans /server/updates pour tester un vrai cycle de mise
  à jour de bout en bout (nécessite de packager deux versions différentes chez vous).
- Le SERVER_URL du launcher et l'URL de "publish" dans package.json sont câblés en dur sur
  localhost — à adapter avant de distribuer une build à vos amis (pointer vers un serveur
  qu'ils peuvent réellement joindre, donc déployé — voir docs/DEPLOYMENT.md).
- Actuellement, l'auto-update ne fonctionne que pour Windows/Mac/Linux séparément selon la
  plateforme de build — vérifier que le bon fichier .yml (latest.yml / latest-mac.yml /
  latest-linux.yml) est bien présent dans /server/updates pour chaque OS de vos testeurs.
