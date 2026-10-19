/* Cliente demo con dati di esempio. */
const express = require("express");

const router = express.Router();

router.use(require("./post-demo"));

module.exports = router;
