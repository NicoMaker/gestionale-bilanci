/* Ripristino di un elemento del cestino: rimette i dati nel database senza sovrascrivere ciò che è stato inserito nel frattempo. */
const db = require("../../../core/db");
const { HttpError } = require("../../../core/http");
const Template = require("../../../../../shared/template");
const { validaCliente } = require("../../clienti/service/valida-cliente");
const { CAMPI_PARAM } = require("../../parametri/routes/campi");
const C = require("./cestino");

const esiste = (sql, p) => !!db.one(sql, p);

// INSERT con le colonne della riga salvata (provengono dal database stesso)
function inserisci(tabella, riga, modo = "OR IGNORE") {
  const cols = Object.keys(riga);
  db.run(
    `INSERT ${modo} INTO ${tabella} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
    cols.map((k) => riga[k]),
  );
}

function ripristinaDati(d) {
  // 1. clienti
  for (const c of d.clienti || []) {
    if (esiste("SELECT 1 AS x FROM clienti WHERE id=?", [c.id]))
      throw new HttpError(409, "Il cliente è già presente");
    validaCliente(c, c.id); // ragione sociale e P.IVA non devono essere stati presi da un altro cliente
    inserisci("clienti", c, "");
  }

  // 2. il cliente deve esistere
  const clientiServono = new Set(
    [
      ...(d.parametri_anno || []),
      ...(d.vendite || []),
      ...(d.voci || []),
      ...(d.param_set || []),
    ].map((r) => r.cliente_id),
  );
  for (const id of clientiServono)
    if (!esiste("SELECT 1 AS x FROM clienti WHERE id=?", [id]))
      throw new HttpError(
        409,
        "Il cliente non esiste più: ripristina prima il cliente dal cestino",
      );

  // 3. righe di conto (se l'id è occupato la riga prende un id nuovo)
  const mappa = {};
  for (const v of d.voci || []) {
    const sez = (Template.SEZIONI[v.ambito] || []).find((s) => s.id === v.sezione);
    if (
      sez &&
      sez.single &&
      esiste("SELECT 1 AS x FROM voci WHERE cliente_id=? AND sezione=?", [
        v.cliente_id,
        v.sezione,
      ])
    )
      throw new HttpError(
        409,
        `La sezione «${sez.label}» ha già una riga: elimina prima quella attuale`,
      );
    if (!esiste("SELECT 1 AS x FROM voci WHERE id=?", [v.id])) {
      inserisci("voci", v, "");
      mappa[v.id] = v.id;
    } else {
      const { id, ...resto } = v;
      mappa[id] = db.insert(
        `INSERT INTO voci (${Object.keys(resto).join(",")}) VALUES (${Object.keys(resto).map(() => "?").join(",")})`,
        Object.values(resto),
      );
    }
  }

  // 4. dati collegati
  for (const r of d.parametri_anno || []) inserisci("parametri_anno", r, "OR REPLACE");
  for (const r of d.vendite || []) inserisci("vendite", r);
  for (const t of ["valori", "budget_var", "cashflow"])
    for (const r of d[t] || []) {
      const id = mappa[r.voce_id] ?? r.voce_id;
      if (esiste("SELECT 1 AS x FROM voci WHERE id=?", [id]))
        inserisci(t, { ...r, voce_id: id });
    }
  for (const p of d.param_set || []) {
    db.run("INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)", [
      p.cliente_id,
      p.anno,
    ]);
    for (const [campo, val] of Object.entries(p.campi))
      if (CAMPI_PARAM.includes(campo))
        db.run(
          `UPDATE parametri_anno SET ${campo}=? WHERE cliente_id=? AND anno=?`,
          [val, p.cliente_id, p.anno],
        );
  }
}

const PRIORITA = { cliente: 0, anno: 1, voci: 2 };

/* Ripristina più elementi (prima i clienti, poi gli esercizi, poi le righe, infine gli azzeramenti).
   Ogni elemento è a sé: se uno non si può ripristinare gli altri vanno comunque a buon fine. */
function ripristina(ids) {
  const items = ids.map((id) => C.leggi(id)).filter(Boolean);
  if (items.length !== ids.length)
    throw new HttpError(404, "Elemento non trovato nel cestino");
  items.sort(
    (a, b) =>
      (PRIORITA[a.tipo] ?? 3) - (PRIORITA[b.tipo] ?? 3) || a.id - b.id,
  );
  const ok = [];
  const errori = [];
  for (const it of items) {
    try {
      db.tx(() => {
        ripristinaDati(it.dati);
        C.elimina([it.id]);
      });
      ok.push(it.id);
    } catch (e) {
      errori.push({ id: it.id, etichetta: it.etichetta, error: e.message });
    }
  }
  return { ripristinati: ok, errori };
}

module.exports = { ripristina };
