/* Avvio del server: database, app Express, banner con gli indirizzi, chiusura pulita. */
const db = require("./src/core/db");
const { PORT } = require("./src/config");
const { createApp } = require("./src/app");
const cestino = require("./src/modules/cestino/service");
const { getLocalIP, getPublicIP } = require("./src/core/network");

/* banner = true solo all'avvio da riga di comando (nei test non si interroga la rete). */
async function start({ banner = false } = {}) {
  await db.init();
  const app = createApp();

  // cestino: gli elementi eliminati da più di 15 giorni si cancellano all'avvio e poi ogni ora
  const pulisciCestino = () => {
    try {
      const n = cestino.eliminaScaduti();
      if (n)
        console.log(
          `🗑️ Cestino: eliminati definitivamente ${n} elementi scaduti`,
        );
    } catch (e) {
      console.error("Pulizia cestino:", e.message);
    }
  };
  pulisciCestino();
  setInterval(pulisciCestino, 60 * 60 * 1000).unref();

  const server = app.listen(PORT, "0.0.0.0", async () => {
    if (!banner) {
      console.log(
        `\n📊 Gestionale Bilanci avviato → http://localhost:${PORT}\n`,
      );
      return;
    }
    const publicIP = await getPublicIP();
    const localIP = getLocalIP();
    console.log(`\n🚀 Server avviato con successo!`);
    console.log(
      `🌐 IP Pubblico: ${publicIP ? `http://${publicIP}:${PORT}` : "non disponibile (nessuna connessione a internet?)"}`,
    );
    console.log(`🏠 IP Locale:   http://${localIP}:${PORT}`);
    console.log(`📍 Localhost:   http://localhost:${PORT}`);
    console.log(`\n--------------------------------------`);
  });

  const chiudi = () => {
    try {
      db.flush();
    } catch (e) {
      /* ignore */
    }
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 1500);
  };
  process.on("SIGINT", chiudi);
  process.on("SIGTERM", chiudi);
  return { app, server };
}

if (require.main === module)
  start({ banner: true }).catch((e) => {
    console.error(e);
    process.exit(1);
  });
module.exports = { start };
