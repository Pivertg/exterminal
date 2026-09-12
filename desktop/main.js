const { app, BrowserWindow, ipcMain, session } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

// En développement : charge le serveur Vite (npm run dev côté client) pour garder le hot-reload.
// En production (app empaquetée) : charge directement les fichiers buildés du client.
const isDev = process.env.ELECTRON_DEV === "1";

let mainWindow;
let launcherReady = false; // le launcher a fini SES vérifications (serveur/version côté jeu)
let updateChecked = false; // l'auto-updater a fini de vérifier (avec ou sans mise à jour)

function sendUpdateStatus(status, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-status", { status, ...data });
  }
}

function maybeProceedToGame() {
  // On attend les DEUX signaux avant de charger le jeu : que le launcher ait fini ses propres
  // vérifications (voir launcher.html) ET que l'auto-updater ait fini de vérifier/télécharger.
  // Si une mise à jour est en cours de téléchargement, on attend qu'elle soit prête ou ratée
  // avant de continuer, pour ne pas lancer une session qui sera interrompue par un restart.
  if (launcherReady && updateChecked) {
    loadGame();
  }
}

function setupAutoUpdater() {
  if (isDev) {
    // Pas d'auto-update en développement (pas d'app empaquetée à mettre à jour) — on
    // considère la vérification comme "faite" immédiatement pour ne pas bloquer le dev.
    updateChecked = true;
    return;
  }

  autoUpdater.on("checking-for-update", () => {
    sendUpdateStatus("checking");
  });
  autoUpdater.on("update-not-available", () => {
    updateChecked = true;
    sendUpdateStatus("up-to-date");
    maybeProceedToGame();
  });
  autoUpdater.on("update-available", (info) => {
    sendUpdateStatus("downloading", { version: info.version, percent: 0 });
  });
  autoUpdater.on("download-progress", (progress) => {
    sendUpdateStatus("downloading", { percent: Math.round(progress.percent) });
  });
  autoUpdater.on("update-downloaded", () => {
    sendUpdateStatus("ready-to-install");
    // Redémarre l'app avec la nouvelle version installée. Les joueurs de test n'ont rien à
    // faire manuellement — l'app se relance simplement à jour.
    setTimeout(() => autoUpdater.quitAndInstall(), 1500);
  });
  autoUpdater.on("error", (err) => {
    // Une erreur de mise à jour (ex: serveur d'updates injoignable) ne doit pas empêcher de
    // jouer avec la version actuelle — on continue simplement sans mise à jour.
    updateChecked = true;
    sendUpdateStatus("update-error", { message: err.message });
    maybeProceedToGame();
  });

  try {
    autoUpdater.checkForUpdates();
  } catch (err) {
    // electron-updater peut se comporter de façon imprévisible hors d'une vraie app empaquetée
    // (voir sa documentation officielle) — on ne bloque jamais le jeu à cause de ça.
    updateChecked = true;
    sendUpdateStatus("update-error", { message: err.message });
    maybeProceedToGame();
  }

  // Filet de sécurité : si l'auto-updater ne déclenche jamais aucun événement (observé en
  // environnement non empaqueté/sans réseau), on ne bloque pas le jeu indéfiniment.
  setTimeout(() => {
    if (!updateChecked) {
      updateChecked = true;
      sendUpdateStatus("update-error", { message: "Délai de vérification dépassé" });
      maybeProceedToGame();
    }
  }, 8000);
}

function loadGame() {
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../client/dist/index.html"));
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Votre Jeu",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false, // sécurité : le contenu web n'a jamais un accès direct à Node.js
    },
  });

  // Le launcher (écran de chargement) s'affiche en premier ; il vérifie la connexion au
  // serveur et la version du JEU, en parallèle de la vérification de mise à jour de l'APP
  // elle-même (voir setupAutoUpdater) — les deux doivent être prêts avant de charger le jeu.
  mainWindow.loadFile(path.join(__dirname, "launcher.html"));
  setupAutoUpdater();
}

ipcMain.on("launcher-ready", () => {
  launcherReady = true;
  maybeProceedToGame();
});

app.whenReady().then(() => {
  // Contourne la page d'avertissement du plan gratuit ngrok (utilisé pour exposer le serveur
  // pendant les tests entre amis, avant un vrai déploiement — voir docs/DEPLOYMENT.md). Sans
  // ça, ngrok intercepterait TOUTES les requêtes (API + WebSocket) avec sa page HTML
  // d'avertissement au lieu des vraies réponses du serveur. Sans effet une fois sur un vrai
  // serveur déployé (l'en-tête est juste ignoré).
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["ngrok-skip-browser-warning"] = "true";
    callback({ requestHeaders: details.requestHeaders });
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
