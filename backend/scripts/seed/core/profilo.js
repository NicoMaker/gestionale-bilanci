/* Genera un bilancio coerente partendo da pochi parametri «di rischio».
   knobs: ricavi (array per anno, null = anno vuoto), margine (utile / ricavi), cr (current ratio),
          pn (patrimonio netto / totale passivo), oneri (oneri finanziari / ricavi), t (totale attivo / ricavi).
   Restituisce { ce, sp } (ogni campo è un array per anno) da passare a ctx.bilancio({...ce, ...sp}). */
const r2 = (x) => Math.round(x * 100) / 100;
const at = (x, i) => (Array.isArray(x) ? x[i] : x);

function profilo({
  ricavi,
  margine = 0.06,
  cr = 1.4,
  pn = 0.25,
  oneri = 0.03,
  t = 1,
  tipi,
}) {
  const ce = {},
    sp = {};
  const campi = (o, k, v) => (o[k] = o[k] || []).push(v);
  ricavi.forEach((R, i) => {
    const vuoto = R == null;
    const m = at(margine, i);
    const T = vuoto ? 0 : t * R;
    const oneriFin = vuoto ? 0 : oneri * R;
    const utile = vuoto ? 0 : m * R;
    const ante = utile > 0 ? utile / 0.75 : utile; // imposte 25% solo se c'è utile
    const imposte = utile > 0 ? ante - utile : 0;
    const acq = 0.45 * R,
      prod = 0.1 * R,
      comm = 0.05 * R,
      amm = 0.04 * R,
      ammo = 0.03 * R;
    const personale = vuoto
      ? 0
      : R - acq - prod - comm - amm - ammo - oneriFin - ante;
    const pc = vuoto ? 0 : (0.65 * T) / cr;
    const PN = pn * T;
    const val = {
      ce: {
        ricavi: R,
        acquisti: acq,
        produttivi: prod,
        personale,
        commerciali: comm,
        amministrativi: amm,
        ammortamenti: ammo,
        oneriFin,
        imposte,
        rimIniz: 0.1 * T,
        rimFin: 0.1 * T,
      },
      sp: {
        immMat: 0.4 * T,
        fondoMat: -0.05 * T,
        rimanenze: 0.1 * T,
        crediti: 0.3 * T,
        liquidita: 0.25 * T,
        capitale: PN / 2,
        fornitori: pc / 2,
        banche: pc / 2,
        mutui: Math.max(0, T - PN - pc),
      },
    };
    for (const [o, dest] of [
      ["ce", ce],
      ["sp", sp],
    ])
      for (const k of Object.keys(val[o]))
        campi(dest, k, vuoto ? null : r2(val[o][k]));
  });
  if (tipi) ce.tipi = tipi;
  return { ce, sp };
}

module.exports = { profilo };
