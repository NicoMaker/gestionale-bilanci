const { casoRating } = require("./rating-comune");
module.exports = casoRating(9, "BB", "Oneri finanziari alti.", {
  cr: 1.5,
  pn: 0.3,
  oneri: 0.12,
  margine: 0.08,
  t: 4,
});
