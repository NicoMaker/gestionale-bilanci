/* «Date a gruppi»: scegli QUALI anni hanno la stessa data di chiusura e scrivila UNA volta sola per gruppo.
   Esempio: 2024 e 2025 → 02/01 · 2026 e 2027 → 07/01: quattro anni, due date scritte, un solo clic su «Crea esercizi».
   Gli anni che non metti in nessun gruppo usano la data comune (o 31/12). Gli esercizi già esistenti non vengono toccati
   (qui compaiono solo gli anni ancora da creare).

   GB.chiediDateGruppi({ anni: [..], iniziali?: {anno: "AAAA-MM-GG"} })
     → { [anno]: "AAAA-MM-GG" } (solo gli anni dentro un gruppo con data) oppure null se annulli.
   GB.espandiDateGruppi(mappa, ids, anni) → {idCliente: {anno: data}} per le finestre multi-cliente. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  const due = (n) => String(n).padStart(2, "0");
  const bisestile = (a) => (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
  // «gg/mm» + anno → «AAAA-MM-GG» (il 29/02 negli anni non bisestili diventa 28/02, come fa il server)
  const perAnno = (iso2000, anno) => {
    let [, mm, gg] = iso2000.split("-");
    if (mm === "02" && gg === "29" && !bisestile(anno)) gg = "28";
    return `${anno}-${mm}-${gg}`;
  };
  const ggmm = (iso) => iso.slice(8) + "/" + iso.slice(5, 7);

  GB.chiediDateGruppi = async ({ anni, iniziali }) => {
    const elenco = [...new Set(anni)].sort((a, b) => a - b);
    const gruppi = []; // { campo, anni:Set }
    const lista = h("div", { class: "dg-lista" });
    const riepilogo = h("div", { class: "dc-preview" });

    const nuovoGruppo = (testo, anniIniz) => {
      const g = {
        anni: new Set(anniIniz || []),
        // anno 2000 (bisestile): serve solo a controllare «gg/mm»; l'anno vero si applica a ogni esercizio
        campo: GB.campoData({
          anno: 2000,
          compatto: true,
          nascondiAnno: true,
          testo, // valore iniziale: non richiama onChange
          etichetta: "Data di chiusura del gruppo (gg/mm)",
          onChange: () => riepiloga(),
        }),
      };
      gruppi.push(g);
      return g;
    };

    // gruppi iniziali: gli anni che hanno già la stessa data (gg/mm) finiscono insieme
    const perData = new Map();
    for (const a of elenco) {
      const iso = iniziali && iniziali[a];
      if (!iso) continue;
      const k = ggmm(iso);
      if (!perData.has(k)) perData.set(k, []);
      perData.get(k).push(a);
    }
    for (const [k, v] of perData) nuovoGruppo(k, v);
    while (gruppi.length < 2) nuovoGruppo("", []);

    const riepiloga = () => {
      const parti = [];
      gruppi.forEach((g) => {
        const t = g.campo.testo();
        if (g.anni.size && t) parti.push(`${[...g.anni].sort().join(", ")} → ${t}`);
      });
      const fuori = elenco.filter((a) => !gruppi.some((g) => g.anni.has(a)));
      riepilogo.textContent = parti.length
        ? parti.join("  ·  ") +
          (fuori.length ? `  ·  Senza gruppo (data comune o 31/12): ${fuori.join(", ")}` : "")
        : "Scegli gli anni di ogni gruppo e scrivi la data (gg/mm) una volta sola.";
    };

    const disegna = () => {
      lista.replaceChildren();
      gruppi.forEach((g, i) => {
        const chips = elenco.map((a) => {
          const altro = gruppi.findIndex((x, j) => j !== i && x.anni.has(a));
          return h(
            "button",
            {
              type: "button",
              class:
                "dc-chip dg-chip" +
                (g.anni.has(a) ? " on" : "") +
                (altro >= 0 ? " altro" : ""),
              title:
                altro >= 0
                  ? `Il ${a} è nel gruppo ${altro + 1}: clic per spostarlo qui`
                  : g.anni.has(a)
                    ? `Toglie il ${a} dal gruppo`
                    : `Aggiunge il ${a} al gruppo`,
              onclick: () => {
                if (g.anni.has(a)) g.anni.delete(a);
                else {
                  gruppi.forEach((x) => x.anni.delete(a)); // un anno sta in un solo gruppo
                  g.anni.add(a);
                }
                disegna();
              },
            },
            String(a),
            altro >= 0 ? h("sup", null, String(altro + 1)) : null,
          );
        });
        const tutti = h(
          "button",
          {
            type: "button",
            class: "btn sm",
            title: "Mette nel gruppo tutti gli anni",
            onclick: () => {
              gruppi.forEach((x) => x.anni.clear());
              elenco.forEach((a) => g.anni.add(a));
              disegna();
            },
          },
          "Tutti",
        );
        const togli =
          gruppi.length > 1
            ? h(
                "button",
                {
                  type: "button",
                  class: "btn sm",
                  title: "Elimina il gruppo",
                  onclick: () => {
                    gruppi.splice(i, 1);
                    disegna();
                  },
                },
                "✕",
              )
            : null;
        lista.append(
          h(
            "div",
            { class: "dg-gruppo" },
            h(
              "div",
              { class: "dg-head" },
              h("strong", null, "Gruppo " + (i + 1)),
              h("span", { class: "dcamp-riga" }, g.campo.el),
              h("span", { class: "dg-az" }, tutti, togli),
            ),
            h("div", { class: "dc-chips dg-chips" }, chips),
          ),
        );
      });
      riepiloga();
    };

    const body = h(
      "div",
      null,
      h(
        "p",
        { class: "edit-intro" },
        "Per ogni gruppo scegli gli anni e scrivi la data di chiusura una volta sola (solo giorno e mese, l'anno si aggiunge da solo). Esempio: 2024 e 2025 → 02/01, 2026 e 2027 → 07/01.",
      ),
      lista,
      h(
        "button",
        {
          type: "button",
          class: "btn sm",
          onclick: () => {
            nuovoGruppo("", []);
            disegna();
          },
        },
        "＋ Aggiungi gruppo",
      ),
      riepilogo,
      h(
        "p",
        { class: "small muted dc-hint" },
        "Gli anni senza gruppo, o in un gruppo con la data vuota, usano la data comune oppure il 31/12. Gli esercizi già esistenti non vengono modificati.",
      ),
    );
    disegna();

    for (;;) {
      const ok = await GB.modal({
        title: "Date a gruppi",
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
      for (const g of gruppi) {
        const iso = g.campo.get(true); // avvisa da solo se la data non è valida
        if (iso === null) {
          errore = true;
          break;
        }
        if (!iso) continue;
        for (const a of g.anni) out[a] = perAnno(iso, a);
      }
      if (!errore) return out;
    }
  };

  /* Stessa mappa {anno: data} per ogni cliente indicato; gli anni di `anni` rimossi dai gruppi tornano senza data personalizzata,
     le date di altri anni già impostate «cliente per cliente» restano. */
  GB.espandiDateGruppi = (mappa, ids, anni, precedenti) => {
    const out = {};
    for (const id of ids) {
      const m = {};
      for (const [a, d] of Object.entries((precedenti && precedenti[id]) || {}))
        if (!anni.includes(Number(a))) m[a] = d;
      Object.assign(m, mappa);
      if (Object.keys(m).length) out[id] = m;
    }
    return out;
  };
})();
