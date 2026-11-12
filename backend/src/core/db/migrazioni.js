/* Migrazioni leggere: aggiungono le colonne mancanti ai database creati con versioni precedenti. */
function colonne(db, tabella) {
  const r = db.exec(`PRAGMA table_info(${tabella})`);
  return r.length ? r[0].values.map((v) => v[1]) : [];
}

function migra(db) {
  // clienti.anno_sync: ultimo esercizio creato in automatico (NULL = mai sincronizzato)
  if (!colonne(db, "clienti").includes("anno_sync"))
    db.exec("ALTER TABLE clienti ADD COLUMN anno_sync INTEGER");

  // parametri_anno.data_chiusura: data dell'esercizio (AAAA-MM-GG), di default il 31/12 dell'anno
  if (!colonne(db, "parametri_anno").includes("data_chiusura"))
    db.exec("ALTER TABLE parametri_anno ADD COLUMN data_chiusura TEXT");
  db.exec(
    "UPDATE parametri_anno SET data_chiusura = printf('%04d-12-31', anno) WHERE data_chiusura IS NULL",
  );
  // ogni esercizio creato senza data (sincronizzazione automatica, demo, ripristino) riceve il 31/12
  db.exec(`CREATE TRIGGER IF NOT EXISTS trg_parametri_anno_data_chiusura
    AFTER INSERT ON parametri_anno
    WHEN NEW.data_chiusura IS NULL
    BEGIN
      UPDATE parametri_anno SET data_chiusura = printf('%04d-12-31', NEW.anno)
      WHERE cliente_id = NEW.cliente_id AND anno = NEW.anno;
    END;`);
}

module.exports = { migra };
