/* GET /clienti — elenco clienti con gli anni presenti. */
const express = require("express");
const db = require("../../../core/db");
const { wrap } = require("../../../core/http");

const router = express.Router();

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

module.exports = router;
