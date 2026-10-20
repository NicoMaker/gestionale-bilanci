/* Eliminazione di una riga di conto, con conferma se contiene dati. */
(function () {
  const GB = window.GB;
  const { h } = GB;

  // elimina una riga: se non contiene dati si elimina subito, altrimenti si chiede conferma indicando quanti valori si perdono
  GB.deleteVoceFlow = async (v, extra = "") => {
    const S = GB.store;
    const nz = (o) =>
      Object.values(o || {}).filter((x) => x !== null && x !== undefined)
        .length;
    let n = nz(S.ds.val[v.id]) + nz(S.ds.bvar[v.id]);
    for (const arr of Object.values(S.ds.cf[v.id] || {}))
      n += arr.filter((x) => x).length;
    if (n === 0) return S.deleteVoce(v.id).catch(() => {});
    if (
      await GB.confirm(
        `La riga “${v.descrizione || "(senza nome)"}” contiene ${n} valori inseriti. Eliminarla insieme ai suoi dati? Finisce nel cestino e la puoi ripristinare entro 15 giorni.${extra}`,
      )
    )
      S.deleteVoce(v.id).catch(() => {});
  };

  GB.xBtn = ({ title, onclick }) =>
    h(
      "button",
      { type: "button", class: "xbtn no-ro no-print", title, onclick },
      "✕",
    );

  // azzera uno o più parametri di un anno (saldo banca, imposte, inflazione…) con conferma
  GB.clearParamsFlow = async (anno, campi, nome) => {
    const S = GB.store;
    const attivo = campi.some(
      (c) => (S.ds.par[anno] || {})[c] && S.ds.par[anno][c] !== 0,
    );
    if (!attivo) return GB.toast("Già a zero");
    if (!(await GB.confirm(`Azzerare ${nome}?`, "Azzera"))) return;
    S.clearParams(anno, campi).catch(() => {});
  };
})();
