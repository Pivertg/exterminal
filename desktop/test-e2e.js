const { BrowserWindow } = require("electron");
const originalLoadFile = BrowserWindow.prototype.loadFile;
BrowserWindow.prototype.loadFile = function (filePath, ...args) {
  console.log("NAVIGATION VERS:", filePath);
  return originalLoadFile.call(this, filePath, ...args);
};
require("electron").app.disableHardwareAcceleration();
require("./main.js");
setTimeout(() => { console.log("FIN TEST E2E"); process.exit(0); }, 10000);
