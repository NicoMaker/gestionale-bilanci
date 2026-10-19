/* Cash flow dell'anno successivo a quello base, ricavato dal bilancio dell'ultimo esercizio e dalla stagionalità del cliente. */
const { r2, curvaAnno } = require("./random");

const neg = (a) => a.map((x) => (x ? -x : 0));
const trimestri = (v) => [v, 0, 0, v, 0, 0, v, 0, 0, v, 0, 0];

function popolaCashFlow(ctx, spec, o, rand, curvaBase) {
  const { ce, sp } = o; // valori originali dell'ultimo esercizio (prima di spezzare in dettaglio)
  const cf = spec.cf || {};
  const g = cf.cresc ?? 1.03;
  const anno = ctx.anni[ctx.anni.length - 1];
  const L = (a) => (a && a[a.length - 1]) || 0;
  const R = L(ce.ricavi), acq = L(ce.acquisti), prod = L(ce.produttivi);
  const pers = L(ce.personale), comm = L(ce.commerciali), amm = L(ce.amministrativi);
  const imposte = L(ce.imposte), mutui = L(sp.mutui);

  const curva = curvaAnno(curvaBase, rand, 0.03);
  const ripartisci = (annuo) => curva.map((p) => r2((annuo * p) / 100));
  const costante = (annuo) => Array(12).fill(r2(annuo / 12));

  // salari su 13 mensilità (dicembre doppio)
  const mensilita = r2(pers / 13);
  const salari = Array.from({ length: 12 }, (_, m) => (m === 11 ? mensilita * 2 : mensilita));

  const std = {
    incassi: ripartisci(R * g),
    fornitori: neg(ripartisci((acq + prod * 0.6) * g)),
    salari: neg(salari),
    iva: neg(trimestri(r2(R * 0.006))),
    energia: neg(costante(prod * 0.1 * g)),
    rate: neg(costante(mutui * 0.11 * 0.6)), // capitale + interessi ≈ 11% del debito residuo
  };
  if (cf.mutuo) std.mutuo = [0, 0, cf.mutuo, ...Array(9).fill(0)];
  if (cf.soci) std.soci = [cf.soci, ...Array(11).fill(0)];
  ctx.cashflow(anno, std);

  const riga = (sez, descr, valori, opz) => ctx.cfRiga(anno, sez, descr, valori, opz);
  // seconda rata di mutuo e altre voci predefinite
  riga("CF_U_RATE", "Rata Finanziamento Banca 2", neg(costante(mutui * 0.11 * 0.4)));
  if (comm) riga("CF_U_ALTRE", "Provvigioni Passive", neg(costante(comm * 0.5 * g)));
  riga("CF_U_ALTRE", "Consulenze Amministrative", neg(costante(amm * 0.3)));
  riga("CF_U_ALTRE", "Telefoniche", neg(costante(amm * 0.05)));
  riga("CF_U_ALTRE", "Assicurazioni Diverse", neg(trimestri(r2(amm * 0.1 / 4))));
  riga("CF_U_SALARI", "Emolumento Amministratore", neg(costante(Math.max(12000, R * 0.02))));
  if (imposte > 0)
    riga("CF_U_F24", "Versamento Imposte e Tasse", neg([0, 0, 0, 0, 0, imposte * 0.5, 0, 0, 0, 0, imposte * 0.5, 0].map(r2)));
  if (cf.carburante) riga("CF_U_ALTRE", "Carburanti Automezzi", neg(costante(cf.carburante * 12)));
  if (cf.leasing) riga("CF_U_ALTRE", "Canoni Leasing", neg(costante(cf.leasing * 12)));
  for (const [sez, descr, mensile] of cf.nuove || [])
    riga(sez, descr, mensile ? costante(mensile * 12).map((x) => (sez.startsWith("CF_U") ? -x : x)) : null, { nuova: true });

  // saldo iniziale di banca = liquidità di fine esercizio
  return L(sp.liquidita);
}

module.exports = { popolaCashFlow };
