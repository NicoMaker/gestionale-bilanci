const express = require("express");
const fs = require("fs");
const db = require("./db");
const Template = require("../../shared/template.js");
const { seedCliente } = require("./seedTemplate");
const { loadRaw } = require("./dataset");

const router = express.Router();

/* ───────── utilità ───────── */
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const wrap = (fn) => (req, res, next) => {
  try {
    Promise.resolve(fn(req, res, next)).catch(next);
  } catch (e) {
    next(e);
  }
};
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
const toNum = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const x = Number(v);
  if (!isFinite(x) || Math.abs(x) > 1e13)
    throw new HttpError(400, "Numero non valido");
  return x;
};
const clean = (s, max = 200) =>
  String(s ?? "")
    .trim()
    .slice(0, max);

function getCliente(id) {
  const c = db.one("SELECT * FROM clienti WHERE id = ?", [id]);
  if (!c) throw new HttpError(404, "Cliente non trovato");
  return c;
}
function getVoce(id) {
  const v = db.one("SELECT * FROM voci WHERE id = ?", [id]);
  if (!v) throw new HttpError(404, "Voce non trovata");
  return v;
}
const sezioneValida = (ambito, sez) =>
  (Template.SEZIONI[ambito] || []).find((s) => s.id === sez);

/* ───────── verifiche sui dati presenti ───────── */
const PARAM_DEFAULT = {
  peso_vendite: 1,
  inflazione: 0,
  produttivita: 0,
  imposte_budget: 0,
  investimento: 0,
  aumento_utile: 0,
  saldo_iniziale_cf: 0,
};
// Quanti dati inseriti ha un cliente (per anno). "ha_dati" = esiste almeno un valore, una vendita, un cash flow, una variazione o un parametro modificato.
function datiCliente(cid) {
  const per = {};
  const slot = (a) =>
    (per[a] = per[a] || {
      anno: a,
      valori: 0,
      vendite: 0,
      cashflow: 0,
      budget_var: 0,
      parametri: 0,
    });
  db.all(
    "SELECT v.anno, COUNT(*) AS n FROM valori v JOIN voci x ON x.id=v.voce_id WHERE x.cliente_id=? AND v.importo IS NOT NULL GROUP BY v.anno",
    [cid],
  ).forEach((r) => (slot(r.anno).valori = r.n));
  db.all(
    "SELECT anno, COUNT(*) AS n FROM vendite WHERE cliente_id=? AND importo IS NOT NULL GROUP BY anno",
    [cid],
  ).forEach((r) => (slot(r.anno).vendite = r.n));
  db.all(
    "SELECT c.anno, COUNT(*) AS n FROM cashflow c JOIN voci x ON x.id=c.voce_id WHERE x.cliente_id=? AND c.importo IS NOT NULL GROUP BY c.anno",
    [cid],
  ).forEach((r) => (slot(r.anno).cashflow = r.n));
  db.all(
    "SELECT b.anno, COUNT(*) AS n FROM budget_var b JOIN voci x ON x.id=b.voce_id WHERE x.cliente_id=? AND b.valore IS NOT NULL GROUP BY b.anno",
    [cid],
  ).forEach((r) => (slot(r.anno).budget_var = r.n));
  db.all("SELECT * FROM parametri_anno WHERE cliente_id=?", [cid]).forEach(
    (p) => {
      const s = slot(p.anno);
      s.parametri = Object.keys(PARAM_DEFAULT).filter(
        (k) => Number(p[k]) !== PARAM_DEFAULT[k],
      ).length;
    },
  );
  const anni = Object.values(per).sort((a, b) => a.anno - b.anno);
  anni.forEach(
    (a) =>
      (a.totale =
        a.valori + a.vendite + a.cashflow + a.budget_var + a.parametri),
  );
  const totale = anni.reduce((s, a) => s + a.totale, 0);
  return { anni, totale, ha_dati: totale > 0 };
}
const norm = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

function validaCliente(body, idEsistente) {
  const ragione = clean(body.ragione_sociale);
  if (!ragione) throw new HttpError(400, "La ragione sociale è obbligatoria");
  const piva = clean(body.partita_iva, 30).replace(/\s/g, "");
  if (piva && !/^\d{11}$/.test(piva))
    throw new HttpError(400, "Partita IVA non valida: servono 11 cifre");
  const altri = db.all(
    "SELECT id, ragione_sociale, partita_iva FROM clienti WHERE id <> ?",
    [idEsistente || 0],
  );
  if (altri.some((c) => norm(c.ragione_sociale) === norm(ragione)))
    throw new HttpError(
      409,
      "Esiste già un cliente con questa ragione sociale",
    );
  if (piva && altri.some((c) => (c.partita_iva || "") === piva))
    throw new HttpError(409, "Esiste già un cliente con questa Partita IVA");
  return { ragione, piva };
}

/* ───────── health ───────── */
router.get("/health", (req, res) =>
  res.json({ ok: true, time: new Date().toISOString() }),
);

/* ───────── clienti ───────── */
router.get(
  "/clienti",
  wrap((req, res) => {
    const rows = db.all(
      "SELECT * FROM clienti ORDER BY ragione_sociale COLLATE NOCASE",
    );
    const anni = db.all(
      "SELECT cliente_id, anno FROM parametri_anno ORDER BY anno",
    );
    for (const c of rows)
      c.anni = anni.filter((a) => a.cliente_id === c.id).map((a) => a.anno);
    res.json(rows);
  }),
);

router.post(
  "/clienti",
  wrap((req, res) => {
    const { ragione, piva } = validaCliente(req.body, 0);
    const anno = toYear(req.body.anno_base);
    if (anno < 1990 || anno > 2100)
      throw new HttpError(400, "Anno impostato non valido (1990–2100)");
    const id = db.tx(() => {
      const cid = db.insert(
        "INSERT INTO clienti (ragione_sociale, partita_iva, note, anno_base) VALUES (?,?,?,?)",
        [ragione, piva, clean(req.body.note, 2000), anno],
      );
      seedCliente(cid, anno);
      return cid;
    });
    res.status(201).json(getCliente(id));
  }),
);

router.get(
  "/clienti/:id",
  wrap((req, res) => res.json(getCliente(toId(req.params.id)))),
);

router.put(
  "/clienti/:id",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const { ragione, piva } = validaCliente(
      {
        ragione_sociale: req.body.ragione_sociale ?? c.ragione_sociale,
        partita_iva: req.body.partita_iva ?? c.partita_iva,
      },
      c.id,
    );
    db.run(
      "UPDATE clienti SET ragione_sociale=?, partita_iva=?, note=? WHERE id=?",
      [ragione, piva, clean(req.body.note ?? c.note, 2000), c.id],
    );
    res.json(getCliente(c.id));
  }),
);

router.get(
  "/clienti/:id/dati",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    res.json(Object.assign({ cliente: c.ragione_sociale }, datiCliente(c.id)));
  }),
);

// Cliente senza dati → eliminazione diretta. Cliente con dati → serve ?conferma=<ragione sociale esatta>.
router.delete(
  "/clienti/:id",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const d = datiCliente(c.id);
    if (d.ha_dati && norm(req.query.conferma) !== norm(c.ragione_sociale)) {
      return res
        .status(409)
        .json({
          error:
            "Il cliente contiene dati: per eliminarlo conferma digitando la ragione sociale",
          richiede_conferma: true,
          dati: d,
        });
    }
    db.tx(() => {
      // eliminazione esplicita (non ci affidiamo solo al CASCADE)
      db.run(
        "DELETE FROM valori WHERE voce_id IN (SELECT id FROM voci WHERE cliente_id=?)",
        [c.id],
      );
      db.run(
        "DELETE FROM budget_var WHERE voce_id IN (SELECT id FROM voci WHERE cliente_id=?)",
        [c.id],
      );
      db.run(
        "DELETE FROM cashflow WHERE voce_id IN (SELECT id FROM voci WHERE cliente_id=?)",
        [c.id],
      );
      db.run("DELETE FROM voci WHERE cliente_id=?", [c.id]);
      db.run("DELETE FROM vendite WHERE cliente_id=?", [c.id]);
      db.run("DELETE FROM parametri_anno WHERE cliente_id=?", [c.id]);
      db.run("DELETE FROM clienti WHERE id=?", [c.id]);
    });
    res.json({ ok: true });
  }),
);

/* ───────── dataset completo di un cliente (tutti gli anni) ───────── */
router.get(
  "/clienti/:id/dataset",
  wrap((req, res) => {
    getCliente(toId(req.params.id));
    res.json(loadRaw(toId(req.params.id)));
  }),
);

/* ───────── anni ───────── */
router.post(
  "/clienti/:id/anni",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    let anno = req.body.anno;
    if (anno === undefined || anno === null || anno === "") {
      anno =
        db.one("SELECT MAX(anno) AS m FROM parametri_anno WHERE cliente_id=?", [
          c.id,
        ]).m + 1;
    }
    anno = toYear(anno);
    db.run(
      "INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)",
      [c.id, anno],
    );
    res.status(201).json({ anno });
  }),
);

router.get(
  "/clienti/:id/anni/:anno/dati",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anno = toYear(req.params.anno);
    const d = datiCliente(c.id).anni.find((a) => a.anno === anno) || {
      anno,
      valori: 0,
      vendite: 0,
      cashflow: 0,
      budget_var: 0,
      parametri: 0,
      totale: 0,
    };
    res.json(Object.assign({ ha_dati: d.totale > 0 }, d));
  }),
);

router.delete(
  "/clienti/:id/anni/:anno",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anno = toYear(req.params.anno);
    const esiste = db.one(
      "SELECT 1 AS x FROM parametri_anno WHERE cliente_id=? AND anno=?",
      [c.id, anno],
    );
    const dAnno = datiCliente(c.id).anni.find((a) => a.anno === anno);
    if (!esiste && !(dAnno && dAnno.totale))
      throw new HttpError(404, "Anno non presente per questo cliente");
    const nAnni = new Set([
      ...db
        .all("SELECT anno FROM parametri_anno WHERE cliente_id=?", [c.id])
        .map((r) => r.anno),
      ...datiCliente(c.id)
        .anni.filter((a) => a.totale)
        .map((a) => a.anno),
    ]).size;
    if (nAnni <= 1)
      throw new HttpError(400, "Il cliente deve avere almeno un anno");
    if (dAnno && dAnno.totale && String(req.query.conferma) !== "1") {
      return res
        .status(409)
        .json({
          error: "L'anno contiene dati: conferma l'eliminazione",
          richiede_conferma: true,
          dati: dAnno,
        });
    }
    db.tx(() => {
      const sub = "SELECT id FROM voci WHERE cliente_id=?";
      db.run(`DELETE FROM valori WHERE anno=? AND voce_id IN (${sub})`, [
        anno,
        c.id,
      ]);
      db.run(`DELETE FROM budget_var WHERE anno=? AND voce_id IN (${sub})`, [
        anno,
        c.id,
      ]);
      db.run(`DELETE FROM cashflow WHERE anno=? AND voce_id IN (${sub})`, [
        anno,
        c.id,
      ]);
      db.run("DELETE FROM vendite WHERE cliente_id=? AND anno=?", [c.id, anno]);
      db.run("DELETE FROM parametri_anno WHERE cliente_id=? AND anno=?", [
        c.id,
        anno,
      ]);
    });
    res.json({ ok: true });
  }),
);

/* ───────── voci (righe di conto) ───────── */
router.post(
  "/clienti/:id/voci",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const ambito = clean(req.body.ambito, 2);
    const sez = clean(req.body.sezione, 40);
    const def = sezioneValida(ambito, sez);
    if (!def) throw new HttpError(400, "Sezione non valida");
    if (def.single) throw new HttpError(400, "Questa sezione ha una sola riga");
    const max = db.one(
      "SELECT COALESCE(MAX(ordine),0) AS m FROM voci WHERE cliente_id=? AND sezione=?",
      [c.id, sez],
    ).m;
    const tipo =
      ambito === "CE"
        ? clean(req.body.tipo || def.tipo || "F", 3).toUpperCase()
        : "";
    const id = db.insert(
      "INSERT INTO voci (cliente_id, ambito, sezione, codice, descrizione, tipo, ordine, fissa) VALUES (?,?,?,?,?,?,?,0)",
      [
        c.id,
        ambito,
        sez,
        clean(req.body.codice, 30),
        clean(req.body.descrizione),
        tipo,
        max + 1,
      ],
    );
    res
      .status(201)
      .json(
        db.one(
          "SELECT id, ambito, sezione, codice, descrizione, tipo, ordine, fissa FROM voci WHERE id=?",
          [id],
        ),
      );
  }),
);

router.put(
  "/voci/:id",
  wrap((req, res) => {
    const v = getVoce(toId(req.params.id));
    const codice =
      req.body.codice !== undefined ? clean(req.body.codice, 30) : v.codice;
    const descr =
      req.body.descrizione !== undefined
        ? clean(req.body.descrizione)
        : v.descrizione;
    let tipo = v.tipo;
    if (req.body.tipo !== undefined) {
      tipo = clean(req.body.tipo, 3).toUpperCase();
      if (v.ambito === "CE" && tipo && !Template.TIPI.some((t) => t.v === tipo))
        throw new HttpError(400, "Tipo non valido");
    }
    db.run("UPDATE voci SET codice=?, descrizione=?, tipo=? WHERE id=?", [
      codice,
      descr,
      tipo,
      v.id,
    ]);
    res.json(
      db.one(
        "SELECT id, ambito, sezione, codice, descrizione, tipo, ordine, fissa FROM voci WHERE id=?",
        [v.id],
      ),
    );
  }),
);

router.delete(
  "/voci/:id",
  wrap((req, res) => {
    const v = getVoce(toId(req.params.id));
    if (v.fissa)
      throw new HttpError(400, "Questa riga non può essere eliminata");
    db.tx(() => {
      db.run("DELETE FROM valori WHERE voce_id=?", [v.id]);
      db.run("DELETE FROM budget_var WHERE voce_id=?", [v.id]);
      db.run("DELETE FROM cashflow WHERE voce_id=?", [v.id]);
      db.run("DELETE FROM voci WHERE id=?", [v.id]);
    });
    res.json({ ok: true });
  }),
);

/* ───────── celle ───────── */
router.put(
  "/clienti/:id/valore",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const v = getVoce(toId(req.body.voce_id));
    if (v.cliente_id !== c.id)
      throw new HttpError(403, "Voce di un altro cliente");
    const anno = toYear(req.body.anno);
    const imp = toNum(req.body.importo);
    if (imp === null)
      db.run("DELETE FROM valori WHERE voce_id=? AND anno=?", [v.id, anno]);
    else
      db.run(
        "INSERT INTO valori (voce_id, anno, importo) VALUES (?,?,?) ON CONFLICT(voce_id, anno) DO UPDATE SET importo=excluded.importo",
        [v.id, anno, imp],
      );
    res.json({ ok: true });
  }),
);

router.put(
  "/clienti/:id/budget-var",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const v = getVoce(toId(req.body.voce_id));
    if (v.cliente_id !== c.id)
      throw new HttpError(403, "Voce di un altro cliente");
    const anno = toYear(req.body.anno);
    const val = toNum(req.body.valore);
    if (val === null)
      db.run("DELETE FROM budget_var WHERE voce_id=? AND anno=?", [v.id, anno]);
    else
      db.run(
        "INSERT INTO budget_var (voce_id, anno, valore) VALUES (?,?,?) ON CONFLICT(voce_id, anno) DO UPDATE SET valore=excluded.valore",
        [v.id, anno, val],
      );
    res.json({ ok: true });
  }),
);

router.put(
  "/clienti/:id/vendite",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anno = toYear(req.body.anno),
      mese = toMonth(req.body.mese);
    const imp = toNum(req.body.importo);
    if (imp === null)
      db.run("DELETE FROM vendite WHERE cliente_id=? AND anno=? AND mese=?", [
        c.id,
        anno,
        mese,
      ]);
    else
      db.run(
        "INSERT INTO vendite (cliente_id, anno, mese, importo) VALUES (?,?,?,?) ON CONFLICT(cliente_id, anno, mese) DO UPDATE SET importo=excluded.importo",
        [c.id, anno, mese, imp],
      );
    res.json({ ok: true });
  }),
);

router.put(
  "/clienti/:id/cashflow",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const v = getVoce(toId(req.body.voce_id));
    if (v.cliente_id !== c.id || v.ambito !== "CF")
      throw new HttpError(403, "Voce non valida");
    const anno = toYear(req.body.anno),
      mese = toMonth(req.body.mese);
    const imp = toNum(req.body.importo);
    if (imp === null)
      db.run("DELETE FROM cashflow WHERE voce_id=? AND anno=? AND mese=?", [
        v.id,
        anno,
        mese,
      ]);
    else
      db.run(
        "INSERT INTO cashflow (voce_id, anno, mese, importo) VALUES (?,?,?,?) ON CONFLICT(voce_id, anno, mese) DO UPDATE SET importo=excluded.importo",
        [v.id, anno, mese, imp],
      );
    res.json({ ok: true });
  }),
);

const CAMPI_PARAM = [
  "peso_vendite",
  "inflazione",
  "produttivita",
  "imposte_budget",
  "investimento",
  "aumento_utile",
  "saldo_iniziale_cf",
];
router.put(
  "/clienti/:id/parametri",
  wrap((req, res) => {
    const c = getCliente(toId(req.params.id));
    const anno = toYear(req.body.anno);
    const campo = String(req.body.campo);
    if (!CAMPI_PARAM.includes(campo))
      throw new HttpError(400, "Parametro non valido");
    const val = toNum(req.body.valore);
    db.run(
      "INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)",
      [c.id, anno],
    );
    db.run(
      `UPDATE parametri_anno SET ${campo}=? WHERE cliente_id=? AND anno=?`,
      [val === null ? (campo === "peso_vendite" ? 1 : 0) : val, c.id, anno],
    );
    res.json({ ok: true });
  }),
);

/* ───────── cliente demo ───────── */
router.post(
  "/demo",
  wrap((req, res) => {
    if (
      db.one(
        "SELECT id FROM clienti WHERE partita_iva='01234567890' OR ragione_sociale='Azienda Demo S.r.l.'",
      )
    ) {
      throw new HttpError(
        409,
        "Il cliente demo esiste già: eliminalo prima di ricrearlo",
      );
    }
    const { creaDemo } = require("./demo");
    res.status(201).json(creaDemo());
  }),
);

/* ───────── download database ───────── */
router.get(
  "/download-db",
  wrap((req, res) => {
    db.flush();
    const p = db.dbPath();
    if (!fs.existsSync(p))
      throw new HttpError(404, "File database non trovato");
    const stamp = new Date().toISOString().slice(0, 10);
    res.download(p, `gestionale-bilanci-${stamp}.db`);
  }),
);

/* ───────── gestione errori ───────── */
router.use((req, res) =>
  res.status(404).json({ error: "Endpoint non trovato" }),
);
router.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  if (status === 500) console.error("❌", err);
  res.status(status).json({ error: err.message || "Errore interno" });
});

module.exports = router;
