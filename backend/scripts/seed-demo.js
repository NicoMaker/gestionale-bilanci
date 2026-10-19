// Uso: npm run demo   → crea il cliente demo nel database (db/gestionale.db)
const db = require("../src/core/db");
const { creaDemo } = require("../src/modules/demo/service");
db.init()
  .then(() => {
    const r = creaDemo();
    db.flush();
    console.log("✅ Cliente demo creato:", r);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
