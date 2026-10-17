/* Indirizzi di rete mostrati nel banner di avvio. */
const os = require("os");
const https = require("https");

/* Primo indirizzo IPv4 non interno della macchina (rete locale). */
function getLocalIP() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || [])
      if (i.family === "IPv4" && !i.internal) return i.address;
  }
  return "127.0.0.1";
}

/* IP pubblico tramite ipify, con timeout: se sei offline il server parte comunque. */
function getPublicIP(timeoutMs = 3000) {
  return new Promise((resolve) => {
    const req = https.get(
      "https://api.ipify.org",
      { timeout: timeoutMs },
      (res) => {
        let txt = "";
        res.on("data", (c) => (txt += c));
        res.on("end", () =>
          resolve(/^[\d.:a-f]+$/i.test(txt.trim()) ? txt.trim() : null),
        );
      },
    );
    req.on("timeout", () => req.destroy());
    req.on("error", () => resolve(null));
  });
}

module.exports = { getLocalIP, getPublicIP };
