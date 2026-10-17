/* Barra superiore: selettore cliente, anno di riferimento, stampa. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;
  const routeKey = () => GB.routeKey();
  // Bilancio, CE, Rating e Indicatori mostrano tutti gli anni in colonna. Il selettore dell'anno di riferimento serve solo dove i calcoli dipendono da un anno (budget = anno + 1, ecc.)
  const REF_YEAR_PAGES = [
    "dashboard",
    "vendite",
    "budget",
    "bep",
    "investimenti",
    "cashflow",
    "report",
  ];
  /* ── topbar ── */
  function buildTopbar() {
    const key = routeKey();
    const page = GB.pages[key];
    document.getElementById("page-title").textContent = page
      ? S.cliente && !page.noClient
        ? page.title
        : page.title
      : "";
    const ctl = document.getElementById("ctl");
    const parts = [];
    const selC = GB.searchSelect({
      items: S.clienti.map((c) => ({
        value: c.id,
        label: c.ragione_sociale,
        sub: c.partita_iva || "",
      })),
      value: S.clienteId,
      emptyLabel: "— nessun cliente —",
      placeholder: "Cerca cliente…",
      onChange: async (v) => {
        await S.select(v || null);
      },
    });
    parts.push(
      h("div", { class: "topbar-ctl" }, h("label", null, "Cliente"), selC),
    );
    if (S.clienteId) {
      if (REF_YEAR_PAGES.includes(key)) {
        const selY = h(
          "select",
          { onchange: (e) => S.setYear(e.target.value) },
          S.anni.map((a) =>
            h(
              "option",
              { value: a, selected: a === S.anno || null },
              String(a),
            ),
          ),
        );
        parts.push(
          h(
            "div",
            {
              class: "topbar-ctl",
              title:
                "Esercizio di riferimento: il budget, il punto di pareggio, gli investimenti e il cash flow sono calcolati per l'anno successivo; le vendite usano questo e i 2 anni precedenti",
            },
            h("label", null, "Anno rif."),
            selY,
            h(
              "button",
              {
                class: "btn sm icon",
                title: "Aggiungi l'anno successivo",
                onclick: async () => {
                  try {
                    const a = await S.addAnno();
                    GB.toast("Anno " + a + " aggiunto");
                  } catch (e) {
                    /* toast già mostrato */
                  }
                },
              },
              "＋",
            ),
            h(
              "button",
              {
                class: "btn sm icon danger",
                title: "Elimina l'anno selezionato",
                onclick: () => GB.eliminaAnno(),
              },
              "🗑",
            ),
          ),
        );
      }
      parts.push(
        h(
          "button",
          { class: "btn primary", onclick: () => window.print() },
          "🖨️ Stampa",
        ),
      );
    }
    ctl.replaceChildren(...parts);
  }

  GB.app = GB.app || {};
  GB.app.buildTopbar = buildTopbar;
})();
