/* IP pubblico tramite ipify, con timeout: se sei offline il server parte comunque. */
const https = require("https");

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

module.exports = { getPublicIP };
