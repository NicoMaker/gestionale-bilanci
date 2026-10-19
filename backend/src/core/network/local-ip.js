/* Primo indirizzo IPv4 non interno della macchina (rete locale). */
const os = require("os");

function getLocalIP() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || [])
      if (i.family === "IPv4" && !i.internal) return i.address;
  }
  return "127.0.0.1";
}

module.exports = { getLocalIP };
