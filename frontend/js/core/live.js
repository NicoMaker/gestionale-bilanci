/* Celle "live" ricalcolate quando cambiano i dati, e helper per mostrare numeri. */
(function () {
  const GB = window.GB;
  const { fmt } = GB;

  /* ───────── celle "live" (ricalcolate quando cambiano i dati) ───────── */
  GB.live = function () {
    const items = [];
    return {
      add(el, fn) {
        items.push([el, fn]);
        try {
          fn(el);
        } catch (e) {
          console.error(e);
        }
        return el;
      },
      update() {
        for (const [el, fn] of items) {
          try {
            fn(el);
          } catch (e) {
            console.error(e);
          }
        }
      },
    };
  };
  // helper: imposta testo + classe neg
  GB.setNum = (el, v, dec = 2) => {
    el.textContent = fmt.num(v, dec);
    const nz = v !== null && v !== undefined && isFinite(v) && Math.abs(v) >= 0.5 * Math.pow(10, -dec);
    el.classList.toggle("neg", nz && v < 0);
    el.classList.toggle("pos", nz && v > 0);
  };
})();
