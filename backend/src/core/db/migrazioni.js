/* Migrazioni leggere: aggiungono le colonne mancanti ai database creati con versioni precedenti. */
function colonne(db, tabella) {
  const r = db.exec(`PRAGMA table_info(${tabella})`);
  return r.length ? r[0].values.map((v) => v[1]) : [];
}

function migra(db) {
  // clienti.anno_sync: ultimo esercizio creato in automatico (NULL = mai sincronizzato)
  if (!colonne(db, "clienti").includes("anno_sync"))
    db.exec("ALTER TABLE clienti ADD COLUMN anno_sync INTEGER");
}

module.exports = { migra };
