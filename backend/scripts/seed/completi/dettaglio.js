/* Spezza una voce del profilo (es. «costi commerciali») in più righe di bilancio con codice, descrizione e tipo. */
const { r2 } = require("./random");

const SEZIONI = {
  ricavi: ["C_RICAVI", "RIC", "ce"],
  acquisti: ["C_ACQUISTI", "ACQ", "ce"],
  produttivi: ["C_PRODUTTIVI", "PRO", "ce"],
  personale: ["C_PERSONALE", "PER", "ce"],
  commerciali: ["C_COMMERCIALI", "COM", "ce"],
  amministrativi: ["C_AMMINISTRATIVI", "AMM", "ce"],
  immMat: ["A_IMM_MAT", "IMM", "sp"],
};

// det: { campo: [[descrizione, quota, tipo?]] } → righe extra; il campo originale viene tolto dal profilo
function applicaDettaglio({ ce, sp }, det = {}) {
  const righe = [];
  for (const [campo, parti] of Object.entries(det)) {
    const [sez, sigla, dove] = SEZIONI[campo] || [];
    if (!sez) throw new Error("Dettaglio non supportato per: " + campo);
    const tot = parti.reduce((s, p) => s + p[1], 0);
    if (Math.abs(tot - 1) > 1e-9)
      throw new Error(`Le quote di «${campo}» sommano ${tot}, non 1`);
    const fonte = dove === "ce" ? ce : sp;
    parti.forEach(([descr, quota, tipo], i) =>
      righe.push({
        sez,
        descr,
        valori: fonte[campo].map((x) => (x == null ? null : r2(x * quota))),
        tipo,
        codice: `${sigla}.${String(i + 1).padStart(2, "0")}`,
      }),
    );
    fonte[campo] = null;
  }
  return righe;
}

module.exports = { applicaDettaglio };
