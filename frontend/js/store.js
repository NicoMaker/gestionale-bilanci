/* Stato applicazione: clienti, cliente/anno selezionati, dataset, risultati di calcolo. */
(function () {
  const GB = window.GB;
  const { api } = GB;
  const listeners = {};
  const DEF_PAR = {
    peso_vendite: 1,
    inflazione: 0,
    produttivita: 0,
    imposte_budget: 0,
    investimento: 0,
    aumento_utile: 0,
    saldo_iniziale_cf: 0,
  };

  const S = (GB.store = {
    clienti: [],
    clienteId: null,
    cliente: null,
    anno: null,
    ds: null,
    R: null,
    anni: [],

    on(ev, fn) {
      (listeners[ev] = listeners[ev] || []).push(fn);
    },
    emit(ev, p) {
      (listeners[ev] || []).forEach((fn) => fn(p));
    },

    /* ── clienti ── */
    async loadClienti() {
      S.clienti = await api.get("/clienti");
      S.emit("clienti");
      return S.clienti;
    },

    async select(id, anno) {
      if (!id) {
        S.clienteId = null;
        S.cliente = null;
        S.ds = null;
        S.R = null;
        S.anni = [];
        S.anno = null;
        localStorage.removeItem("gb.cliente");
        S.emit("context");
        return;
      }
      const raw = await api.get(`/clienti/${id}/dataset`);
      S.clienteId = id;
      S.cliente = raw.cliente;
      S.ds = window.Calc.buildDs(raw);
      S.anni = window.Calc.anni(S.ds);
      const saved = Number(localStorage.getItem("gb.anno." + id));
      S.anno =
        anno ||
        (S.anni.includes(saved)
          ? saved
          : S.anni[S.anni.length - 1] || raw.cliente.anno_base);
      localStorage.setItem("gb.cliente", id);
      S.recompute();
      S.emit("context");
    },
    async reload() {
      return S.select(S.clienteId, S.anno);
    },

    setYear(y) {
      S.anno = Number(y);
      localStorage.setItem("gb.anno." + S.clienteId, S.anno);
      S.recompute();
      S.emit("context");
    },

    recompute() {
      if (!S.ds) return;
      S.anni = window.Calc.anni(S.ds);
      S.R = window.Calc.compute(S.ds, S.anno);
    },
    changed() {
      S.recompute();
      S.emit("calc");
    },

    async _save(promise) {
      try {
        return await promise;
      } catch (e) {
        GB.toast(e.message, "err");
        await S.reload();
        throw e;
      }
    },

    /* ── celle ── */
    saveValore(voceId, anno, v) {
      const o = (S.ds.val[voceId] = S.ds.val[voceId] || {});
      if (v === null) delete o[anno];
      else o[anno] = v;
      S.changed();
      return S._save(
        api.put(`/clienti/${S.clienteId}/valore`, {
          voce_id: voceId,
          anno,
          importo: v,
        }),
      );
    },
    saveBudgetVar(voceId, anno, v) {
      const o = (S.ds.bvar[voceId] = S.ds.bvar[voceId] || {});
      if (v === null) delete o[anno];
      else o[anno] = v;
      S.changed();
      return S._save(
        api.put(`/clienti/${S.clienteId}/budget-var`, {
          voce_id: voceId,
          anno,
          valore: v,
        }),
      );
    },
    saveVendita(anno, mese, v) {
      const a = (S.ds.vend[anno] = S.ds.vend[anno] || Array(12).fill(0));
      a[mese - 1] = v === null ? 0 : v;
      S.changed();
      return S._save(
        api.put(`/clienti/${S.clienteId}/vendite`, { anno, mese, importo: v }),
      );
    },
    saveCashflow(voceId, anno, mese, v) {
      const o = (S.ds.cf[voceId] = S.ds.cf[voceId] || {});
      const a = (o[anno] = o[anno] || Array(12).fill(0));
      a[mese - 1] = v === null ? 0 : v;
      S.changed();
      return S._save(
        api.put(`/clienti/${S.clienteId}/cashflow`, {
          voce_id: voceId,
          anno,
          mese,
          importo: v,
        }),
      );
    },
    saveParam(anno, campo, v) {
      const row = (S.ds.par[anno] = Object.assign(
        {},
        DEF_PAR,
        S.ds.par[anno] || {},
      ));
      row[campo] = v === null ? DEF_PAR[campo] : v;
      S.changed();
      return S._save(
        api.put(`/clienti/${S.clienteId}/parametri`, {
          anno,
          campo,
          valore: v,
        }),
      );
    },

    /* ── voci (righe di conto) ── */
    async addVoce(ambito, sezione, extra) {
      const v = await S._save(
        api.post(
          `/clienti/${S.clienteId}/voci`,
          Object.assign({ ambito, sezione }, extra || {}),
        ),
      );
      S.ds.voci = S.ds.voci.concat(v);
      GB.focusVoce = v.id;
      S.recompute();
      S.emit("structure");
      return v;
    },
    async updateVoce(id, patch) {
      const v = S.ds.voci.find((x) => x.id === id);
      Object.assign(v, patch);
      if ("tipo" in patch) S.changed();
      return S._save(api.put(`/voci/${id}`, patch));
    },
    async deleteVoce(id) {
      await S._save(api.del(`/voci/${id}`));
      S.ds.voci = S.ds.voci.filter((x) => x.id !== id);
      delete S.ds.val[id];
      delete S.ds.bvar[id];
      delete S.ds.cf[id];
      S.recompute();
      S.emit("structure");
    },

    /* ── anni ── */
    async addAnno() {
      const r = await S._save(api.post(`/clienti/${S.clienteId}/anni`, {}));
      S.ds.par[r.anno] = Object.assign({}, DEF_PAR);
      S.anno = r.anno;
      localStorage.setItem("gb.anno." + S.clienteId, S.anno);
      S.recompute();
      S.emit("context");
      return r.anno;
    },
    async deleteAnno(anno, conConferma) {
      await S._save(
        api.del(
          `/clienti/${S.clienteId}/anni/${anno}` +
            (conConferma ? "?conferma=1" : ""),
        ),
      );
      S.anno = null;
      await S.select(S.clienteId, null);
    },
  });
})();
