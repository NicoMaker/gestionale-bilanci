/* Crea l'app Express: API, file condivisi e frontend statico. */
const path = require("path");
const express = require("express");
const { SHARED_DIR, FRONTEND_DIR, ROOT } = require("./config");
const api = require("./modules");

function createApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", api);

  // Guida del programma: il PDF sta nella radice del progetto (fuori da
  // frontend/), quindi lo servo con una route dedicata. Va PRIMA dei file
  // statici e del catch-all, che altrimenti risponderebbe con index.html.
  const guidaPdf = path.join(ROOT, "manuale-utente-gestionale.pdf");
  app.get("/manuale-utente-gestionale.pdf", (req, res, next) => {
    res.sendFile(
      guidaPdf,
      {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition":
            'inline; filename="manuale-utente-gestionale.pdf"',
        },
      },
      (err) => err && next(err),
    );
  });

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
