/* «Date diverse»: tabella con una riga per cliente e una colonna per anno; in ogni cella si scrive la data di chiusura (gg/mm).
   Cella vuota = la data comune scelta nella finestra precedente, oppure 31/12 se non ce n'è.
   GB.chiediDateEsercizi({ righe: [{id, nome}], anni: [..], iniziali?: {id: {anno: "AAAA-MM-GG"}} })
     → { [id]: { [anno]: "AAAA-MM-GG" } } (solo le celle compilate) oppure null se annulli. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  GB.chiediDateEsercizi = async ({ righe, anni, iniziali }) => {
    const campi = {}; // campi[id][anno] = campoData
    const tab = h("table", { class: "date-matrice" });
    const testa = h("tr", null, h("th", { class: "l" }, righe.length > 1 ? "Cliente" : "Esercizio"));
    anni.forEach((a) => {
      const copia =
        righe.length > 1
          ? h(
              "button",
              {
                class: "btn sm",
                type: "button",
                title: `Copia la data della prima riga del ${a} su tutte le righe`,
                onclick: () => {
                  const t = campi[righe[0].id][a].testo();
                  righe.slice(1).forEach((r) => campi[r.id][a].setTesto(t));
                },
              },
              "↓",
            )
          : null;
      testa.append(h("th", null, String(a), " ", copia));
    });
    tab.append(h("thead", null, testa));
    const tb = h("tbody");
    righe.forEach((r) => {
      campi[r.id] = {};
      const tr = h("tr", null, h("td", { class: "l" }, r.nome));
      anni.forEach((a) => {
        const c = GB.campoData({ anno: a, compatto: true });
        const ini = iniziali && iniziali[r.id] && iniziali[r.id][a];
        if (ini) c.set(ini);
        campi[r.id][a] = c;
        tr.append(h("td", null, c.el));
      });
      tb.append(tr);
    });
    tab.append(tb);
    const body = h(
      "div",
      null,
      h(
        "p",
        { class: "edit-intro" },
        "Scrivi giorno e mese (es. 30/06) solo dove la chiusura è diversa. Le celle vuote usano la data comune o, se non c'è, il 31/12.",
      ),
      h("div", { class: "tbl-wrap free date-matrice-wrap" }, tab),
    );
    for (;;) {
      const ok = await GB.modal({
        title: righe.length > 1 ? "Date di chiusura per cliente e anno" : "Date di chiusura per anno",
        body,
        wide: true,
        buttons: [
          { label: "Annulla", value: false },
          { label: "Conferma date", kind: "primary", value: true },
        ],
      });
      if (!ok) return null;
      const out = {};
      let errore = false;
      for (const r of righe) {
        for (const a of anni) {
          const iso = campi[r.id][a].get(true); // avvisa da solo se la data non è valida
          if (iso === null) {
            errore = true;
            break;
          }
          if (iso) (out[r.id] = out[r.id] || {})[a] = iso;
        }
        if (errore) break;
      }
      if (!errore) return out;
    }
  };
})();
