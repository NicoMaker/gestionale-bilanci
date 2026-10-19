/* Helper per righe di conto e valori di un cliente: trova una voce predefinita, aggiungine di nuove, imposta i valori per anno. */
const db = require("../../../../src/core/db");
const Template = require("../../../../../shared/template");

const ambitoDi = (sez) =>
  sez.startsWith("A_") || sez.startsWith("P_")
    ? "SP"
    : sez.startsWith("CF_")
      ? "CF"
      : "CE";
const tipoDef = (sez) => {
  const d = Template.SEZIONI.CE.find((s) => s.id === sez);
  return d ? d.tipo || "" : "";
};

function creaHelpers(cid, anni) {
  const trova = (sez, descr) => {
    const r = db.one(
      "SELECT id FROM voci WHERE cliente_id=? AND sezione=? AND descrizione=?",
      [cid, sez, descr],
    );
    if (!r) throw new Error(`Voce non trovata: ${sez} / ${descr}`);
    return r.id;
  };

  const aggiungi = (sez, descr, tipo, codice = "") => {
    const amb = ambitoDi(sez);
    const ord = db.one(
      "SELECT COALESCE(MAX(ordine),0)+1 AS o FROM voci WHERE cliente_id=? AND sezione=?",
      [cid, sez],
    ).o;
    return db.insert(
      "INSERT INTO voci (cliente_id, ambito, sezione, codice, descrizione, tipo, ordine, fissa) VALUES (?,?,?,?,?,?,?,0)",
      [
        cid,
        amb,
        sez,
        codice,
        descr,
        amb === "CE" ? tipo || tipoDef(sez) || "F" : "",
        ord,
      ],
    );
  };

  // x: numero (uguale per tutti gli anni) | array allineato a `anni` | oggetto {anno: valore}; null/undefined = nessun valore
  const perAnno = (x) =>
    anni.map((a, i) =>
      Array.isArray(x) ? x[i] : x && typeof x === "object" ? x[a] : x,
    );

  const imposta = (voceId, x) =>
    perAnno(x).forEach(
      (val, i) =>
        val != null &&
        db.run(
          "INSERT OR REPLACE INTO valori (voce_id, anno, importo) VALUES (?,?,?)",
          [voceId, anni[i], val],
        ),
    );

  const riga = (sez, descr, x, tipo, codice) =>
    imposta(aggiungi(sez, descr, tipo, codice), x);
  const esistente = (sez, descr, x) => imposta(trova(sez, descr), x);

  return { trova, aggiungi, imposta, riga, esistente, perAnno };
}

module.exports = { creaHelpers, ambitoDi };
