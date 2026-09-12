# Dossier de mise à jour de l'app desktop

Ce dossier est servi statiquement par le serveur sur `/updates` — c'est ici qu'electron-updater
va chercher les nouvelles versions de l'app desktop.

## Comment publier une nouvelle version

1. Augmentez le numéro de version dans `/desktop/package.json` (ex: "0.0.1" → "0.0.2").
2. Depuis `/desktop`, lancez la build d'installateur pour votre OS :
   ```
   npm run dist:win
   ```
3. Copiez TOUT le contenu de `/desktop/release` dans ce dossier (`/server/updates`).
   Le fichier important est `latest.yml` (ou `latest-mac.yml` / `latest-linux.yml`) —
   c'est lui qu'electron-updater consulte pour savoir si une mise à jour existe.
4. Redémarrez le serveur (ou rien à faire s'il tourne déjà et sert bien ce dossier).
5. Les joueurs qui relancent leur app desktop détecteront automatiquement la mise à jour,
   la téléchargeront, et l'installeront au redémarrage suivant de l'app.

## Note pour les tests entre amis

Tant que le serveur tourne sur votre machine (localhost) et que vos amis testent depuis leur
propre machine, `/updates` ne sera pas accessible pour eux — il faudra que le serveur soit
déployé quelque part de joignable (voir docs/DEPLOYMENT.md, Phase 19) pour que l'auto-update
fonctionne vraiment entre plusieurs machines différentes. En attendant un vrai déploiement,
vous pouvez toujours leur envoyer le nouvel installateur manuellement.
