/* Cliente demo singolo e i 20 clienti demo completi. */
const express = require("express");

const router = express.Router();

router.use(require("./post-demo"));
router.use(require("./post-demo-clienti"));

module.exports = router;
