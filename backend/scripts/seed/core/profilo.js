/* Genera un bilancio coerente partendo da pochi parametri «di rischio».
   knobs: ricavi (array per anno, null = anno vuoto), margine (utile / ricavi), cr (current ratio),
          pn (patrimonio netto / totale passivo), oneri (oneri finanziari / ricavi), t (totale attivo / ricavi).
   Opzionali: quote = {acq, prod, comm, amm, ammo} (costi in % dei ricavi; il personale è il residuo),
              s = {immMat, rimanenze, crediti, liquidita} (struttura dell'attivo in % del totale; devono sommare 1,05 perché il fondo ammortamento vale −0,05).
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
  quote,
  s,
}) {
  const q = { acq: 0.45, prod: 0.1, comm: 0.05, amm: 0.04, ammo: 0.03, ...quote };
  const st = { immMat: 0.4, rimanenze: 0.1, crediti: 0.3, liquidita: 0.25, ...s };
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
    const acq = q.acq * R,
      prod = q.prod * R,
      comm = q.comm * R,
      amm = q.amm * R,
      ammo = q.ammo * R;
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
        rimIniz: st.rimanenze * T,
        rimFin: st.rimanenze * T,
      },
      sp: {
        immMat: st.immMat * T,
        fondoMat: -0.05 * T,
        rimanenze: st.rimanenze * T,
        crediti: st.crediti * T,
        liquidita: st.liquidita * T,
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
