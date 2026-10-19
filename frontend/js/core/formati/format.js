/* Formattazione e lettura dei numeri in italiano (1.234,56). */
(function () {
  const GB = window.GB;

  /* ───────── formattazione (it-IT) ───────── */
  const nf = {};
  function nfmt(dec) {
    return (
      nf[dec] ||
      (nf[dec] = new Intl.NumberFormat("it-IT", {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      }))
    );
  }
  const fmt = {
    // importo con decimali; null/undefined → ""
    num(x, dec = 2) {
      return x === null || x === undefined || !isFinite(x)
        ? ""
        : nfmt(dec).format(Math.abs(x) < 0.5 * Math.pow(10, -dec) ? 0 : x);
    },
    int(x) {
      return fmt.num(x, 0);
    },
    eur(x, dec = 0) {
      return x === null || x === undefined || !isFinite(x)
        ? "–"
        : nfmt(dec).format(x) + " €";
    },
    // frazione → percentuale (0.123 → 12,30 %)
    pct(x, dec = 2) {
      return x === null || x === undefined || !isFinite(x)
        ? ""
        : nfmt(dec).format(x * 100) + " %";
    },
    // valore già espresso in punti percentuali (12.3 → 12,30)
    pt(x, dec = 2) {
      return x === null || x === undefined || !isFinite(x)
        ? ""
        : nfmt(dec).format(x);
    },
    short(x) {
      if (x === null || x === undefined || !isFinite(x)) return "";
      const a = Math.abs(x);
      if (a >= 1e6)
        return (x / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(".", ",") + " M";
      if (a >= 1e3) return (x / 1e3).toFixed(0) + " k";
      return String(Math.round(x));
    },
    data(d) {
      return new Date(d.replace(" ", "T") + "Z").toLocaleDateString("it-IT");
    },
  };
  GB.fmt = fmt;

  // "1.234,56" | "1234,56" | "1234.56" | "-1.234" | "(500)" → numero ; vuoto → null ; non valido → NaN
  function parseNum(str) {
    let s = String(str ?? "")
      .trim()
      .replace(/\s|€|%/g, "");
    if (s === "") return null;
    let neg = false;
    if (/^\(.*\)$/.test(s)) {
      neg = true;
      s = s.slice(1, -1);
    }
    if (s.startsWith("-")) {
      neg = !neg;
      s = s.slice(1);
    } else if (s.startsWith("+")) s = s.slice(1);
    if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    if (!/^\d*\.?\d+$|^\d+\.$/.test(s)) return NaN;
    const v = parseFloat(s);
    return neg ? -v : v;
  }
  GB.parseNum = parseNum;
})();
