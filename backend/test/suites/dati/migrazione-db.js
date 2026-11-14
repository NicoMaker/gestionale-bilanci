/* Aggiornamento in place di un database vecchio: nessuna cancellazione, dati conservati, copia di sicurezza. */
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const initSqlJs = require("sql.js");
const { t } = require("../../helpers/runner");

module.exports = async function () {
  await t(
    "database vecchio: aggiornato senza perdere dati (colonne, righe orfane, anno base)",
    async () => {
      const SQL = await initSqlJs();
      const old = new SQL.Database();
      // schema «vecchio»: senza anno_sync, data_chiusura, fissa/tipo… e senza user_version
      old.exec(`
        CREATE TABLE clienti (id INTEGER PRIMARY KEY AUTOINCREMENT, ragione_sociale TEXT NOT NULL, partita_iva TEXT, note TEXT, anno_base INTEGER NOT NULL);
        CREATE TABLE parametri_anno (cliente_id INTEGER NOT NULL, anno INTEGER NOT NULL, peso_vendite REAL DEFAULT 1, PRIMARY KEY (cliente_id, anno));
        CREATE TABLE voci (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente_id INTEGER NOT NULL, ambito TEXT NOT NULL, sezione TEXT NOT NULL, descrizione TEXT DEFAULT '');
        CREATE TABLE valori (voce_id INTEGER NOT NULL, anno INTEGER NOT NULL, importo REAL, PRIMARY KEY (voce_id, anno));
        INSERT INTO clienti (ragione_sociale, anno_base) VALUES ('Vecchio Srl', 2018), ('Senza Esercizi Srl', 2019);
        INSERT INTO parametri_anno (cliente_id, anno, peso_vendite) VALUES (1, 2020, 2), (1, 2021, 1);
        INSERT INTO voci (cliente_id, ambito, sezione, descrizione) VALUES (1, 'SP', 'attivo', 'Cassa');
        INSERT INTO valori (voce_id, anno, importo) VALUES (1, 2020, 1234.5), (99, 2020, 5);
      `);
      const file = path.join(os.tmpdir(), `gb-vecchio-${Date.now()}.db`);
      fs.writeFileSync(file, Buffer.from(old.export()));
      const prima = fs.readFileSync(file);

      const script = `
        const db = require(${JSON.stringify(path.join(__dirname, "../../../src/core/db"))});
        db.init().then(() => {
          const out = {
            clienti: db.all("SELECT id, anno_base FROM clienti ORDER BY id"),
            parametri: db.all("SELECT * FROM parametri_anno ORDER BY cliente_id, anno"),
            valori: db.all("SELECT * FROM valori"),
            colVoci: db.all("PRAGMA table_info(voci)").map((c) => c.name),
            ver: db.all("PRAGMA user_version")[0].user_version,
          };
          console.log("JSON:" + JSON.stringify(out));
          process.exit(0);
        });`;
      const run = () =>
        execFileSync(process.execPath, ["-e", script], {
          env: { ...process.env, DB_PATH: file },
        }).toString();
      const lettura = (txt) => JSON.parse(txt.split("JSON:")[1]);

      const r = lettura(run());
      // dati originali conservati
      assert.equal(r.parametri.find((p) => p.cliente_id === 1 && p.anno === 2020).peso_vendite, 2);
      assert.equal(r.valori.length, 1, "riga orfana (voce inesistente) rimossa");
      assert.equal(r.valori[0].importo, 1234.5);
      // colonne mancanti aggiunte
      for (const c of ["tipo", "ordine", "fissa", "codice"]) assert.ok(r.colVoci.includes(c), c);
      // date di chiusura create
      assert.ok(r.parametri.every((p) => p.data_chiusura === `${p.anno}-12-31`));
      // anno base riportato a un esercizio esistente; cliente senza esercizi riceve quello dell'anno base
      assert.equal(r.clienti.find((c) => c.id === 1).anno_base, 2020);
      assert.ok(r.parametri.some((p) => p.cliente_id === 2 && p.anno === 2019));
      assert.equal(r.ver, 2);
      // copia di sicurezza del file originale
      const copie = fs
        .readdirSync(os.tmpdir())
        .filter((f) => f.startsWith(path.basename(file, ".db") + ".pre-migrazione-"));
      assert.equal(copie.length, 1);
      assert.ok(fs.readFileSync(path.join(os.tmpdir(), copie[0])).equals(prima));
      // seconda apertura: nessuna nuova migrazione né nuova copia
      const r2 = lettura(run());
      assert.deepEqual(r2.parametri, r.parametri);
      assert.equal(
        fs.readdirSync(os.tmpdir()).filter((f) => f.startsWith(path.basename(file, ".db") + ".pre-migrazione-")).length,
        1,
      );
      for (const f of [file, ...copie.map((c) => path.join(os.tmpdir(), c))]) fs.rmSync(f, { force: true });
    },
  );

  await t("file che non è un database: errore chiaro e file intatto", async () => {
    const file = path.join(os.tmpdir(), `gb-rotto-${Date.now()}.db`);
    fs.writeFileSync(file, "questo non è sqlite, ma contiene dati importanti");
    const prima = fs.readFileSync(file);
    let msg = "";
    try {
      execFileSync(
        process.execPath,
        ["-e", `require(${JSON.stringify(path.join(__dirname, "../../../src/core/db"))}).init().catch((e)=>{console.error(e.message);process.exit(3)})`],
        { env: { ...process.env, DB_PATH: file }, stdio: "pipe" },
      );
    } catch (e) {
      msg = String(e.stderr);
    }
    assert.match(msg, /non è un database SQLite leggibile/);
    assert.ok(fs.readFileSync(file).equals(prima), "file non modificato");
    fs.rmSync(file, { force: true });
  });
};
