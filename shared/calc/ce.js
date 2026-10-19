/* Conto Economico: somma per tipo riga, aggregato (margini, EBITDA, utile, BEP) e calcolo di un esercizio. */
(function (root, factory) {
  if (typeof module === "object" && module.exports)
    module.exports = factory(
      require("../template"),
      Object.assign({}, require("./helpers")),
    );
  else {
    root.Calc = root.Calc || {};
    Object.assign(root.Calc, factory(root.Template, root.Calc));
  }
})(typeof self !== "undefined" ? self : this, function (Template, C) {
  const { n, div, up, round8, vociSez, valore, sumSez, par } = C;

  // somma per tipo nelle sezioni dell'intervallo 117..420. SUMIF è case-insensitive.
  function sumTipo(ds, a, tipi, valFn) {
    let s = 0;
    for (const id of Template.CE_SCOPE_COSTI)
      for (const v of vociSez(ds, id))
        if (tipi.includes(up(v.tipo))) s += valFn(v);
    return s;
  }
  function aggregate(S, imposte, fissiRaw, varRaw, costoMpOverride) {
    const r = {};
    r.ricavi = S.C_RICAVI;
    r.pil = r.ricavi;
    r.rim_iniz = S.C_RIM_INIZ;
    r.acquisti = S.C_ACQUISTI;
    r.rim_fin = S.C_RIM_FIN;
    r.costo_mp =
      costoMpOverride != null
        ? costoMpOverride
        : r.rim_iniz + r.acquisti - r.rim_fin;
    r.produttivi = S.C_PRODUTTIVI;
    r.costo_venduto = r.costo_mp + r.produttivi;
    r.margine1 = r.ricavi - r.costo_venduto;
    r.personale = S.C_PERSONALE;
    r.commerciali = S.C_COMMERCIALI;
    r.amministrativi = S.C_AMMINISTRATIVI;
    r.ammortamenti = S.C_AMMORTAMENTI;
    r.oneri_trib = S.C_ONERI_TRIB;
    r.costi_operativi =
      r.costo_venduto +
      r.personale +
      r.commerciali +
      r.amministrativi +
      r.ammortamenti +
      r.oneri_trib;
    r.ebit = r.ricavi - r.costi_operativi;
    r.ebitda = r.ebit + r.ammortamenti;
    r.oneri_fin = S.C_ONERI_FIN;
    r.proventi_fin = S.C_PROVENTI_FIN;
    r.risultato_gest = r.ebit - r.oneri_fin + r.proventi_fin;
    r.ricavi_extra = S.C_RICAVI_EXTRA;
    r.costi_extra = S.C_COSTI_EXTRA;
    r.ante_imposte = r.risultato_gest + r.ricavi_extra - r.costi_extra;
    r.imposte = imposte;
    r.utile = r.ante_imposte - r.imposte;
    r.spese_fisse = fissiRaw - r.proventi_fin;
    r.spese_var = varRaw;
    const den = r.ricavi ? 1 - (r.costo_mp + r.spese_var) / r.ricavi : 0;
    r.bep_fatturato = den ? r.spese_fisse / den : null;
    r.bep_pct =
      r.ricavi && r.bep_fatturato != null
        ? (r.bep_fatturato / r.ricavi) * 100
        : null; // in punti %
    r.bep_giorno = r.bep_pct != null ? (r.bep_pct * 365) / 100 : null;
    return r;
  }
  function ceYear(ds, a) {
    const S = {};
    for (const s of Template.SEZIONI.CE) S[s.id] = sumSez(ds, s.id, a);
    // Excel (CE!D426): SUMIF(tipo="F") + SUMIF(C117:C420,"=o") — il secondo termine confronta i VALORI con "o",
    // quindi in pratica conta solo le righe di tipo F.
    const fissi = sumTipo(ds, a, ["F"], (v) => valore(ds, v.id, a));
    const vari = sumTipo(ds, a, ["V"], (v) => valore(ds, v.id, a));
    const r = aggregate(S, S.C_IMPOSTE, fissi, vari);
    r.sez = S;
    const rc = r.ricavi;
    r.pct = (x) => (rc ? (x / rc) * 100 : null);
    return r;
  }

  return { sumTipo, aggregate, ceYear };
});
