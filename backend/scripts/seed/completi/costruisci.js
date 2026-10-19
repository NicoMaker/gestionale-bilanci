/* Trasforma la scheda di un cliente (clienti.js) in un caso di seed: bilancio dettagliato, vendite, parametri, budget e cash flow. */
const { profilo } = require("../core/cliente/profilo");
const CURVE = require("./curve");
const { rng, r2, curvaAnno } = require("./random");
const { applicaDettaglio } = require("./dettaglio");
const { popolaCashFlow } = require("./cash-flow");

const tondo = (x, passo = 100) => Math.round(x / passo) * passo;
const dettaglioNum = (n) => String(n).padStart(2, "0");

function costruisci(spec, n) {
  const anni = spec.anni;
  const base = anni[anni.length - 1];
  return {
    ragione_sociale: spec.rs,
    partita_iva: spec.piva,
    note: `SEED #C${dettaglioNum(n)} — ${spec.attivita} (${spec.citta}).`,
    anno_base: base,
    anni,
    popola(ctx) {
      const rand = rng(n * 7919);
      const { ce, sp } = profilo({
        ricavi: spec.ricavi,
        margine: spec.margine,
        cr: spec.cr,
        pn: spec.pn,
        oneri: spec.oneri,
        t: spec.t,
        quote: spec.quote,
        s: spec.s,
        tipi: spec.tipi,
      });
      const originali = { ce: { ...ce }, sp: { ...sp } };

      // imposte e tasse locali (10% dei costi amministrativi) e interessi attivi sulla liquidità
      ce.oneriTrib = ce.amministrativi.map((x) =>
        x == null ? null : r2(x * 0.1),
      );
      ce.amministrativi = ce.amministrativi.map((x, i) =>
        x == null ? null : r2(x - ce.oneriTrib[i]),
      );
      ce.proventiFin = sp.liquidita.map((x) =>
        x == null ? null : r2(x * 0.004),
      );
      ce.personale = ce.personale.map((x, i) =>
        x == null ? null : r2(x + ce.proventiFin[i]),
      );

      // sopravvenienze attive/passive (Z): compensate sul personale per non alterare il risultato
      for (const [anno, attive, passive] of spec.sopravv || []) {
        const i = anni.indexOf(anno);
        ce.ricaviExtra = ce.ricaviExtra || anni.map(() => null);
        ce.costiExtra = ce.costiExtra || anni.map(() => null);
        if (attive) ce.ricaviExtra[i] = attive;
        if (passive) ce.costiExtra[i] = passive;
        ce.personale[i] = r2(ce.personale[i] + attive - passive);
      }

      const extra = applicaDettaglio({ ce, sp }, spec.det).concat(
        spec.extra || [],
      );
      ctx.bilancio({ ...ce, ...sp, extra });
      ctx.quadra();

      // vendite mensili: stessa stagionalità, leggermente diversa ogni anno
      const curva = CURVE[spec.stag];
      ctx.vendite({
        tot: spec.ricavi,
        stag: anni.map(() => curvaAnno(curva, rand)),
      });

      // parametri per ogni esercizio (il peso delle vendite cresce con l'anno)
      anni.forEach((a, i) => {
        const imp = originali.ce.imposte[i] || 0;
        ctx.parametri(a, {
          peso_vendite: i + 1,
          inflazione: spec.par.inflazione,
          produttivita: spec.par.produttivita,
          imposte_budget: imp > 0 ? tondo(imp * 1.05) : 0,
        });
      });

      // cash flow dell'anno successivo + saldo iniziale di banca
      const saldo = popolaCashFlow(ctx, spec, originali, rand, curva);
      ctx.parametri(base, {
        investimento: spec.par.investimento,
        aumento_utile: spec.par.aumento_utile,
        saldo_iniziale_cf: tondo(saldo, 100),
      });

      // variazioni manuali del budget: sull'ultimo esercizio (e, per la prima, anche sul precedente)
      (spec.bvar || []).forEach(([sez, descr, valore], k) => {
        ctx.budgetVar(sez, descr, base, valore);
        if (k === 0 && anni.length > 1)
          ctx.budgetVar(
            sez,
            descr,
            anni[anni.length - 2],
            valore > 1 && valore < 2 ? r2(valore - 0.02) : valore,
          );
      });
    },
  };
}

module.exports = { costruisci };
