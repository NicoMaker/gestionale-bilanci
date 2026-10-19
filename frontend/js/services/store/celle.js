/* Store: salvataggio delle celle (valori, variazioni budget, vendite, cash flow, parametri). */
(function () {
  const GB = window.GB;
  const { api } = GB;
  const S = GB.store;
  const DEF_PAR = GB.DEF_PAR;

  Object.assign(S, {
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
  });
})();
