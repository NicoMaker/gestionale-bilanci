/* Totali di tutto lo studio (clienti, esercizi, ricavi, utile…): usati nella Panoramica e in testa all'elenco Clienti. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.studio = {};

  // importi grandi in forma compatta con un decimale (48,9 M €), piccoli per esteso
  const eurK = (x) => {
    if (x == null || !isFinite(x)) return "–";
    const a = Math.abs(x);
    if (a >= 1e9) return fmt.num(x / 1e9, 2) + " Md €";
    if (a >= 1e6) return fmt.num(x / 1e6, 1) + " M €";
    return fmt.eur(x);
  };
  GB.parts.studio.eurK = eurK;

  const kpi = (icon, l, v, s, tone) =>
    h(
      "div",
      { class: "kpi studio-kpi" + (tone ? " " + tone : "") },
      h("div", { class: "l" }, h("span", { class: "ico" }, icon), l),
      h("div", { class: "v", title: typeof v === "string" ? v : "" }, v),
      s ? h("div", { class: "s" }, s) : null,
    );

  /* Schede con i totali. compatta = solo le 5 principali (testa della pagina Clienti). */
  GB.parts.studio.kpi = function (st, compatta) {
    const t = st.totali;
    const annoMax = Math.max(0, ...Object.keys(st.per_anno).map(Number));
    const base = [
      kpi(
        "👥",
        "Clienti",
        fmt.int(t.clienti),
        t.clienti
          ? t.clienti_con_dati + " con dati di bilancio"
          : "nessun cliente inserito",
      ),
      kpi(
        "🗂️",
        "Esercizi inseriti",
        fmt.int(t.esercizi),
        t.clienti ? "in media " + fmt.num(t.esercizi / t.clienti, 1) + " per cliente" : "",
      ),
      kpi(
        "💶",
        "Ricavi totali",
        eurK(t.ricavi),
        annoMax ? "ultimo esercizio di ogni cliente" : "",
      ),
      kpi(
        "📈",
        "Utile totale",
        eurK(t.utile),
        t.clienti_con_dati
          ? t.utile_positivo +
              " in utile · " +
              t.utile_negativo +
              " in perdita"
          : "",
        t.utile < 0 ? "neg" : "pos",
      ),
    ];
    if (compatta) {
      base.push(
        kpi(
          "⚠️",
          "Da controllare",
          fmt.int(t.quadratura_ko + t.utile_negativo),
          t.quadratura_ko + " non quadrano · " + t.utile_negativo + " in perdita",
          t.quadratura_ko + t.utile_negativo ? "warn" : "",
        ),
      );
      return h("div", { class: "kpis studio-kpis" }, ...base);
    }
    base.push(
      kpi("🏭", "EBITDA totale", eurK(t.ebitda), t.ricavi ? fmt.pct(t.ebitda / t.ricavi, 1) + " dei ricavi" : ""),
      kpi("🏦", "Totale attivo", eurK(t.attivo), "somma degli stati patrimoniali"),
      kpi("🧱", "Patrimonio netto", eurK(t.pn), t.attivo ? fmt.pct(t.pn / t.attivo, 1) + " dell'attivo" : ""),
      kpi(
        "⚖️",
        "Quadratura bilancio",
        t.quadratura_ko ? t.quadratura_ko + " da verificare" : "Tutto ok",
        "attivo = passivo + patrimonio netto",
        t.quadratura_ko ? "warn" : "pos",
      ),
    );
    return h("div", { class: "kpis studio-kpis" }, ...base);
  };

  /* Carica i dati dal server e li disegna dentro `box` tramite draw(stats). */
  GB.parts.studio.carica = async function (box, draw) {
    box.replaceChildren(h("div", { class: "muted small" }, "Calcolo dei totali…"));
    try {
      const st = await GB.api.get("/statistiche");
      if (!box.isConnected) return;
      box.replaceChildren(...[].concat(draw(st)));
    } catch (e) {
      if (box.isConnected)
        box.replaceChildren(
          h("div", { class: "note", style: { borderLeftColor: "var(--red)" } }, "Totali non disponibili: " + e.message),
        );
    }
  };
})();
