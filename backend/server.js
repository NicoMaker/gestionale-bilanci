const path = require("path");
const express = require("express");
const db = require("./src/db");
const routes = require("./src/routes");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "..");

async function start() {
  await db.init();
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", routes);
  app.use("/shared", express.static(path.join(ROOT, "shared")));
  app.use(express.static(path.join(ROOT, "frontend")));
  app.get("*", (req, res) => res.sendFile(path.join(ROOT, "frontend", "index.html")));

  const server = app.listen(PORT, () => {
    console.log(`\n📊 Gestionale Bilanci avviato → http://localhost:${PORT}\n`);
  });

  const chiudi = () => { try { db.flush(); } catch (e) { /* ignore */ } server.close(() => process.exit(0)); setTimeout(() => process.exit(0), 1500); };
  process.on("SIGINT", chiudi);
  process.on("SIGTERM", chiudi);
  return { app, server };
}

if (require.main === module) start().catch((e) => { console.error(e); process.exit(1); });
module.exports = { start };
