const { casoRating } = require("./rating-comune");
module.exports = casoRating(
  5,
  "AAA",
  "Liquidità, patrimonio, oneri e redditività al massimo.",
  { cr: 1.5, pn: 0.3, oneri: 0.02, margine: 0.08, t: 0.8 },
);
