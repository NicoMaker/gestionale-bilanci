/* Curve di stagionalità mensile (12 percentuali che sommano a 100). */
const TIPICA = [6, 6.5, 7.5, 8, 9, 9.5, 8, 4.5, 9, 10, 11, 11];
const PIATTA = Array(12).fill(100 / 12);
const SOLO_DICEMBRE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100];
const SOLO_AGOSTO = [0, 0, 0, 0, 0, 0, 0, 100, 0, 0, 0, 0];
const PRIMO_SEMESTRE = [20, 18, 17, 16, 15, 14, 0, 0, 0, 0, 0, 0];
const BALNEARE = [1, 1, 2, 4, 8, 14, 24, 28, 10, 4, 2, 2]; // estate molto forte

module.exports = {
  TIPICA,
  PIATTA,
  SOLO_DICEMBRE,
  SOLO_AGOSTO,
  PRIMO_SEMESTRE,
  BALNEARE,
};
