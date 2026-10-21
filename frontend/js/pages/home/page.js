/* Panoramica studio: quanti clienti, totali di ricavi/utile/attivo, rating, avvisi e classifica clienti. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const S = GB.store;

  const ORDINE_RATING = ["AAA", "AA", "A", "BBB", "BB", "B", "CCC", "n.d."];
  const COLORE_RATING = {
    AAA: "var(--green)",
    AA: "var(--green)",
    A: "var(--cyan)",
    BBB: "var(--cyan)",
    BB: "var(--yellow)",
    B: "var(--red)",
    CCC: "var(--red)",
    "n.d.": "var(--b2)",
  };
  const ratingPill = (r) =>
    h("span", { class: "rating sm r-" + (r ? r : "nd") }, r || "n.d.");

  function classifica(st) {
    let key = "ricavi";
    let dir = -1;
    const cols = [
      ["ragione_sociale", "Cliente", "l"],
      ["anno", "Esercizio", "n"],
      ["ricavi", "Ricavi", "n"],
      ["ebitda", "EBITDA", "n"],
      ["utile", "Utile", "n"],
      ["attivo", "Attivo", "n"],
      ["rating", "Rating", "l"],
    ];
    const tb = h("tbody");
    const head = h("tr");
    function paint() {
      const rows = [...st.clienti].sort((a, b) => {
        const x = a[key],
          y = b[key];
        if (typeof x === "string" || typeof y === "string")
          return dir * String(x ?? "").localeCompare(String(y ?? ""), "it");
        return dir * ((x ?? -Infinity) - (y ?? -Infinity));
      });
      head.replaceChildren(
        ...cols.map(([k, label, cls]) =>
          h(
            "th",
            {
              class: cls + " sortable" + (k === key ? " sorted" : ""),
              onclick: () => {
                dir = k === key ? -dir : k === "ragione_sociale" ? 1 : -1;
                key = k;
                paint();
              },
            },
            label + (k === key ? (dir < 0 ? " ▼" : " ▲") : ""),
          ),
        ),
        h("th", { class: "no-print" }, ""),
      );
      tb.replaceChildren(
        ...rows.map((c) =>
          h(
            "tr",
            { class: "line" },
            h("td", { class: "l client-name" }, c.ragione_sociale),
            h("td", { class: "n" }, c.anno == null ? "—" : String(c.anno)),
            h("td", { class: "n" }, c.vuoto ? "—" : fmt.eur(c.ricavi)),
            h("td", { class: "n" }, c.vuoto ? "—" : fmt.eur(c.ebitda)),
            h(
              "td",
              { class: "n " + (c.utile < 0 ? "neg" : "") },
              c.vuoto ? "—" : fmt.eur(c.utile),
            ),
            h("td", { class: "n" }, c.vuoto ? "—" : fmt.eur(c.attivo)),
            h("td", { class: "l" }, c.vuoto ? "—" : ratingPill(c.rating)),
            h(
              "td",
              { class: "no-print", style: { textAlign: "right" } },
              h(
                "button",
                {
                  class: "btn sm primary",
                  onclick: () => GB.parts.clienti.azioni.apri({ id: c.id }),
                },
                "📂 Apri",
              ),
            ),
          ),
        ),
      );
    }
    paint();
    return h("table", { class: "fin studio-tab" }, h("thead", null, head), tb);
  }

  function avvisi(st) {
    const periodo = st.anno
      ? "nell'esercizio " + st.anno
      : "nell'ultimo esercizio";
    const out = [];
    const lista = (arr) =>
      arr
        .slice(0, 6)
        .map((c) => c.ragione_sociale)
        .join(", ") + (arr.length > 6 ? " e altri " + (arr.length - 6) : "");
    const noDati = st.clienti.filter((c) => c.vuoto);
    const noQuadra = st.clienti.filter((c) => !c.vuoto && !c.quadra);
    const perdita = st.clienti.filter((c) => !c.vuoto && c.utile < 0);
    const add = (cls, txt, arr) =>
      arr.length &&
      out.push(
        h(
          "div",
          { class: "note studio-avviso " + cls },
          h("b", null, arr.length + " " + txt),
          " — ",
          lista(arr),
        ),
      );
    add(
      "warn",
      noQuadra.length === 1
        ? "cliente con stato patrimoniale che non quadra"
        : "clienti con stato patrimoniale che non quadra",
      noQuadra,
    );
    add(
      "red",
      perdita.length === 1
        ? "cliente in perdita " + periodo
        : "clienti in perdita " + periodo,
      perdita,
    );
    add(
      "info",
      noDati.length === 1
        ? "cliente ancora senza dati di bilancio"
        : "clienti ancora senza dati di bilancio",
      noDati,
    );
    return out;
  }

  /* Selettore dell'anno: «ultimo esercizio» oppure uno degli anni presenti nei clienti. */
  function selettoreAnno(st, ricarica) {
    if (!st.anni_disponibili || !st.anni_disponibili.length) return null;
    const sel = h(
      "select",
      {
        "aria-label": "Esercizio da visualizzare",
        onchange: (e) => {
          GB.homeAnno = e.target.value ? Number(e.target.value) : null;
          ricarica();
        },
      },
      h(
        "option",
        { value: "", selected: !st.anno || null },
        "Ultimo esercizio di ogni cliente",
      ),
      ...st.anni_disponibili.map((a) =>
        h("option", { value: a, selected: a === st.anno || null }, String(a)),
      ),
    );
    return h(
      "div",
      { class: "studio-anno no-print" },
      h("label", null, "Esercizio"),
      sel,
      st.anno
        ? h(
            "span",
            { class: "small muted" },
            `${st.clienti.filter((c) => c.anno === st.anno).length} di ${st.totali.clienti} clienti hanno l'esercizio ${st.anno}`,
          )
        : null,
    );
  }

  function disegna(st, ricarica) {
    const t = st.totali;
    if (!t.clienti)
      return [
        h(
          "div",
          { class: "empty" },
          h("div", { class: "big" }, "👥"),
          h("h2", null, "Nessun cliente per ora"),
          h(
            "p",
            null,
            "Crea il primo cliente oppure carica i 20 clienti demo per vedere subito i totali.",
          ),
          h(
            "div",
            {
              style: {
                marginTop: "16px",
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                flexWrap: "wrap",
              },
            },
            h(
              "button",
              { class: "btn primary", onclick: GB.parts.clienti.azioni.nuovo },
              "＋ Nuovo cliente",
            ),
            h(
              "button",
              { class: "btn", onclick: GB.parts.clienti.azioni.demoClienti },
              "📦 Carica clienti demo",
            ),
          ),
        ),
      ];

    const labels = ORDINE_RATING.filter((r) => st.rating[r]);
    const anni = Object.keys(st.per_anno).sort().reverse();
    return [
      selettoreAnno(st, ricarica),
      GB.parts.studio.kpi(st, false),
      ...avvisi(st),
      h(
        "div",
        { class: "grid2" },
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h("h3", null, "Distribuzione dei rating"),
            h(
              "span",
              { class: "small muted" },
              t.clienti_con_dati + " clienti con dati",
            ),
          ),
          h(
            "div",
            { class: "card-b" },
            labels.length
              ? GB.chart({
                  labels,
                  bars: [
                    {
                      name: "Clienti",
                      color: "var(--accent)",
                      values: labels.map((r) => st.rating[r]),
                    },
                  ],
                  height: 240,
                })
              : h("div", { class: "muted" }, "Nessun rating calcolabile."),
          ),
        ),
        h(
          "div",
          { class: "card" },
          h(
            "div",
            { class: "card-h" },
            h("h3", null, "Ricavi dei 10 clienti maggiori"),
          ),
          h(
            "div",
            { class: "card-b" },
            (function () {
              const top = [...st.clienti]
                .filter((c) => !c.vuoto)
                .sort((a, b) => b.ricavi - a.ricavi)
                .slice(0, 10);
              const max = Math.max(1, ...top.map((c) => c.ricavi));
              return h(
                "div",
                { class: "hbars" },
                ...top.map((c) =>
                  h(
                    "div",
                    {
                      class: "hbar",
                      title: c.ragione_sociale + ": " + fmt.eur(c.ricavi),
                    },
                    h("span", { class: "hbar-n" }, c.ragione_sociale),
                    h(
                      "span",
                      { class: "hbar-t" },
                      h("span", {
                        class: "hbar-f",
                        style: { width: (c.ricavi / max) * 100 + "%" },
                      }),
                    ),
                    h(
                      "span",
                      { class: "hbar-v" },
                      GB.parts.studio.eurK(c.ricavi),
                    ),
                  ),
                ),
              );
            })(),
          ),
        ),
      ),
      h(
        "div",
        { class: "card" },
        h(
          "div",
          { class: "card-h" },
          h("h3", null, "Tutti i clienti"),
          h(
            "span",
            { class: "small muted no-print" },
            "clicca sulle intestazioni per ordinare · " +
              (st.anno
                ? "dati dell'esercizio " + st.anno
                : "dati dell'ultimo esercizio" +
                  (anni.length ? " (" + anni.join(", ") + ")" : "")),
          ),
        ),
        h(
          "div",
          {
            class: "tbl-wrap free",
            style: { margin: 0, border: "none", borderRadius: 0 },
          },
          classifica(st),
        ),
      ),
    ];
  }

  GB.pages.home = {
    title: "Panoramica studio",
    icon: "🏠",
    noClient: true,
    render(container) {
      const box = h("div", { class: "studio-box" });
      container.append(
        GB.printHead("Panoramica studio", "Totali di tutti i clienti"),
        box,
      );
      const ricarica = () =>
        GB.parts.studio.carica(box, (st) => disegna(st, ricarica), GB.homeAnno);
      ricarica();
      return { update() {} };
    },
  };
})();
