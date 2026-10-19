/* Parametri di budget (inflazione, produttività, investimenti, saldo iniziale) e variazioni manuali. */
const db = require("../../../core/db");

function inserisciParametriBudget({ cid, servizi, pubblicita }) {
  db.run(
    "UPDATE parametri_anno SET inflazione=2, produttivita=1, imposte_budget=40000, investimento=500000, aumento_utile=50000, saldo_iniziale_cf=165000 WHERE cliente_id=? AND anno=2024",
    [cid],
  );
  db.run(
    "UPDATE parametri_anno SET inflazione=1.8, produttivita=1.2, imposte_budget=46000, investimento=300000, aumento_utile=40000, saldo_iniziale_cf=190000 WHERE cliente_id=? AND anno=2025",
    [cid],
  );
  db.run(
    "INSERT OR REPLACE INTO budget_var (voce_id, anno, valore) VALUES (?,?,?)",
    [servizi, 2024, 1.1],
  ); // servizi +10%
  db.run(
    "INSERT OR REPLACE INTO budget_var (voce_id, anno, valore) VALUES (?,?,?)",
    [pubblicita, 2024, 5000],
  ); // +5.000 € pubblicità
  db.run(
    "INSERT OR REPLACE INTO budget_var (voce_id, anno, valore) VALUES (?,?,?)",
    [servizi, 2025, 1.05],
  ); // servizi +5%
  db.run(
    "INSERT OR REPLACE INTO budget_var (voce_id, anno, valore) VALUES (?,?,?)",
    [pubblicita, 2025, 3000],
  ); // +3.000 € pubblicità
}

module.exports = { inserisciParametriBudget };
