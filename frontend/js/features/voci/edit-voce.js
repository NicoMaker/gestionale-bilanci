/* Modifica con la matita ✏️ di una riga di tabella: righe di conto (S.P./C.E.), cash flow, budget, vendite e parametri.
   Ogni funzione apre la finestra «Modifica riga», salva solo ciò che è cambiato e ridisegna la pagina. */
(function () {
  const GB = window.GB;
  const S = GB.store;
  const T = window.Template;
  const { changedVal } = GB;

  const val = (o, ...k) => k.reduce((x, y) => (x == null ? x : x[y]), o);
  const zero = (x) => x || 0;

  // esegue i salvataggi, poi ridisegna la pagina (gli errori sono già segnalati da S._save)
  async function applica(jobs) {
    if (!jobs.length) return;
    try {
      await Promise.all(jobs);
    } catch (e) {
      return;
    }
    GB.toast("Salvato");
    S.emit("structure");
  }

  const opzioniTipo = [{ v: "", label: "—" }].concat(
    T.TIPI.map((t) => ({ v: t.v, label: t.d })),
  );

  // campi comuni: descrizione (+ codice, + tipo)
  function campiVoce(v, { codice = false, tipo = false } = {}) {
    const f = [];
    if (codice)
      f.push({
        key: "codice",
        label: "Codice",
        type: "text",
        value: v.codice || "",
      });
    f.push({
      key: "descrizione",
      label: "Descrizione",
      type: "text",
      value: v.descrizione || "",
    });
    if (tipo)
      f.push({
        key: "tipo",
        label: "Tipo riga (usato in Budget e Punto di pareggio)",
        type: "select",
        value: (v.tipo || "").toUpperCase(),
        options: opzioniTipo,
      });
    return f;
  }

  function patchVoce(v, r) {
    const patch = {};
    if ("codice" in r && r.codice !== (v.codice || "")) patch.codice = r.codice;
    if ("descrizione" in r && r.descrizione !== (v.descrizione || ""))
      patch.descrizione = r.descrizione;
    if ("tipo" in r && r.tipo !== (v.tipo || "").toUpperCase())
      patch.tipo = r.tipo;
    return Object.keys(patch).length ? [S.updateVoce(v.id, patch)] : [];
  }

  /* Stato Patrimoniale / Conto Economico: codice, descrizione, tipo (solo C.E.) e importo di ogni esercizio */
  GB.editVoce = async (v, { tipo = false, years = [] } = {}) => {
    const fields = campiVoce(v, { codice: true, tipo }).concat(
      years.map((a) => ({
        key: "y" + a,
        label: "Esercizio " + a,
        type: "num",
        value: val(S.ds.val, v.id, a) ?? null,
      })),
    );
    const r = await GB.editRow({ title: "Modifica riga", fields });
    if (!r) return;
    const jobs = patchVoce(v, r);
    years.forEach((a) => {
      if (changedVal(r["y" + a], val(S.ds.val, v.id, a)))
        jobs.push(S.saveValore(v.id, a, r["y" + a]));
    });
    await applica(jobs);
  };

  /* Cash flow: descrizione e i 12 mesi dell'anno di riferimento Y */
  GB.editVoceCashflow = async (v, Y) => {
    const fields = campiVoce(v).concat(
      T.MESI.map((mese, m) => ({
        key: "m" + m,
        label: mese,
        type: "num",
        value: val(S.ds.cf, v.id, Y, m) || null,
      })),
    );
    const r = await GB.editRow({
      title: "Modifica riga — Cash Flow " + (Y + 1),
      intro: "Le uscite vanno inserite con segno negativo.",
      fields,
    });
    if (!r) return;
    const jobs = patchVoce(v, r);
    T.MESI.forEach((_, m) => {
      if (zero(r["m" + m]) !== zero(val(S.ds.cf, v.id, Y, m)))
        jobs.push(S.saveCashflow(v.id, Y, m + 1, r["m" + m]));
    });
    await applica(jobs);
  };

  /* Budget: descrizione, tipo e variazione manuale dell'anno di riferimento Y */
  GB.editVoceBudget = async (v, Y) => {
    const fields = campiVoce(v, { tipo: true }).concat({
      key: "var",
      label: "Variazione manuale",
      type: "num",
      value: val(S.ds.bvar, v.id, Y) ?? null,
      hint: "Vuoto = fattore del tipo · decimale (1,10 / 0,95) = moltiplicatore · intero (5000 / −2000) = importo sommato.",
    });
    const r = await GB.editRow({
      title: "Modifica riga — Budget " + (Y + 1),
      fields,
    });
    if (!r) return;
    const jobs = patchVoce(v, r);
    if (changedVal(r.var, val(S.ds.bvar, v.id, Y)))
      jobs.push(S.saveBudgetVar(v.id, Y, r.var));
    await applica(jobs);
  };

  /* Vendite: i ricavi di un mese per ogni esercizio */
  GB.editMeseVendite = async (m, years) => {
    const fields = years.map((a) => ({
      key: "y" + a,
      label: "Esercizio " + a,
      type: "num",
      value: val(S.ds.vend, a, m) || null,
    }));
    const r = await GB.editRow({
      title: "Modifica vendite — " + T.MESI[m],
      fields,
    });
    if (!r) return;
    const jobs = [];
    years.forEach((a) => {
      if (zero(r["y" + a]) !== zero(val(S.ds.vend, a, m)))
        jobs.push(S.saveVendita(a, m + 1, r["y" + a]));
    });
    await applica(jobs);
  };

  /* Parametri annuali: uno o più campi di parametri_anno per UN anno (imposte budget, saldo banca, inflazione…) */
  GB.editParams = async ({ title, intro, anno, campi }) => {
    const cur = (c) => val(S.ds.par, anno, c) ?? GB.DEF_PAR[c];
    const r = await GB.editRow({
      title,
      intro,
      fields: campi.map((c) => ({
        key: c.campo,
        label: c.label,
        type: "num",
        dec: c.dec,
        hint: c.hint,
        value: cur(c.campo) || null,
      })),
    });
    if (!r) return;
    const jobs = [];
    campi.forEach((c) => {
      if (zero(r[c.campo]) !== zero(cur(c.campo)))
        jobs.push(S.saveParam(anno, c.campo, r[c.campo] ?? 0));
    });
    await applica(jobs);
  };

  /* Parametro per più esercizi (es. peso delle vendite) */
  GB.editParamAnni = async ({ title, intro, campo, dec, years }) => {
    const cur = (a) => val(S.ds.par, a, campo) ?? GB.DEF_PAR[campo];
    const r = await GB.editRow({
      title,
      intro,
      fields: years.map((a) => ({
        key: "y" + a,
        label: "Esercizio " + a,
        type: "num",
        dec,
        value: cur(a),
      })),
    });
    if (!r) return;
    const jobs = [];
    years.forEach((a) => {
      if (changedVal(r["y" + a], cur(a)))
        jobs.push(S.saveParam(a, campo, r["y" + a]));
    });
    await applica(jobs);
  };
})();
