/* Formattazione di una cella per tipo (num, num2, pct, pt, text); i valori vuoti restano vuoti. */
(function () {
  const GB = window.GB;
  const { h, fmt } = GB;

  GB.multiShow = (kind, v) => {
    if (
      v === null ||
      v === undefined ||
      (typeof v === "number" && !isFinite(v))
    )
      return "";
    switch (kind) {
      case "pct":
        return v === 0 ? "–" : fmt.pct(v, 1); // frazione → 12,3 %
      case "pt":
        return v === 0 ? "–" : fmt.pt(v, 1) + " %"; // già in punti percentuali
      case "num2":
        return v === 0 ? "–" : fmt.num(v, 2);
      case "text":
        return String(v);
      default:
        return v === 0 ? "–" : fmt.num(v, 0);
    }
  };
})();
