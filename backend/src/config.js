/* Configurazione centrale: porta, percorsi di frontend e cartella condivisa. */
const path = require("path");

const BACKEND_DIR = path.join(__dirname, "..");
const ROOT = path.join(BACKEND_DIR, "..");

module.exports = {
  PORT: process.env.PORT || 3000,
  BACKEND_DIR,
  ROOT,
  // codice condiviso browser + server (template del bilancio, motore di calcolo)
  SHARED_DIR: path.join(ROOT, "shared"),
  FRONTEND_DIR: path.join(ROOT, "frontend"),
};
