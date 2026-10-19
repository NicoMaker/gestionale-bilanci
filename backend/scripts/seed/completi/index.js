/* I 20 clienti «completi»: dati realistici in settori diversi, con tutte le sezioni compilate. */
const clienti = require("./clienti");
const { costruisci } = require("./costruisci");

module.exports = clienti.map((c, i) => costruisci(c, i + 1));
