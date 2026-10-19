const { casoRating } = require("./rating-comune");
module.exports = casoRating(7, "A", "Oneri finanziari medi.", {
  cr: 1.5,
  pn: 0.3,
  oneri: 0.07,
  margine: 0.08,
  t: 3,
});
