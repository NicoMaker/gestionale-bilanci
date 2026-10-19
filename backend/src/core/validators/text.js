/* Pulizia e normalizzazione dei testi. */
const clean = (s, max = 200) =>
  String(s ?? "")
    .trim()
    .slice(0, max);

const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

module.exports = { clean, norm };
