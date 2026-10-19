const { casoRating } = require("./rating-comune");
const c = casoRating(
  12,
  "n.d.",
  "Punteggio sotto 6: in perdita, patrimonio minimo.",
  { cr: 0.9, pn: 0.03, oneri: 0.12, margine: -0.05, t: 4 },
);
c.ragione_sociale = "Rating Non Determinabile S.r.l.";
c.atteso = { rating: null };
module.exports = c;
