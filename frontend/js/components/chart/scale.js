/* Scala «gradevole»: sceglie un passo tondo e i valori delle tacche dell'asse. */
(function () {
  const GB = window.GB;

  function niceScale(min, max, ticks = 4) {
    if (min === max) {
      max = min + 1;
    }
    const range = max - min;
    const rough = range / ticks;
    const mag = Math.pow(10, Math.floor(Math.log10(rough)));
    const norm = rough / mag;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step,
      hi = Math.ceil(max / step) * step;
    const vals = [];
    for (let v = lo; v <= hi + step / 2; v += step)
      vals.push(Math.round(v / step) * step);
    return { lo, hi, vals };
  }
  GB.niceScale = niceScale;
})();
