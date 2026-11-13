/* Data di chiusura degli esercizi: lettura (stessa data in tutte le sezioni dello stesso cliente), etichette, modifica.
   Se non viene indicata una data l'esercizio chiude il 31/12 dell'anno. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;

  const dataIt = (iso) => (iso ? String(iso).split("-").reverse().join("/") : "");

  // data di chiusura (AAAA-MM-GG) dell'esercizio del cliente selezionato; default 31/12
  GB.dataChiusura = (anno) =>
    ((S.ds && S.ds.par && S.ds.par[anno]) || {}).data_chiusura ||
    anno + "-12-31";
  GB.dataIt = dataIt;
  GB.dataChiusuraIt = (anno) => dataIt(GB.dataChiusura(anno));

  // «2025 (31/12/2025) · 2024 (30/06/2024)» per le intestazioni di stampa e il report
  GB.eserciziTxt = (years) =>
    "Esercizi " +
    years.map((a) => `${a} (chiusura ${GB.dataChiusuraIt(a)})`).join(" · ");
  GB.esercizioTxt = (a) => `${a} (chiuso il ${GB.dataChiusuraIt(a)})`;

  /* Data sotto l'anno nelle intestazioni di colonna. Con editable un clic apre la modifica. */
  GB.dataTag = (anno, editable) =>
    h(
      "span",
      {
        class: "dt" + (editable ? " dt-edit" : ""),
        title: editable
          ? "Data di chiusura dell'esercizio: clic per modificarla"
          : "Data di chiusura dell'esercizio",
        onclick: editable
          ? (e) => {
              e.stopPropagation();
              GB.modificaDataChiusura(anno);
            }
          : undefined,
      },
      GB.dataChiusuraIt(anno),
    );

  /* Finestra con il campo data. Restituisce {data} ("" = 31/12) oppure null se annullata. */
  GB.chiediData = async ({ title, anno, valore, conferma }) => {
    const inp = h("input", {
      type: "date",
      value: valore || "",
      min: anno + "-01-01",
      max: anno + "-12-31",
      class: "inp-data",
      "aria-label": "Data di chiusura dell'esercizio " + anno,
    });
    const ok = await GB.modal({
      title,
      body: h(
        "div",
        null,
        h("p", null, "Data di chiusura dell'esercizio " + anno + ":"),
        h(
          "div",
          { class: "data-chiusura-row" },
          inp,
          h(
            "button",
            {
              class: "btn sm",
              type: "button",
              onclick: () => (inp.value = anno + "-12-31"),
            },
            "31/12",
          ),
        ),
        h(
          "p",
          { class: "small muted" },
          `Se lasci il campo vuoto viene usato il 31/12/${anno}.`,
        ),
      ),
      buttons: [
        { label: "Annulla", value: false },
        { label: conferma, kind: "primary", value: true },
      ],
    });
    if (!ok) return null;
    const v = inp.value.trim();
    if (v && v.slice(0, 4) !== String(anno)) {
      GB.toast("La data deve essere nel " + anno, "err");
      return null;
    }
    return { data: v };
  };

  GB.modificaDataChiusura = async (anno) => {
    const r = await GB.chiediData({
      title: "Data di chiusura " + anno,
      anno,
      valore: GB.dataChiusura(anno),
      conferma: "Salva",
    });
    if (!r) return;
    try {
      const d = await S.saveDataChiusura(anno, r.data);
      GB.toast(`Esercizio ${anno}: chiusura ${dataIt(d)}`);
    } catch (e) {
      /* toast già mostrato */
    }
  };

  GB.aggiungiAnno = async () => {
    const anno = (S.anni.length ? Math.max(...S.anni) : new Date().getFullYear() - 1) + 1;
    const r = await GB.chiediData({
      title: "Aggiungi esercizio " + anno,
      anno,
      valore: "",
      conferma: "Aggiungi",
    });
    if (!r) return;
    try {
      const a = await S.addAnno(anno, r.data);
      GB.toast(`Anno ${a} aggiunto (chiusura ${GB.dataChiusuraIt(a)})`);
    } catch (e) {
      /* toast già mostrato */
    }
  };
})();
