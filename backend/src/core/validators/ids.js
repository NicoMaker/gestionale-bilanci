/* Validazione di identificatori, anni e mesi. */
const { HttpError } = require("../http");

const toId = (v) => {
  const x = Number(v);
  if (!Number.isInteger(x) || x <= 0) throw new HttpError(400, "ID non valido");
  return x;
};
const toYear = (v) => {
  const x = Number(v);
  if (!Number.isInteger(x) || x < 1900 || x > 2200)
    throw new HttpError(400, "Anno non valido");
  return x;
};
const toMonth = (v) => {
  const x = Number(v);
  if (!Number.isInteger(x) || x < 1 || x > 12)
    throw new HttpError(400, "Mese non valido");
  return x;
};

/* Data di chiusura dell'esercizio: AAAA-MM-GG, nell'anno indicato. Se manca è il 31/12 dell'anno.
   Accetta anche GG/MM/AAAA. */
const toDataChiusura = (v, anno) => {
  if (v === undefined || v === null || String(v).trim() === "")
    return `${anno}-12-31`;
  let s = String(v).trim();
  const it = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (it) s = `${it[3]}-${it[2].padStart(2, "0")}-${it[1].padStart(2, "0")}`;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const d = m && new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (
    !m ||
    d.getUTCFullYear() !== +m[1] ||
    d.getUTCMonth() !== +m[2] - 1 ||
    d.getUTCDate() !== +m[3]
  )
    throw new HttpError(400, "Data non valida");
  if (+m[1] !== Number(anno))
    throw new HttpError(400, `La data deve essere nel ${anno}`);
  return s;
};

const ANNO_MIN = 1990;
const ANNO_MAX = 2100;
const MAX_ANNI_INSIEME = 60;

/* Anni da creare in un colpo. Il body può contenere:
   · anno            → un solo anno
   · anni: [..]      → elenco di anni
   · da + a          → intervallo (estremi inclusi); se manca «a» vale solo «da»
   Restituisce gli anni senza duplicati, in ordine crescente (1990–2100, al massimo 60 insieme). */
const toAnni = (body) => {
  let anni;
  if (Array.isArray(body.anni)) {
    if (!body.anni.length) throw new HttpError(400, "Indica almeno un anno");
    if (body.anni.length > MAX_ANNI_INSIEME)
      throw new HttpError(
        400,
        `Troppi anni insieme (massimo ${MAX_ANNI_INSIEME})`,
      );
    anni = body.anni.map(toYear);
  } else if (body.da !== undefined && body.da !== null && body.da !== "") {
    const da = toYear(body.da);
    const a =
      body.a === undefined || body.a === null || body.a === ""
        ? da
        : toYear(body.a);
    if (a < da)
      throw new HttpError(
        400,
        "L'anno finale deve essere uguale o successivo all'anno iniziale",
      );
    if (a - da + 1 > MAX_ANNI_INSIEME)
      throw new HttpError(
        400,
        `Troppi anni insieme (massimo ${MAX_ANNI_INSIEME})`,
      );
    anni = Array.from({ length: a - da + 1 }, (_, i) => da + i);
  } else anni = [toYear(body.anno)];
  anni = [...new Set(anni)].sort((x, y) => x - y);
  if (anni.some((a) => a < ANNO_MIN || a > ANNO_MAX))
    throw new HttpError(400, `Anno non valido (${ANNO_MIN}–${ANNO_MAX})`);
  return anni;
};

/* Data di chiusura di ciascun esercizio quando si creano più anni insieme.
   · giorno_mese: «GG/MM» uguale per tutti gli anni (es. 30/06); vuoto = 31/12. Il 29/02 negli anni non bisestili diventa 28/02.
   · data_chiusura (alternativa): una data completa, di cui si usano giorno e mese.
   Con un solo anno e data_chiusura vale la regola di sempre (la data deve essere in quell'anno).
   Restituisce una funzione anno → «AAAA-MM-GG». */
const toDatePerAnno = (body, anni) => {
  const vuoto = (v) => v === undefined || v === null || String(v).trim() === "";
  if (anni.length === 1 && vuoto(body.giorno_mese)) {
    const unica = toDataChiusura(body.data_chiusura, anni[0]);
    return () => unica;
  }
  let g = 31;
  let m = 12;
  if (!vuoto(body.giorno_mese)) {
    const x = String(body.giorno_mese)
      .trim()
      .match(/^(\d{1,2})[\/.-](\d{1,2})$/);
    if (!x) throw new HttpError(400, "Giorno e mese non validi (usa GG/MM)");
    g = +x[1];
    m = +x[2];
  } else if (!vuoto(body.data_chiusura)) {
    const s = String(body.data_chiusura).trim();
    const iso = s.match(/^\d{4}-(\d{2})-(\d{2})$/);
    const it = s.match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-]\d{4})?$/);
    if (iso) {
      m = +iso[1];
      g = +iso[2];
    } else if (it) {
      g = +it[1];
      m = +it[2];
    } else throw new HttpError(400, "Data non valida");
  }
  if (m < 1 || m > 12 || g < 1 || g > 31)
    throw new HttpError(400, "Giorno e mese non validi");
  const due = (n) => String(n).padStart(2, "0");
  return (anno) => {
    const ultimo = new Date(Date.UTC(anno, m, 0)).getUTCDate();
    if (g > ultimo && !(m === 2 && g === 29))
      throw new HttpError(400, "Giorno e mese non validi");
    return `${anno}-${due(m)}-${due(Math.min(g, ultimo))}`;
  };
};

/* Date di chiusura quando si creano più esercizi, con possibilità di date diverse.
   Ordine di precedenza (la prima che c'è vince):
   1. date_clienti: { "<id cliente>": { "<anno>": "AAAA-MM-GG" } }  → data di un singolo cliente per un singolo anno
   2. date:         { "<anno>": "AAAA-MM-GG" }                      → data di un anno uguale per tutti i clienti
   3. giorno_mese / data_chiusura (vedi toDatePerAnno)             → stessa data per tutti; se manca, 31/12
   Una data vuota = si passa al livello successivo. Ogni data deve essere dentro il proprio anno.
   Restituisce una funzione (anno, clienteId?) → «AAAA-MM-GG». */
const toDateEsercizi = (body, anni) => {
  const base = toDatePerAnno(body, anni);
  const ogg = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const pieno = (v) => v !== undefined && v !== null && String(v).trim() !== "";
  const perAnno = ogg(body.date);
  const perCliente = ogg(body.date_clienti);
  const controlla = (mappa) => {
    for (const [a, v] of Object.entries(mappa))
      if (pieno(v) && anni.includes(Number(a))) toDataChiusura(v, Number(a));
  };
  controlla(perAnno);
  Object.values(perCliente).forEach((m) => controlla(ogg(m)));
  return (anno, clienteId) => {
    const c = clienteId === undefined ? null : ogg(perCliente[clienteId]);
    if (c && pieno(c[anno])) return toDataChiusura(c[anno], anno);
    if (pieno(perAnno[anno])) return toDataChiusura(perAnno[anno], anno);
    return base(anno);
  };
};

/* Elenco di id (senza duplicati, da 1 a max elementi). */
const toIds = (v, max = 1000, cosa = "cliente") => {
  if (!Array.isArray(v) || !v.length)
    throw new HttpError(400, `Seleziona almeno un ${cosa}`);
  if (v.length > max) throw new HttpError(400, `Troppi elementi selezionati`);
  return [...new Set(v.map(toId))];
};

module.exports = {
  toId,
  toIds,
  toYear,
  toMonth,
  toDataChiusura,
  toAnni,
  toDatePerAnno,
  toDateEsercizi,
  ANNO_MIN,
  ANNO_MAX,
};
