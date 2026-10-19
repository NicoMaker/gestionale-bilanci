/* Download del database SQLite. */
const assert = require("assert");
const { api, base } = require("../helpers/api");
const { t } = require("../helpers/runner");

module.exports = async function () {
  await t("download database SQLite", async () => {
    const r = await fetch(base + "/download-db");
    const buf = Buffer.from(await r.arrayBuffer());
    assert.equal(buf.slice(0, 15).toString(), "SQLite format 3");
  });
};
