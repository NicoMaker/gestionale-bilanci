/* Crea il cliente demo e restituisce gli helper per inserire righe e valori. */
const db = require("../../../core/db");
const { seedCliente } = require("../../clienti/seed");
const { ANNI } = require("./costanti");

function creaContesto() {
  const cid = db.insert(
    "INSERT INTO clienti (ragione_sociale, partita_iva, note, anno_base) VALUES (?,?,?,?)",
    [
      "Azienda Demo S.r.l.",
      "01234567890",
      "Cliente di esempio con dati fittizi (esercizi 2022-2025).",
      2025,
    ],
  );
  seedCliente(cid, 2025);
  for (const a of [2022, 2023, 2024])
    db.run(
      "INSERT OR IGNORE INTO parametri_anno (cliente_id, anno) VALUES (?,?)",
      [cid, a],
    );

  const trova = (sez, descr) =>
    db.one(
      "SELECT id FROM voci WHERE cliente_id=? AND sezione=? AND descrizione=?",
      [cid, sez, descr],
    ).id;
  const ambitoDi = (sez) =>
    sez.startsWith("A_") || sez.startsWith("P_")
      ? "SP"
      : sez.startsWith("CF_")
        ? "CF"
        : "CE";
  const tipoDef = {
    C_RICAVI: "IP",
    C_ACQUISTI: "IP",
    C_RICAVI_EXTRA: "Z",
    C_COSTI_EXTRA: "Z",
  };
  const aggiungi = (sez, descr, tipo) => {
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
        "",
        descr,
        amb === "CE" ? tipo || tipoDef[sez] || "F" : "",
        ord,
      ],
    );
  };
  const imposta = (voceId, valori) =>
    valori.forEach(
      (x, i) =>
        x != null &&
        db.run(
          "INSERT OR REPLACE INTO valori (voce_id, anno, importo) VALUES (?,?,?)",
          [voceId, ANNI[i], x],
        ),
    );
  const riga = (sez, descr, valori, tipo) =>
    imposta(aggiungi(sez, descr, tipo), valori);
  const esistente = (sez, descr, valori) => imposta(trova(sez, descr), valori);

  return { cid, trova, aggiungi, imposta, riga, esistente };
}

module.exports = { creaContesto };
