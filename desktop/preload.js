// Pont sécurisé entre Electron et le contenu web (contextIsolation activé, voir main.js).
// launcherReady() : signal envoyé par launcher.html une fois ses vérifications terminées,
// pour demander au processus principal de basculer sur le vrai jeu.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopBridge", {
  launcherReady: () => ipcRenderer.send("launcher-ready"),
  onUpdateStatus: (callback) => ipcRenderer.on("update-status", (_event, data) => callback(data)),
});
