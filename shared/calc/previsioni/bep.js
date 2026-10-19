/* Punto di pareggio (dati BEP): data del pareggio e andamento vendite/costi mensili. */
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
  function dayLabel(giorno) {
    if (giorno == null || !isFinite(giorno)) return null;
    const g = Math.max(1, Math.floor(giorno));
    if (g > 365) return { oltre: true, giorno: g };
    const lim = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let d = g,
      m = 0;
    while (d > lim[m]) {
      d -= lim[m];
      m++;
    }
    return {
      giorno: g,
      giornoMese: d,
      mese: m,
      mese_nome: Template.MESI[m],
      oltre: false,
    };
  }
  function bepData(bud, vend) {
    const H = bud.H;
    const varPct = H.ricavi ? (H.costo_mp + H.spese_var) / H.ricavi : 0;
    const fissi = H.spese_fisse;
    const rows = [
      { label: "0", vendite: 0, fissi, totali: fissi, bep: H.bep_fatturato },
    ];
    Template.MESI.forEach((mn, m) => {
      const vend_m = (vend.prog[m] / 100) * H.ricavi;
      rows.push({
        label: mn.slice(0, 3).toLowerCase(),
        vendite: vend_m,
        fissi,
        totali: vend_m * varPct + fissi,
        bep: H.bep_fatturato,
      });
    });
    const hit = rows.findIndex((r, i) => i > 0 && r.vendite >= r.totali);
    return {
      rows,
      var_pct: varPct,
      mese_pareggio: hit > 0 ? hit - 1 : null,
      data_bep: dayLabel(H.bep_giorno),
    };
  }

  return { dayLabel, bepData };
});
