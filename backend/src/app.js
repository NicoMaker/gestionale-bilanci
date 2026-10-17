/* Crea l'app Express: API, file condivisi e frontend statico. */
const path = require("path");
const express = require("express");
const { SHARED_DIR, FRONTEND_DIR } = require("./config");
const api = require("./modules");

function createApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", api);
  app.use("/shared", express.static(SHARED_DIR));
  // i browser chiedono /favicon.ico alla radice
  app.get("/favicon.ico", (req, res) =>
    res.sendFile(path.join(FRONTEND_DIR, "assets", "icons", "favicon.ico")),
  );
  app.use(express.static(FRONTEND_DIR));
  app.get("*", (req, res) =>
    res.sendFile(path.join(FRONTEND_DIR, "index.html")),
  );
  return app;
}

module.exports = { createApp };
