/* Elenco ordinato dei casi di seed (un file per caso). */
const fs = require("fs");
const path = require("path");

const casi = fs
  .readdirSync(__dirname)
  .filter((f) => /^\d\d-.*\.js$/.test(f))
  .sort()
  .map((f) => require("./" + f));

module.exports = casi;
