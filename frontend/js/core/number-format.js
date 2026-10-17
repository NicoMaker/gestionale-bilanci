/* Formattazione dei numeri mentre si scrive (punti delle migliaia automatici) e segno positivo/negativo. */
(function () {
  const GB = window.GB;

  /* ───────── input numerico a cella ───────── */
  const group = (digits) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  // numero → testo modificabile con separatori (1234.5 → "1.234,5")
  const editText = (n) => {
    if (n === null || n === undefined || !isFinite(n)) return "";
    const neg = n < 0;
    const [i, d] = String(Math.abs(n)).split(".");
    return (neg ? "-" : "") + group(i) + (d ? "," + d : "");
  };
  // classe colore in base al testo: "pos" | "neg" | ""
  const signOf = (txt) => {
    const t = String(txt || "").replace(/[\s\u00a0€%]/g, "");
    if (!/^[-−(]?\d[\d.]*(,\d+)?\)?$/.test(t) || !/[1-9]/.test(t)) return "";
    return /^[-−(]/.test(t) ? "neg" : "pos";
  };
  GB.signOf = signOf;
  const paintInput = (el) => {
    const c = signOf(el.value);
    el.classList.toggle("neg", c === "neg");
    el.classList.toggle("pos", c === "pos");
  };

  /* Mentre si scrive: punti delle migliaia automatici (1.234.567,89).
     Il "." digitato a mano vale come virgola decimale; la virgola resta il decimale.
     Il cursore resta sulla stessa cifra anche dopo la riformattazione. */
  function liveFormat(el, ev) {
    const raw = el.value;
    let caret = el.selectionStart == null ? raw.length : el.selectionStart;
    const neg = /^\s*[-−(]/.test(raw);
    let txt = raw,
      before = raw.slice(0, caret);
    const typedDot = ev && ev.inputType === "insertText" && ev.data === ".";
    if (typedDot) {
      // il punto appena digitato è un decimale (se non c'è già una virgola), altrimenti si scarta
      const hasComma = raw.indexOf(",") !== -1;
      const rep = hasComma ? "" : ",";
      txt = raw.slice(0, caret - 1) + rep + raw.slice(caret);
      before = raw.slice(0, caret - 1) + rep;
    } else if (
      ev &&
      /^insertFrom/.test(ev.inputType || "") &&
      raw.indexOf(",") === -1 &&
      !/^\s*[-−(]?\d{1,3}(\.\d{3})+\s*\)?$/.test(raw) &&
      (raw.match(/\./g) || []).length === 1
    ) {
      // testo incollato tipo "1234.56": il punto singolo è decimale
      txt = raw.replace(".", ",");
      before = before.replace(".", ",");
    }
    const clean = (x) => x.replace(/[^\d,]/g, "");
    let t = clean(txt);
    const ci = t.indexOf(",");
    if (ci !== -1) t = t.slice(0, ci + 1) + t.slice(ci + 1).replace(/,/g, "");
    let sig = clean(before).length;
    if (ci !== -1) {
      // una seconda virgola prima del cursore non conta
      const b = clean(before);
      const first = b.indexOf(",");
      sig =
        first === -1
          ? b.length
          : first + 1 + b.slice(first + 1).replace(/,/g, "").length;
    }
    const hasDec = t.indexOf(",") !== -1;
    let [ip, dp] = t.split(",");
    ip = ip.replace(/^0+(?=\d)/, "");
    let out = (neg ? "-" : "") + group(ip) + (hasDec ? "," + (dp || "") : "");
    if (out === "-" && !ip) out = "-";
    if (out !== raw) {
      el.value = out;
      let i = 0,
        c = 0;
      while (i < out.length && c < sig) {
        if (/[\d,]/.test(out[i])) c++;
        i++;
      }
      if (sig === 0) i = neg ? 1 : 0;
      try {
        el.setSelectionRange(i, i);
      } catch (e) {
        /* ignore */
      }
    }
  }
  GB.liveFormat = liveFormat;

  GB.numFmt = { group, editText, signOf, paintInput, liveFormat };
})();
