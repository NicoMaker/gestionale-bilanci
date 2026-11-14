/* «Più anni»: crea in un colpo gli esercizi da un anno a un altro (estremi inclusi) per il cliente selezionato.
   Gli anni già presenti non vengono toccati. Data di chiusura: giorno e mese comuni a tutti gli anni, oppure diversi anno per anno
   (pulsante «Date diverse…»). Dove non scrivi nulla l'esercizio chiude il 31/12. */
(function () {
  const GB = window.GB;
  const { h } = GB;
  const S = GB.store;

  const MAX_ANNI = 60;
  const annoOk = (a) => Number.isInteger(a) && a >= 1990 && a <= 2100;

  /* Finestra con anno iniziale, anno finale e data di chiusura. Restituisce {da, a, data, date} oppure null:
     data = «GG/MM» comune (o ""); date = {anno: "AAAA-MM-GG"} per gli anni con una data diversa. */
  GB.chiediAnniMultipli = async () => {
    const presenti = new Set([
      ...S.anni,
      ...Object.keys((S.ds && S.ds.par) || {}).map(Number),
    ]);
    const prossimo = (presenti.size ? Math.max(...presenti) : new Date().getFullYear() - 1) + 1;
    const da = h("input", { type: "number", min: 1990, max: 2100, value: prossimo });
    const a = h("input", { type: "number", min: 1990, max: 2100, value: prossimo + 2 });
    const anteprima = h("div", { class: "dc-preview" });
    let campo;
    let dateAnno = {}; // chiusure diverse anno per anno (da «Date diverse…»)
    const nuoviAnni = () => {
      const { x, y } = valori();
      if (!annoOk(x) || !annoOk(y) || y < x || y - x + 1 > MAX_ANNI) return [];
      return Array.from({ length: y - x + 1 }, (_, i) => x + i).filter((n) => !presenti.has(n));
    };
    const reset = GB.resetDataBtn({
      title: "Reimposta: la data di chiusura torna al 31/12 (automatica)",
      onclick: () => {
        campo.reset();
        campo.input.focus();
      },
    });
    const valori = () => {
      const x = Number(da.value);
      const y = a.value === "" ? x : Number(a.value);
      return { x, y };
    };
    const aggiorna = () => {
      const { x, y } = valori();
      if (campo) reset.disabled = campo.vuoto();
      let testo = "";
      if (!annoOk(x) || !annoOk(y)) testo = "Indica anni tra 1990 e 2100.";
      else if (y < x) testo = "L'anno finale deve essere uguale o successivo a quello iniziale.";
      else if (y - x + 1 > MAX_ANNI) testo = `Al massimo ${MAX_ANNI} anni alla volta.`;
      else {
        const tutti = Array.from({ length: y - x + 1 }, (_, i) => x + i);
        const nuovi = tutti.filter((n) => !presenti.has(n));
        const gia = tutti.filter((n) => presenti.has(n));
        testo = nuovi.length
          ? `Verranno creati ${nuovi.length} esercizi: ${nuovi.join(", ")}.`
          : "Tutti questi anni esistono già: non verrà creato nulla.";
        if (gia.length && nuovi.length) testo += ` Già presenti (non modificati): ${gia.join(", ")}.`;
        const diverse = nuovi.filter((n) => dateAnno[n]).length;
        if (diverse) testo += ` Date diverse impostate: ${diverse}.`;
      }
      anteprima.textContent = testo;
    };
    campo = GB.campoData({
      anno: annoOk(Number(da.value)) ? Number(da.value) : prossimo,
      compatto: true,
      etichetta: "Data di chiusura comune (gg/mm)",
      onChange: aggiorna,
    });
    da.addEventListener("input", () => {
      // l'anno della data segue l'anno iniziale (setAnno può a sua volta richiamare aggiorna: nessun ciclo perché qui non lo chiamo)
      const x = Number(da.value);
      if (annoOk(x)) campo.setAnno(x);
      aggiorna();
    });
    a.addEventListener("input", aggiorna);
    aggiorna();
    const body = h(
      "div",
      null,
      h(
        "p",
        { class: "edit-intro" },
        "Crea in un colpo tutti gli esercizi dall'anno iniziale a quello finale (compresi). Gli anni già presenti restano com'erano.",
      ),
      h(
        "div",
        { class: "row2" },
        h("div", { class: "field" }, h("label", null, "Dall'anno"), da),
        h("div", { class: "field" }, h("label", null, "All'anno"), a),
      ),
      h(
        "div",
        { class: "field" },
        h("label", null, "Data di chiusura comune a tutti gli anni"),
        h("span", { class: "dcamp-riga" }, campo.el, reset),
        h(
          "div",
          { class: "hint" },
          "Scrivi solo giorno e mese (es. 30/06): l'anno si aggiunge da solo per ogni esercizio. Se la lasci vuota ogni esercizio chiude il 31/12. Per date diverse da un anno all'altro usa «Date diverse…».",
        ),
      ),
      anteprima,
    );
    for (;;) {
      const ok = await GB.modal({
        title: "Aggiungi più anni",
        body,
        buttons: [
          { label: "Annulla", value: false },
          { label: "Date diverse…", value: "date" },
          { label: "Crea esercizi", kind: "primary", value: true },
        ],
      });
      if (!ok) return null;
      if (ok === "date") {
        const nuovi = nuoviAnni();
        if (!nuovi.length) {
          GB.toast("Indica prima un intervallo di anni ancora da creare", "err");
          continue;
        }
        const r = await GB.chiediDateEsercizi({
          righe: [{ id: 1, nome: "Date di chiusura" }],
          anni: nuovi,
          iniziali: { 1: dateAnno },
        });
        if (r) dateAnno = r[1] || {};
        aggiorna();
        continue;
      }
      const { x, y } = valori();
      let err = null;
      if (!annoOk(x) || !annoOk(y)) err = "Indica anni tra 1990 e 2100";
      else if (y < x) err = "L'anno finale deve essere uguale o successivo a quello iniziale";
      else if (y - x + 1 > MAX_ANNI) err = `Al massimo ${MAX_ANNI} anni alla volta`;
      if (err) {
        GB.toast(err, "err");
        continue;
      }
      const iso = campo.get(true); // data non valida: avviso e la finestra si riapre
      if (iso === null) continue;
      const date = {};
      for (const n of nuoviAnni()) if (dateAnno[n]) date[n] = dateAnno[n];
      return { da: x, a: y, data: iso ? iso.slice(8) + "/" + iso.slice(5, 7) : "", date };
    }
  };

  GB.aggiungiAnniMultipli = async () => {
    if (!S.clienteId) return;
    const r = await GB.chiediAnniMultipli();
    if (!r) return;
    try {
      const out = await S.addAnni(r.da, r.a, r.data, r.date);
      GB.toast(
        out.creati.length
          ? `${out.creati.length} esercizi creati (${out.creati.join(", ")})` +
              (out.saltati.length ? ` · ${out.saltati.length} già presenti` : "")
          : "Nessun esercizio creato: gli anni indicati esistono già",
      );
    } catch (e) {
      /* toast già mostrato */
    }
  };
})();
