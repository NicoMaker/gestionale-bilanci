/* Backup del database SQLite. */
const express = require("express");

const router = express.Router();

router.use(require("./download-db"));

module.exports = router;
