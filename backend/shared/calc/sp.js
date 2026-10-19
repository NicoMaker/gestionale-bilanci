/* Stato Patrimoniale: totali e aggregati di un esercizio. */
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

  function spYear(ds, a) {
    const S = (id) => sumSez(ds, id, a);
    const r = {};
    r.imm_imm = S("A_IMM_IMM");
    r.imm_mat = S("A_IMM_MAT");
    r.imm_fin = S("A_IMM_FIN");
    r.attivo_fisso = r.imm_imm + r.imm_mat + r.imm_fin;
    r.rimanenze = S("A_RIMANENZE");
    r.crediti_entro = S("A_CRED_ENTRO");
    r.crediti_oltre = S("A_CRED_OLTRE");
    r.tot_crediti = r.crediti_entro + r.crediti_oltre;
    r.liq_differite = r.crediti_entro + r.rimanenze + r.crediti_oltre;
    r.liquidita = S("A_LIQUIDITA");
    r.risconti = S("A_RISCONTI");
    r.attivo_circolante =
      r.rimanenze + r.crediti_entro + r.liquidita + r.risconti; // (Excel: esclude crediti oltre)
    r.totale_attivo =
      r.attivo_fisso +
      r.rimanenze +
      r.crediti_entro +
      r.crediti_oltre +
      r.liquidita +
      r.risconti;
    r.pn = S("P_PN");
    r.cons_varie = S("P_CONS_VARIE");
    r.finanz = S("P_FINANZ");
    r.tot_pass_cons = r.cons_varie + r.finanz;
    r.tot_consolidato = r.pn + r.finanz + r.cons_varie;
    r.banche = S("P_BANCHE");
    r.corr_varie = S("P_CORR_VARIE");
    r.tot_pass_correnti = r.banche + r.corr_varie;
    r.totale_passivita = r.tot_consolidato + r.tot_pass_correnti;
    r.check = r.totale_passivita - r.totale_attivo;
    r.sez = {};
    for (const s of Template.SEZIONI.SP) r.sez[s.id] = S(s.id);
    return r;
  }

  return { spYear };
});
