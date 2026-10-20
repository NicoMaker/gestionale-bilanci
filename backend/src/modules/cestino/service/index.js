const cestino = require("./cestino");
const { ripristina } = require("./ripristino");
const { etichettaVoci, elencoNomi, sezioni } = require("./etichette");

module.exports = Object.assign({}, cestino, {
  ripristina,
  etichettaVoci,
  elencoNomi,
  sezioni,
});
