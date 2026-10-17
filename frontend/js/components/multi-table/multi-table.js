/* Confronto multi-anno: tabelle e grafici che affiancano TUTTI gli esercizi del cliente (non solo l'anno di riferimento).
   I dati per esercizio sono in GB.store.M (calcolati in store.recompute). */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  // un colore per ogni esercizio (si ripetono dopo 7)
  const COLORS = [
    "var(--accent)",
    "var(--green)",
    "var(--red)",
    "var(--yellow)",
    "var(--purple)",
    "var(--cyan)",
    "var(--orange)",
  ];
  GB.yearColor = (i) => COLORS[i % COLORS.length];

  const show = (kind, v) => {
    if (
      v === null ||
      v === undefined ||
      (typeof v === "number" && !isFinite(v))
    )
      return "";
    switch (kind) {
      case "pct":
        return v === 0 ? "–" : fmt.pct(v, 1); // frazione → 12,3 %
      case "pt":
        return v === 0 ? "–" : fmt.pt(v, 1) + " %"; // già in punti percentuali
      case "num2":
        return v === 0 ? "–" : fmt.num(v, 2);
      case "text":
        return String(v);
      default:
        return v === 0 ? "–" : fmt.num(v, 0);
    }
  };

  /* multiTable({
       title, hint, note,
       head(e)  → intestazione della colonna (es. "Budget 2026")
       sub(e)   → riga sotto l'intestazione (es. "base 2025")        [opzionale]
       subs(e)  → [{label, v}] più colonne per esercizio             [opzionale, es. Consolidato / Budget]
       rows: [{t:'sec', label} | {label, get(e, v) → numero|testo, kind:'num'|'pct'|'pt'|'num2'|'text', cls:'line|sub|big|grand'}],
       first: titolo della prima colonna
     }) → { el, update }   — update() ridisegna con i dati correnti */
  GB.multiTable = function (cfg) {
    const S = GB.store;
    const table = h("table", { class: "fin multi" });
    const wrap = h(
      "div",
      {
        class: "tbl-wrap free",
        style: {
          margin: 0,
          border: "none",
          borderRadius: 0,
          boxShadow: "none",
        },
      },
      table,
    );
    const card = h(
      "div",
      { class: "card" },
      h(
        "div",
        { class: "card-h" },
        h("h3", null, cfg.title),
        cfg.hint
          ? h("span", { class: "small muted no-print" }, cfg.hint)
          : null,
      ),
      cfg.note
        ? h(
            "div",
            { class: "note no-print", style: { margin: "12px 18px 0" } },
            cfg.note,
          )
        : null,
      wrap,
    );

    function draw() {
      const E = S.M || [];
      const groups = E.map((e) => ({
        e,
        subs: cfg.subs ? cfg.subs(e) : [{ label: null, v: null }],
      }));
      const ncols = groups.reduce((s, g) => s + g.subs.length, 0);
      const cur = (e) => (e.anno === S.anno ? " cur-col" : "");
      const pick = (e) => () => {
        if (e.anno !== S.anno) S.setYear(e.anno);
      };

      const r1 = h(
        "tr",
        null,
        h("th", { class: "l stk0" }, cfg.first || ""),
        groups.map((g) =>
          h(
            "th",
            {
              class: "yr" + cur(g.e),
              colspan: g.subs.length,
              title: "Imposta " + g.e.anno + " come anno di riferimento",
              style: { cursor: "pointer" },
              onclick: pick(g.e),
            },
            cfg.head(g.e),
          ),
        ),
      );
      const thead = [r1];
      const hasSub = cfg.subs ? true : !!cfg.sub;
      if (hasSub) {
        thead.push(
          h(
            "tr",
            { class: "h2" },
            h("th", { class: "l stk0" }, ""),
            groups.flatMap((g) =>
              cfg.subs
                ? g.subs.map((s) =>
                    h("th", { class: cur(g.e).trim() }, s.label),
                  )
                : [h("th", { class: cur(g.e).trim() }, cfg.sub(g.e))],
            ),
          ),
        );
      }

      const body = [];
      if (!E.length)
        body.push(
          h(
            "tr",
            null,
            h("td", { class: "l", colspan: 2 }, "Nessun esercizio"),
          ),
        );
      cfg.rows.forEach((r) => {
        if (r.t === "sec") {
          body.push(
            h(
              "tr",
              { class: "sec" },
              h(
                "td",
                { colspan: ncols + 1, class: "l" },
                h("span", { class: "stk-label" }, r.label),
              ),
            ),
          );
          return;
        }
        const tr = h(
          "tr",
          { class: r.cls || "line" },
          h("td", { class: "l stk0" }, r.label),
        );
        groups.forEach((g) =>
          g.subs.forEach((s) => {
            let v;
            try {
              v = r.get(g.e, s.v);
            } catch (err) {
              v = null;
            }
            tr.append(
              h(
                "td",
                {
                  class:
                    "n" +
                    (typeof v === "number" && v < 0 ? " neg" : "") +
                    cur(g.e),
                },
                show(r.kind, v),
              ),
            );
          }),
        );
        body.push(tr);
      });
      table.replaceChildren(h("thead", null, thead), h("tbody", null, body));
      GB.printFit(table, 220, 96, ncols);
    }
    draw();
    return { el: card, update: draw };
  };

  /* grafico "una serie per esercizio" (es. liquidità mensile di ogni anno). series(e) → valori */
  GB.yearLines = function ({ labels, series, height = 260, fmtFn }) {
    const E = GB.store.M || [];
    return GB.chart({
      labels,
      lines: E.map((e, i) => ({
        name: String(series.name ? series.name(e) : e.anno),
        color: GB.yearColor(i),
        values: series.values(e),
        width: e.anno === GB.store.anno ? 3.2 : 2,
      })),
      height,
      fmt: fmtFn || GB.fmt.short,
    });
  };
})();
