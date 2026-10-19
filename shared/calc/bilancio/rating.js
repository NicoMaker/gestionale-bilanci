/* Rating: 4 indicatori con scoring 1-3, punteggio e classe AAA…CCC. */
(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(
      require("../../template"),
      Object.assign({}, require("../helpers")),
    );
  else {
    root.Calc = root.Calc || {};
    Object.assign(root.Calc, factory(root.Template, root.Calc));
  }
})(typeof self !== "undefined" ? self : this, function (Template, C) {
  const { n, div, up, round8, vociSez, valore, sumSez, par } = C;

  const RATING_LABEL = {
    AAA: "Rischio molto basso",
    AA: "Rischio basso",
    A: "Rischio medio basso",
    BBB: "Rischio medio",
    BB: "Rischio medio alto",
    B: "Rischio alto",
    CCC: "Default",
  };
  function ratingYear(sp, ce) {
    const r = {};
    r.rimanenze = sp.rimanenze;
    r.altro_ac = sp.crediti_entro + sp.liquidita + sp.risconti;
    r.immobilizzazioni = sp.attivo_fisso;
    r.totale_attivo = sp.totale_attivo;
    r.passivo_circ = sp.banche + sp.corr_varie;
    r.passivo_ml = sp.cons_varie + sp.finanz;
    r.mezzi_propri = sp.pn;
    r.totale_passivo = sp.totale_passivita;
    r.fatturato = ce.ricavi;
    r.ammortamenti = ce.ammortamenti;
    r.oneri_fin = ce.oneri_fin;
    r.utile = ce.utile;
    const pct = (x, t) => div(x, t);
    r.pct = {
      rimanenze: pct(r.rimanenze, r.totale_attivo),
      altro_ac: pct(r.altro_ac, r.totale_attivo),
      immobilizzazioni: pct(r.immobilizzazioni, r.totale_attivo),
      passivo_circ: pct(r.passivo_circ, r.totale_passivo),
      passivo_ml: pct(r.passivo_ml, r.totale_passivo),
      mezzi_propri: pct(r.mezzi_propri, r.totale_passivo),
    };
    // indicatori
    r.i1 = r.altro_ac === 0 ? 0 : div(r.altro_ac + r.rimanenze, r.passivo_circ);
    r.i2 = div(r.mezzi_propri, r.totale_passivo);
    r.i3 = div(r.oneri_fin, r.fatturato);
    r.i4 =
      r.totale_attivo === 0 ? 0 : (r.utile + r.ammortamenti) / r.totale_attivo;
    // scoring (identico alle IF annidate del foglio)
    r.s1 = r.i1 != null && r.i1 > 0 ? (r.i1 >= 1.2 ? 3 : r.i1 <= 1 ? 1 : 2) : 0;
    r.s2 =
      r.i2 != null && r.i2 > 0 ? (r.i2 >= 0.05 ? 3 : r.i2 <= 0.1 ? 1 : 2) : 0; // (2 non raggiungibile, come in Excel)
    r.s3 = r.i3 != null ? (r.i3 <= 0.05 ? 3 : r.i3 >= 0.1 ? 1 : 2) : 0;
    r.s4 =
      r.i4 != null && r.i4 > 0 ? (r.i4 >= 0.04 ? 3 : r.i4 <= 0.03 ? 1 : 2) : 0;
    r.punteggio = r.s1 + r.s2 + r.s3 + r.s4;
    const map = {
      12: "AAA",
      11: "AA",
      10: "A",
      9: "BBB",
      8: "BB",
      7: "B",
      6: "CCC",
    };
    r.rating = map[r.punteggio] || null; // Excel restituisce FALSE sotto 6
    r.rating_desc = r.rating ? RATING_LABEL[r.rating] : null;
    r.vuoto = sp.totale_attivo === 0 && ce.ricavi === 0;
    return r;
  }

  return { RATING_LABEL, ratingYear };
});
