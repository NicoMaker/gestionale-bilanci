/* Indicatori sintetici del BEP: fatturato minimo, % pareggio, data, margine di contribuzione, spese fisse, mese di pareggio. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const T = window.Template;

  GB.parts.bep.kpi = function (kpis, Y) {
    const S = GB.store;
    const dataTxt = GB.parts.bep.dataTxt;
    const B = S.R.bud,
      P = S.R.bep,
      H = B.H,
      C = B.C;
    const kp = (l, v, s) =>
      h(
        "div",
        { class: "kpi" },
        h("div", { class: "l" }, l),
        h("div", { class: "v" }, v),
        s ? h("div", { class: "s" }, s) : null,
      );
    kpis.replaceChildren(
      kp(
        `Fatturato minimo BEP ${Y + 1}`,
        fmt.eur(H.bep_fatturato),
        H.ricavi
          ? "Budget ricavi: " + fmt.eur(H.ricavi)
          : "Inserisci i dati del budget",
      ),
      kp(
        "% punto di pareggio",
        H.bep_pct == null ? "n.d." : fmt.pt(H.bep_pct) + " %",
        "del fatturato di budget",
      ),
      kp(
        "Data BEP aziendale",
        dataTxt(H.bep_giorno),
        H.bep_giorno != null
          ? "giorno " + Math.floor(H.bep_giorno) + " dell'anno"
          : "",
      ),
      kp(
        "Margine di contribuzione",
        P.var_pct || H.ricavi ? fmt.pct(1 - P.var_pct) : "n.d.",
        "1 − (materie prime + variabili) / ricavi",
      ),
      kp(
        "Spese fisse di budget",
        fmt.eur(H.spese_fisse),
        `consolidato ${Y}: ${fmt.eur(C.spese_fisse)}`,
      ),
      kp(
        `Pareggio raggiunto a`,
        P.mese_pareggio == null ? "non raggiunto" : T.MESI[P.mese_pareggio],
        "in base alla stagionalità delle vendite",
      ),
    );
  };
})();
