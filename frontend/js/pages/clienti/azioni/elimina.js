/* Azione «Elimina»: senza dati conferma semplice, con dati chiede di digitare la ragione sociale. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;
  const S = GB.store;

  const norm = (x) =>
    String(x || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  GB.parts.clienti.azioni.elimina = async (c) => {
    let d;
    try {
      d = await GB.api.get(`/clienti/${c.id}/dati`);
    } catch (e) {
      GB.toast(e.message, "err");
      return;
    }
    let url = "/clienti/" + c.id;
    if (!d.ha_dati) {
      if (
        !(await GB.confirm(
          `“${c.ragione_sociale}” non contiene dati. Spostare il cliente nel cestino? (ripristinabile per 15 giorni)`,
        ))
      )
        return;
    } else {
      const inp = h("input", {
        placeholder: c.ragione_sociale,
        autocomplete: "off",
      });
      const body = h(
        "div",
        null,
        h(
          "p",
          null,
          `⚠️ “${c.ragione_sociale}” contiene ${d.totale} dati inseriti. Verrà spostato nel cestino e potrai ripristinarlo, con tutti i suoi dati, entro 15 giorni:`,
        ),
        GB.riepilogoDati(d),
        h(
          "p",
          { class: "small muted" },
          "Passati 15 giorni il cliente e i suoi dati vengono eliminati definitivamente.",
        ),
        h(
          "div",
          { class: "field", style: { marginTop: "12px" } },
          h("label", null, "Digita la ragione sociale per confermare"),
          inp,
        ),
      );
      for (;;) {
        const r = await GB.modal({
          title: "Elimina cliente con dati",
          body,
          buttons: [
            { label: "Annulla", value: false },
            {
              label: "Sposta nel cestino",
              kind: "danger",
              value: true,
            },
          ],
        });
        if (!r) return;
        if (norm(inp.value) === norm(c.ragione_sociale)) break;
        GB.toast("La ragione sociale digitata non coincide", "err");
      }
      url += "?conferma=" + encodeURIComponent(c.ragione_sociale);
    }
    try {
      await GB.api.del(url);
      await S.loadClienti();
      if (S.clienteId === c.id)
        await S.select(S.clienti[0] ? S.clienti[0].id : null);
      GB.deleted(`Cliente «${c.ragione_sociale}» eliminato`);
    } catch (e) {
      GB.toast(e.message, "err");
    }
  };
})();
