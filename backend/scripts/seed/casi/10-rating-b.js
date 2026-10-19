const { casoRating } = require("./rating-comune");
module.exports = casoRating(10, "B", "Liquidità corrente media (1,1).", {
  cr: 1.1,
  pn: 0.3,
  oneri: 0.12,
  margine: 0.08,
  t: 4,
});
