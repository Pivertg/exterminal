# Journal de tâche — 02

TÂCHE :
Phase 5 — relier le client au système de compte : écran de connexion/inscription, stockage du token, démarrage du jeu uniquement une fois authentifié.

FICHIERS MODIFIÉS / CRÉÉS :
- /client/src/network/api.ts (nouveau)
- /client/src/scenes/AuthScreen.ts (nouveau)
- /client/src/main.ts (modifié)

CE QUI A ÉTÉ AJOUTÉ :
- Fonctions API côté client : register(), login(), fetchMe().
- Écran de connexion/inscription en overlay HTML, avec bascule entre les deux modes et affichage des erreurs serveur (ex : "Identifiants incorrects").
- Le token JWT est stocké dans localStorage pour éviter de se reconnecter à chaque rechargement de page.
- Au démarrage : si un token existe et est valide (vérifié via /api/auth/me), le jeu démarre directement. Sinon, écran de connexion.
- Petit HUD affichant le pseudo et le niveau de compte connecté (placeholder, sera remplacé par un vrai HUD plus tard).

CE QUI RESTE À FAIRE :
- Bouton de déconnexion.
- Gérer l'expiration du token pendant une partie en cours (actuellement seulement vérifié au démarrage).
- Remplacer localStorage par quelque chose de plus robuste si on ajoute un jour du refresh token.
- Écran de chargement/transition plus soigné entre auth et jeu.

PROBLÈMES CONNUS :
- Aucun. Testé par compilation TS + build Vite. Le flux complet (inscription → jeu, token invalide → réaffiche l'écran de connexion) n'a pas pu être testé en conditions réelles depuis cet environnement (pas de navigateur), à confirmer côté utilisateur.

TESTS EFFECTUÉS :
- `npx tsc --noEmit` : aucune erreur.
- `npx vite build` : build réussi.
