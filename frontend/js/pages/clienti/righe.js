/* Righe della tabella: filtro per ricerca, evidenziazione, penna ✏️ accanto al nome per modificare, pulsanti Apri 📂 / Elimina 🗑️ e riga «nessun risultato». */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.clienti.righe = function ({
    S,
    input,
    wrap,
    tb,
    count,
    hay,
    hl,
    plain,
  }) {
    const { apri, modifica, elimina } = GB.parts.clienti.azioni;
    function paintRows() {
      const q = input.value;
      GB.clientiQuery = q;
      const toks = plain(q).split(/\s+/).filter(Boolean);
      wrap.classList.toggle("has-value", !!q);
      const rows = S.clienti.filter((c) =>
        toks.every((k) => hay.get(c.id).includes(k)),
      );
      tb.replaceChildren(
        ...(rows.length
          ? rows.map((c) =>
              h(
                "tr",
                {
                  class: "line",
                  style: { fontWeight: c.id === S.clienteId ? 700 : 400 },
                },
                h(
                  "td",
                  { class: "l client-name" },
                  hl(c.ragione_sociale, toks),
                  c.id === S.clienteId ? "  ◀ selezionato" : "",
                  h(
                    "button",
                    {
                      type: "button",
                      class: "edit-pen no-print",
                      title: "Modifica cliente",
                      "aria-label": "Modifica " + c.ragione_sociale,
                      onclick: () => modifica(c),
                    },
                    "✏️",
                  ),
                ),
                h(
                  "td",
                  { class: "l" },
                  c.partita_iva ? hl(c.partita_iva, toks) : "—",
                ),
                h("td", { class: "n" }, String(c.anno_base)),
                h("td", { class: "l" }, (c.anni || []).join(", ")),
                h("td", { class: "l" }, fmt.data(c.created_at)),
                h(
                  "td",
                  {
                    class: "no-print",
                    style: { textAlign: "right", whiteSpace: "nowrap" },
                  },
                  h(
                    "button",
                    { class: "btn sm primary", onclick: () => apri(c) },
                    h(
                      "span",
                      { class: "btn-ico", "aria-hidden": "true" },
                      "📂",
                    ),
                    "Apri",
                  ),
                  " ",
                  h(
                    "button",
                    { class: "btn sm danger", onclick: () => elimina(c) },
                    h(
                      "span",
                      { class: "btn-ico", "aria-hidden": "true" },
                      "🗑️",
                    ),
                    "Elimina",
                  ),
                ),
              ),
            )
          : [
              h(
                "tr",
                { class: "no-results" },
                h(
                  "td",
                  { colspan: 6 },
                  `Nessun cliente trovato per “${q.trim()}”`,
                ),
              ),
            ]),
      );
      count.textContent = toks.length
        ? `${rows.length} di ${S.clienti.length} clienti`
        : `${S.clienti.length} client${S.clienti.length === 1 ? "e" : "i"}`;
      return rows;
    }
    return paintRows;
  };
})();
