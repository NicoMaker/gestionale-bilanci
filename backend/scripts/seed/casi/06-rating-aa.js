const { casoRating } = require("./rating-comune");
module.exports = casoRating(6, "AA", "Redditività dell'attivo media.", {
  cr: 1.5,
  pn: 0.3,
  oneri: 0.02,
  margine: 0.08,
  t: 3,
});
