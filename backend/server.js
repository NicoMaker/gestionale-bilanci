const os = require("os");
const path = require("path");
const https = require("https");
const express = require("express");
const db = require("./src/db");
const routes = require("./src/routes");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "..");

/* Primo indirizzo IPv4 non interno della macchina (rete locale). */
function getLocalIP() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === "IPv4" && !i.internal) return i.address;
  }
  return "127.0.0.1";
}

/* IP pubblico tramite ipify, con timeout: se sei offline il server parte comunque. */
function getPublicIP(timeoutMs = 3000) {
  return new Promise((resolve) => {
    const req = https.get("https://api.ipify.org", { timeout: timeoutMs }, (res) => {
      let txt = "";
      res.on("data", (c) => (txt += c));
      res.on("end", () => resolve(/^[\d.:a-f]+$/i.test(txt.trim()) ? txt.trim() : null));
    });
    req.on("timeout", () => req.destroy());
    req.on("error", () => resolve(null));
  });
}

/* banner = true solo all'avvio da riga di comando (nei test non si interroga la rete). */
async function start({ banner = false } = {}) {
  await db.init();
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", routes);
  app.use("/shared", express.static(path.join(ROOT, "shared")));
  app.use(express.static(path.join(ROOT, "frontend")));
  app.get("*", (req, res) => res.sendFile(path.join(ROOT, "frontend", "index.html")));

  const server = app.listen(PORT, "0.0.0.0", async () => {
    if (!banner) { console.log(`\n📊 Gestionale Bilanci avviato → http://localhost:${PORT}\n`); return; }
    const publicIP = await getPublicIP();
    const localIP = getLocalIP();
    console.log(`\n🚀 Server avviato con successo!`);
    console.log(`🌐 IP Pubblico: ${publicIP ? `http://${publicIP}:${PORT}` : "non disponibile (nessuna connessione a internet?)"}`);
    console.log(`🏠 IP Locale:   http://${localIP}:${PORT}`);
    console.log(`📍 Localhost:   http://localhost:${PORT}`);
    console.log(`\n--------------------------------------`);
  });

  const chiudi = () => { try { db.flush(); } catch (e) { /* ignore */ } server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 1500); };
  process.on("SIGINT", chiudi);
  process.on("SIGTERM", chiudi);
  return { app, server };
}

if (require.main === module) start({ banner: true }).catch((e) => { console.error(e); process.exit(1); });
module.exports = { start };
