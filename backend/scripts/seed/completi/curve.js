/* Curve di stagionalità mensile dei clienti completi (normalizzate a 100). */
const norm = (a) => {
  const s = a.reduce((x, y) => x + y, 0);
  return a.map((v) => (v * 100) / s);
};

module.exports = {
  PANE: norm([8, 7.5, 8, 8, 8.5, 8.5, 9, 7, 8.5, 8.5, 8.5, 10]),
  RISTORAZIONE: norm([5.5, 6, 7.5, 8, 9, 9.5, 10, 9, 8.5, 8, 8, 11]),
  INDUSTRIA: norm([7.5, 8.5, 9.5, 9, 9, 9.5, 8.5, 3.5, 9.5, 10, 9.5, 6]),
  EDILE: norm([5, 6, 8, 8.5, 9, 9.5, 9, 4, 9, 10.5, 11, 10.5]),
  GELATERIA: norm([1, 1.5, 4, 8, 12, 15, 20, 20, 10, 5, 1.5, 2]),
  MONTAGNA: norm([16, 15, 9, 3, 2, 5, 14, 17, 5, 2, 3, 15]),
  MODA: norm([6, 7, 10, 9, 7, 6, 4, 3, 11, 12, 12, 13]),
  AGRICOLO: norm([2, 2, 4, 6, 8, 10, 11, 10, 15, 16, 10, 6]),
  VINO: norm([4, 5, 6, 6, 7, 6, 5, 4, 9, 13, 16, 19]),
  RISCALDAMENTO: norm([12, 11, 10, 7, 5, 4, 3, 3, 7, 11, 13, 14]),
  COMMERCIO: norm([6.5, 6.5, 7.5, 8, 8, 8, 8, 6.5, 8, 8.5, 9.5, 15]),
  FARMACIA: norm([8.5, 8, 8.5, 8, 8, 7.5, 8, 7, 8.5, 9, 9, 10]),
  SERVIZI: norm([8, 8.5, 9, 8.5, 9, 9, 8.5, 5, 9, 9.5, 9, 7.5]),
  VIAGGI: norm([6, 7, 9, 8, 8, 10, 14, 12, 7, 6, 6, 7]),
  TRASPORTI: norm([8, 8, 9, 8.5, 8.5, 8.5, 8.5, 6, 9, 9, 8.5, 8]),
  LOGISTICA: norm([7, 7, 8, 8, 8, 8, 7.5, 5, 9, 10, 11, 11.5]),
  CRESCITA: norm([7, 7.5, 8, 8, 8.5, 8.5, 8.5, 8.5, 8.5, 9, 9, 9]),
  BENESSERE: norm([7, 7, 8, 9, 9.5, 10, 8, 5.5, 8.5, 9, 9, 10.5]),
};
