const { casoRating } = require("./rating-comune");
module.exports = casoRating(11, "CCC", "Liquidità corrente bassa (0,9).", {
  cr: 0.9,
  pn: 0.3,
  oneri: 0.12,
  margine: 0.08,
  t: 4,
});
