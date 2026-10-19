/* Scheda anagrafica: ragione sociale, P.IVA, anno base e note. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.dashboard.schedaCliente = function (S) {
    return h(
      "div",
      { class: "card", style: { marginBottom: "18px" } },
      h(
        "div",
        {
          class: "card-b",
          style: {
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
            alignItems: "center",
          },
        },
        h(
          "div",
          null,
          h("div", { class: "small muted" }, "Cliente"),
          h(
            "div",
            {
              style: {
                fontFamily: "var(--serif)",
                fontSize: "22px",
                fontWeight: 600,
              },
            },
            S.cliente.ragione_sociale,
          ),
        ),
        h(
          "div",
          null,
          h("div", { class: "small muted" }, "P.IVA"),
          h("div", null, S.cliente.partita_iva || "—"),
        ),
        h(
          "div",
          null,
          h("div", { class: "small muted" }, "Anno base"),
          h("div", null, String(S.cliente.anno_base)),
        ),
        S.cliente.note
          ? h(
              "div",
              { style: { flex: 1, minWidth: "200px" } },
              h("div", { class: "small muted" }, "Note"),
              h("div", null, S.cliente.note),
            )
          : null,
      ),
    );
  };
})();
