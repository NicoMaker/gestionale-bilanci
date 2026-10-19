/* Ambiente di test: porta dedicata e database temporaneo (da caricare PRIMA del server). */
const os = require("os");
const path = require("path");

process.env.PORT = "3999";
process.env.DB_PATH = path.join(os.tmpdir(), "gb-test-" + Date.now() + ".db");
