# Journal de tâche — 20

TÂCHE :
Mise en place d'une version desktop (Windows/Mac/Linux) du jeu via Electron, suite à la
question sur la différence entre jeu web et "vrai jeu".

FICHIERS CRÉÉS / MODIFIÉS :
- /desktop/package.json (nouveau — dépendances electron + electron-builder, scripts de build)
- /desktop/main.js (nouveau — fenêtre Electron, charge le client buildé ou le serveur Vite en dev)
- /desktop/preload.js (nouveau — vide pour l'instant, contextIsolation activé par sécurité)
- /client/vite.config.ts (nouveau — base: "./" pour des chemins relatifs, indispensable pour
  qu'Electron puisse charger les fichiers via file://)

POURQUOI ELECTRON (rappel du choix) :
Emballe le client web existant tel quel dans une vraie fenêtre desktop, sans réécrire le
jeu. Alternative (Tauri) plus légère mais demande d'installer Rust — écarté pour rester
simple, cohérent avec la section 26 du GDD.

PIÈGE TECHNIQUE RENCONTRÉ ET CORRIGÉ :
Vite génère par défaut des chemins d'assets absolus (`/assets/...`), qui ne fonctionnent PAS
avec le protocole `file://` qu'utilise Electron pour charger l'app en production (seulement
en développement, où on charge http://localhost:5173, le problème ne se voit pas). Corrigé en
ajoutant `base: "./"` dans la config Vite — chemins relatifs, compatibles à la fois avec
Electron ET avec un hébergement web classique (Vercel/Netlify), donc aucun risque de casser
le déploiement web existant.

LIMITE IMPORTANTE À COMPRENDRE :
Electron n'emballe QUE le client. Le serveur (comptes, expéditions, multijoueur) reste un vrai
serveur à part, qui doit tourner quelque part et être joignable par l'app desktop — soit en
local (`localhost:3000`, pratique pour développer/tester seul), soit déployé publiquement
(Phase 19, docs/DEPLOYMENT.md) si vous voulez distribuer l'app à d'autres personnes. Avant de
construire une vraie version à distribuer, il faut builder le client avec `VITE_API_URL` et
`VITE_WS_URL` pointant vers ce serveur public (voir `.env.production.example` côté client).

COMMENT L'UTILISER :

En développement (avec hot-reload, pratique pendant qu'on continue à coder le jeu) :
```
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev

# Terminal 3
cd desktop && npm install
$env:ELECTRON_DEV="1"   # PowerShell — active le chargement depuis localhost:5173
npm start
```

Pour une vraie build desktop (fenêtre autonome, sans serveur Vite) :
```
cd client && npm run build      # génère client/dist
cd ../desktop && npm install
npm start                        # sans ELECTRON_DEV, charge directement dist/index.html
```

Pour un vrai exécutable installable (.exe, .dmg, .AppImage) :
```
cd desktop
npm run dist:win     # ou dist:mac / dist:linux, selon l'OS sur lequel vous lancez la commande
```
Le résultat apparaît dans `/desktop/release`.

TESTS EFFECTUÉS (réellement, pas juste de la compilation) :
- `npx electron --version --no-sandbox` : le binaire Electron s'exécute correctement dans mon
  bac à sable (l'erreur initiale sans `--no-sandbox` est une limite connue des environnements
  root/CI, pas un problème réel — ne se produira pas chez vous).
- Test de chargement réel de la page via un serveur d'affichage virtuel (Xvfb, puisque mon
  bac à sable n'a pas d'écran) : la fenêtre Electron charge bien `client/dist/index.html` en
  `file://` sans erreur (`did-finish-load` déclenché avec succès), confirmant que le correctif
  `base: "./"` fonctionne. Seul message : un avertissement standard d'Electron sur la CSP,
  qui disparaît une fois l'app empaquetée avec `electron-builder` — rien à corriger.
- Non testé ici : l'empaquetage final en .exe/.dmg/.AppImage (electron-builder a besoin de
  composants spécifiques à chaque OS cible, à faire directement chez vous ou via une CI).

CE QUI RESTE À FAIRE :
- Icône de l'application (actuellement l'icône par défaut d'Electron).
- Auto-update de l'app desktop (electron-builder le permet, non configuré pour l'instant).
- Décider si le jeu doit fonctionner hors-ligne en solo (nécessiterait une sauvegarde locale
  et un mode sans serveur — actuellement, même en solo, le client parle toujours au serveur).
