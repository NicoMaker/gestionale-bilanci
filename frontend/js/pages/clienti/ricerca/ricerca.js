/* Ricerca cliente (ragione sociale, P.IVA, anni, note) senza distinguere maiuscole e accenti, con evidenziazione dei termini. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.parts.clienti.ricerca = function (S) {
    const plain = GB.plain;
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const searchIn = (c) =>
      plain(
        [
          c.ragione_sociale,
          c.partita_iva,
          c.anno_base,
          (c.anni || []).join(" "),
          c.note,
        ].join(" "),
      );
    const hay = new Map(S.clienti.map((c) => [c.id, searchIn(c)]));
    // evidenzia nel testo i termini cercati (le lettere accentate mantengono la stessa lunghezza dopo la normalizzazione)
    const hl = (text, toks) => {
      const t = String(text);
      if (!toks.length) return t;
      const re = new RegExp("(" + toks.map(esc).join("|") + ")", "gi");
      const p = plain(t);
      if (p.length !== t.length) return t;
      const out = [];
      let last = 0,
        m;
      const reP = new RegExp(re.source, "gi");
      while ((m = reP.exec(p)) && m[0]) {
        out.push(
          t.slice(last, m.index),
          h("mark", { class: "hl" }, t.slice(m.index, m.index + m[0].length)),
        );
        last = m.index + m[0].length;
      }
      out.push(t.slice(last));
      return out;
    };
    return { plain, hay, hl };
  };
})();
