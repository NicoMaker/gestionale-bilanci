/* Elenco ordinato dei casi di seed (un file per caso, raggruppati in sottocartelle per tema). */
const fs = require("fs");
const path = require("path");

// tutti i file «NN-nome.js» nelle sottocartelle, ordinati per numero
const trova = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return trova(p);
    return /^\d\d-.*\.js$/.test(e.name) ? [p] : [];
  });

const casi = trova(__dirname)
  .sort((a, b) => path.basename(a).localeCompare(path.basename(b)))
  .map((f) => require(f));

module.exports = casi;
