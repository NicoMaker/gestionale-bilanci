/* Dashboard: tutte le funzionalità dell'app in un colpo d'occhio.
   Ogni scheda spiega la funzione, mostra i dati chiave del cliente aperto (per l'anno di riferimento scelto)
   e porta con un clic alla pagina; per le pagine che dipendono dall'anno ci sono i collegamenti ai singoli esercizi. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const S = GB.store;

  const eur = (x) => GB.parts.studio.eurK(x);
  const tono = (x) => (x == null || !isFinite(x) ? "" : x < 0 ? "neg" : "pos");
  const ratingPill = (r) =>
    h("span", { class: "rating sm r-" + (r ? r : "nd") }, r || "n.d.");

  /* pagine i cui calcoli dipendono dall'anno di riferimento (stessa lista della barra superiore) */
  const PER_ANNO = [
    "dashboard",
    "vendite",
    "budget",
    "bep",
    "investimenti",
    "cashflow",
    "report",
  ];

  /* Riga di dati: etichetta + valore (tono = pos/neg per colore). */
  const dato = (l, v, t) =>
    v == null || v === "" ? null : { l, v, t: t || "" };

  /* Dati chiave per ogni pagina del cliente. Ogni funzione ritorna un elenco di righe {l, v, t}
     e non deve mai bloccare la dashboard: gli errori vengono intercettati più sotto. */
  const DATI = {
    dashboard: (R, Y) => [
      dato("Esercizi inseriti", fmt.int(S.anni.length)),
      dato(
        "Ultimo esercizio",
        S.anni.length ? String(S.anni[S.anni.length - 1]) : "—",
      ),
    ],
    sp: (R, Y) => {
      const sp = R.anni[Y].sp;
      return [
        dato("Totale attivo", eur(sp.totale_attivo)),
        dato("Patrimonio netto", eur(sp.pn), tono(sp.pn)),
        dato(
          "Quadratura",
          Math.abs(sp.check) >= 0.005 ? "da verificare" : "quadra",
          Math.abs(sp.check) >= 0.005 ? "neg" : "pos",
        ),
      ];
    },
    ce: (R, Y) => {
      const ce = R.anni[Y].ce;
      return [
        dato("Ricavi", eur(ce.ricavi)),
        dato("EBITDA", eur(ce.ebitda), tono(ce.ebitda)),
        dato("Utile", eur(ce.utile), tono(ce.utile)),
      ];
    },
    rating: (R, Y) => {
      const r = R.anni[Y].rating;
      return [
        {
          l: "Rating",
          v: r.vuoto ? "nessun dato" : ratingPill(r.rating),
          t: "",
        },
        dato(
          "Punteggio",
          r.vuoto
            ? ""
            : r.punteggio +
                "/12" +
                (r.rating_desc ? " · " + r.rating_desc : ""),
        ),
      ];
    },
    indicatori: (R, Y) => {
      const i = R.anni[Y].ind;
      return [
        dato("ROE", fmt.pct(i.roe, 1), tono(i.roe)),
        dato("ROS", fmt.pct(i.ros, 1), tono(i.ros)),
        dato(
          "Current ratio",
          i.current_ratio == null ? "" : fmt.num(i.current_ratio, 2),
        ),
      ];
    },
    vendite: (R, Y) => [
      dato("Vendite " + Y, eur(R.vend.tot[2])),
      dato("Vendite " + (Y - 1), eur(R.vend.tot[1])),
    ],
    budget: (R, Y) => [
      dato("Ricavi " + (Y + 1), eur(R.bud.H.ricavi)),
      dato("EBIT", eur(R.bud.H.ebit), tono(R.bud.H.ebit)),
      dato("Utile", eur(R.bud.H.utile), tono(R.bud.H.utile)),
    ],
    bep: (R, Y) => {
      const d = R.bep.data_bep;
      return [
        dato("Fatturato di pareggio", eur(R.bud.H.bep_fatturato)),
        dato(
          "Pareggio raggiunto",
          !d
            ? ""
            : d.oltre
              ? "oltre fine anno"
              : d.giornoMese + " " + d.mese_nome,
        ),
      ];
    },
    investimenti: (R, Y) => [
      dato("Investimento", eur(R.inv.investimento)),
      dato("Fatturato necessario", eur(R.inv.fatturato_necessario)),
    ],
    cashflow: (R, Y) => {
      const liq = R.cf.liq;
      return [
        dato("Liquidità a fine anno", eur(liq[11]), tono(liq[11])),
        dato("Minimo nell'anno", eur(Math.min(...liq)), tono(Math.min(...liq))),
      ];
    },
    report: (R, Y) => [
      dato("Sezioni incluse", String(GB.parts.report.ORDER.length + 1)),
      dato("Pronto per", "stampa / PDF"),
    ],
  };

  /* Catalogo delle funzioni. tasto = scorciatoia «g + lettera». */
  const CLIENTE = [
    {
      k: "dashboard",
      tasto: "r",
      desc: "Anagrafica, KPI, avvisi di quadratura e andamento di tutti gli esercizi con i grafici.",
    },
    {
      k: "sp",
      tasto: "s",
      desc: "Attivo, passivo e patrimonio netto di ogni esercizio, con i controlli di quadratura.",
    },
    {
      k: "ce",
      tasto: "e",
      desc: "Ricavi, costi, EBITDA, EBIT e utile di tutti gli esercizi affiancati.",
    },
    {
      k: "rating",
      tasto: "t",
      desc: "Giudizio da AAA a CCC calcolato dai parametri di bilancio, con legenda e punteggi.",
    },
    {
      k: "indicatori",
      tasto: "i",
      desc: "Sette indicatori di performance: ROE, ROI, ROS, current ratio, rotazione magazzino…",
    },
    {
      k: "vendite",
      tasto: "v",
      desc: "Vendite mensili, stagionalità e confronto degli esercizi.",
    },
    {
      k: "budget",
      tasto: "b",
      desc: "Budget dell'anno successivo con inflazione, produttività e variazioni manuali.",
    },
    {
      k: "bep",
      tasto: "p",
      desc: "Punto di pareggio: fatturato e data in cui i ricavi coprono tutti i costi.",
    },
    {
      k: "investimenti",
      tasto: "n",
      desc: "Fatturato necessario per ripagare un investimento e nuovo budget risultante.",
    },
    {
      k: "cashflow",
      tasto: "f",
      desc: "Piano di tesoreria a 12 mesi: entrate, uscite e liquidità mese per mese.",
    },
    {
      k: "report",
      tasto: "o",
      desc: "Copertina e tutte le pagine del cliente in sequenza, pronte da stampare o salvare in PDF.",
    },
  ];

  /* Scheda di una funzione del cliente. */
  function schedaCliente(def, hasC) {
    const page = GB.pages[def.k];
    const Y = S.anno;
    let righe = [];
    if (hasC) {
      try {
        righe = (DATI[def.k] ? DATI[def.k](S.R, Y) : []).filter(Boolean);
      } catch (e) {
        console.error("Dashboard:", def.k, e);
      }
    }
    const corpo = [
      h(
        "div",
        { class: "hub-head" },
        h("span", { class: "hub-ico" }, page.icon),
        h("span", { class: "hub-title" }, page.title),
        def.tasto
          ? h(
              "span",
              { class: "hub-kbd no-print", title: "Scorciatoia da tastiera" },
              h("kbd", null, "g"),
              h("kbd", null, def.tasto),
            )
          : null,
      ),
      h("p", { class: "hub-desc" }, def.desc),
      hasC && righe.length
        ? h(
            "dl",
            { class: "hub-dati" },
            ...righe.map((r) =>
              h(
                "div",
                { class: "hub-riga" },
                h("dt", null, r.l),
                h("dd", { class: r.t }, r.v),
              ),
            ),
          )
        : null,
    ];

    if (!hasC)
      return h(
        "div",
        { class: "hub-card disabled", title: "Seleziona prima un cliente" },
        ...corpo,
        h("div", { class: "hub-foot" }, "Seleziona un cliente"),
      );

    const apri = () => {
      document.body.classList.remove("nav-open");
      location.hash = "#/" + def.k;
    };
    /* collegamenti ai singoli esercizi: impostano l'anno di riferimento e aprono la pagina */
    const anni = PER_ANNO.includes(def.k)
      ? h(
          "div",
          { class: "hub-anni no-print" },
          h("span", { class: "hub-anni-l" }, "Esercizio"),
          ...[...S.anni].reverse().map((a) =>
            h(
              "button",
              {
                type: "button",
                class: "hub-chip" + (a === S.anno ? " on" : ""),
                title: "Apri «" + page.title + "» per l'esercizio " + a,
                onclick: (e) => {
                  e.stopPropagation();
                  if (a !== S.anno) S.setYear(a);
                  apri();
                },
              },
              String(a),
            ),
          ),
        )
      : null;

    return h(
      "div",
      {
        class: "hub-card",
        role: "link",
        tabindex: "0",
        onclick: apri,
        onkeydown: (e) => {
          if (
            e.target === e.currentTarget &&
            (e.key === "Enter" || e.key === " ")
          ) {
            e.preventDefault();
            apri();
          }
        },
      },
      ...corpo,
      anni,
      h("div", { class: "hub-foot" }, "Apri →"),
    );
  }

  /* Schede dello studio (non richiedono un cliente). */
  function schedeStudio() {
    const nClienti = S.clienti.length;
    const voci = [
      {
        icon: "🏠",
        title: "Panoramica studio",
        desc: "Totali di tutti i clienti: ricavi, utile, rating e classifica.",
        dato: nClienti + (nClienti === 1 ? " cliente" : " clienti"),
        href: "#/home",
        tasto: "h",
      },
      {
        icon: "👥",
        title: "Clienti",
        desc: "Elenco con ricerca: crea, modifica, elimina, aggiungi esercizi e apri un cliente.",
        dato: "Gestione anagrafiche",
        href: "#/clienti",
        tasto: "c",
      },
      {
        icon: "🗑️",
        title: "Cestino",
        desc:
          "Recupera clienti, anni e righe eliminati negli ultimi " +
          GB.cestino.giorni +
          " giorni.",
        dato: (GB.cestino.n || 0) + " elementi",
        href: "#/cestino",
        tasto: "x",
      },
      {
        icon: "💾",
        title: "Scarica database",
        desc: "Copia di backup di tutti i dati dell'app in un solo file.",
        dato: "File .db con tutti i dati",
        href: "api/download-db",
        download: true,
      },
      {
        icon: "🎨",
        title: "Personalizza",
        desc: "Tema, colori, dimensione del testo e misure dell'interfaccia.",
        dato: "Scorciatoia: d",
        azione: () => window.togglePersonalizza && window.togglePersonalizza(),
      },
      {
        icon: "📖",
        title: "Guida",
        desc: "Manuale utente completo in PDF, aperto in una nuova scheda.",
        dato: "Manuale utente in PDF",
        azione: () => window.apriGuida && window.apriGuida(),
      },
      {
        icon: "⌨️",
        title: "Scorciatoie da tastiera",
        desc: "Elenco dei tasti per cambiare pagina senza il mouse.",
        dato: "Tasto: ?",
        azione: () => GB.apriGuidaTasti && GB.apriGuidaTasti(),
      },
    ];
    return voci.map((v) => {
      const corpo = [
        h(
          "div",
          { class: "hub-head" },
          h("span", { class: "hub-ico" }, v.icon),
          h("span", { class: "hub-title" }, v.title),
          v.tasto
            ? h(
                "span",
                { class: "hub-kbd no-print" },
                h("kbd", null, "g"),
                h("kbd", null, v.tasto),
              )
            : null,
        ),
        h("p", { class: "hub-desc" }, v.desc),
        h("div", { class: "hub-dato-solo" }, v.dato),
        h("div", { class: "hub-foot" }, v.download ? "Scarica ↓" : "Apri →"),
      ];
      if (v.href)
        return h(
          "a",
          {
            class: "hub-card",
            href: v.href,
            download: v.download ? "" : null,
            onclick: () => document.body.classList.remove("nav-open"),
          },
          ...corpo,
        );
      return h(
        "button",
        { type: "button", class: "hub-card", onclick: v.azione },
        ...corpo,
      );
    });
  }

  /* Scelta del cliente (quando nessuno è aperto) con ricerca. */
  function sceltaCliente() {
    const lista = h("div", { class: "hub-clienti" });
    const q = h("input", {
      class: "hub-cerca",
      type: "search",
      placeholder: "Cerca cliente per nome o P.IVA…",
      "aria-label": "Cerca cliente",
    });
    const paint = () => {
      const t = q.value.trim().toLowerCase();
      const trovati = S.clienti.filter(
        (c) =>
          !t ||
          (c.ragione_sociale || "").toLowerCase().includes(t) ||
          (c.partita_iva || "").includes(t),
      );
      lista.replaceChildren(
        ...(trovati.length
          ? trovati.slice(0, 60).map((c) =>
              h(
                "button",
                {
                  type: "button",
                  class: "hub-cliente",
                  onclick: () => S.select(c.id),
                },
                h("span", { class: "hub-cliente-n" }, c.ragione_sociale),
                h(
                  "span",
                  { class: "hub-cliente-s" },
                  c.partita_iva || "senza P.IVA",
                ),
              ),
            )
          : [h("div", { class: "muted small" }, "Nessun cliente trovato.")]),
      );
    };
    q.addEventListener("input", paint);
    paint();
    return h(
      "div",
      { class: "card no-print" },
      h(
        "div",
        { class: "card-h" },
        h("h3", null, "Scegli un cliente per vedere i suoi dati"),
        h("span", { class: "small muted" }, S.clienti.length + " clienti"),
      ),
      h("div", { class: "card-b" }, q, lista),
    );
  }

  /* Testata del cliente aperto: anagrafica, scelta dell'esercizio e KPI. */
  function testataCliente() {
    const Y = S.anno;
    const cur = S.R.anni[Y];
    const bud = S.R.bud;
    const kpi = (l, v, s, t) =>
      h(
        "div",
        { class: "kpi" },
        h("div", { class: "l" }, l),
        h("div", { class: "v " + (t || "") }, v),
        s ? h("div", { class: "s" }, s) : null,
      );
    return [
      h(
        "div",
        { class: "card hub-cliente-card" },
        h(
          "div",
          { class: "card-b hub-cliente-b" },
          h(
            "div",
            { class: "hub-cliente-id" },
            h("div", { class: "small muted" }, "Cliente aperto"),
            h("div", { class: "hub-cliente-nome" }, S.cliente.ragione_sociale),
            h(
              "div",
              { class: "small muted" },
              S.cliente.partita_iva
                ? "P.IVA " + S.cliente.partita_iva
                : "P.IVA non inserita",
              " · ",
              S.anni.length +
                (S.anni.length === 1 ? " esercizio" : " esercizi"),
            ),
          ),
          h(
            "div",
            { class: "hub-anno no-print" },
            h("div", { class: "small muted" }, "Esercizio di riferimento"),
            h(
              "div",
              { class: "hub-anni-sel" },
              ...[...S.anni].reverse().map((a) =>
                h(
                  "button",
                  {
                    type: "button",
                    class: "hub-chip lg" + (a === S.anno ? " on" : ""),
                    onclick: () => S.setYear(a),
                  },
                  String(a),
                ),
              ),
            ),
          ),
          h(
            "div",
            { class: "hub-azioni no-print" },
            h(
              "button",
              {
                class: "btn",
                type: "button",
                onclick: () => S.select(null),
                title: "Chiudi il cliente e scegline un altro",
              },
              "↔ Cambia cliente",
            ),
          ),
        ),
      ),
      h(
        "div",
        { class: "kpis" },
        kpi(`Ricavi ${Y}`, eur(cur.ce.ricavi)),
        kpi(
          "Utile",
          eur(cur.ce.utile),
          cur.ind.roe != null ? "ROE " + fmt.pct(cur.ind.roe, 1) : "",
          tono(cur.ce.utile),
        ),
        kpi(
          "Rating",
          cur.rating.rating || "n.d.",
          cur.rating.vuoto
            ? "nessun dato"
            : "punteggio " + cur.rating.punteggio + "/12",
        ),
        kpi(
          `Budget ${Y + 1} · utile`,
          eur(bud.H.utile),
          "ricavi " + eur(bud.H.ricavi),
          tono(bud.H.utile),
        ),
      ),
    ];
  }

  GB.pages.hub = {
    title: "Dashboard",
    icon: "🧭",
    noClient: true,
    render(container) {
      const hasC = !!S.clienteId && !!S.R;
      container.append(
        GB.printHead(
          "Dashboard",
          hasC ? "Funzionalità e dati del cliente" : "Funzionalità dell'app",
        ),
      );

      if (hasC) container.append(...testataCliente());
      else if (S.clienti.length) container.append(sceltaCliente());
      else
        container.append(
          h(
            "div",
            { class: "note no-print" },
            "Nessun cliente per ora: apri la pagina Clienti per crearne uno o caricare i clienti demo.",
          ),
        );

      container.append(
        h(
          "div",
          { class: "hub-sez" },
          h(
            "h2",
            null,
            hasC
              ? "Analisi di " + S.cliente.ragione_sociale
              : "Analisi del cliente",
          ),
          h(
            "p",
            { class: "muted small" },
            hasC
              ? "Clicca una scheda per aprire la pagina. Con i pulsanti «Esercizio» apri direttamente l'anno che ti serve."
              : "Queste pagine si attivano quando scegli un cliente.",
          ),
        ),
        h(
          "div",
          { class: "hub-grid" },
          ...CLIENTE.map((d) => schedaCliente(d, hasC)),
        ),
        h(
          "div",
          { class: "hub-sez" },
          h("h2", null, "Studio e strumenti"),
          h(
            "p",
            { class: "muted small" },
            "Funzioni generali, sempre disponibili.",
          ),
        ),
        h("div", { class: "hub-grid" }, ...schedeStudio()),
      );
      return { update() {} };
    },
  };
})();
