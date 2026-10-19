/* Node: riunisce la struttura del bilancio in un unico oggetto Template
   (nel browser si caricano i singoli file e si registrano su window.Template). */
module.exports = {
  TIPI: require("./tipi"),
  SEZIONI: require("./sezioni"),
  MESI: require("./mesi"),
  MESI_BREVI: require("./mesi-brevi"),
  CE_SCOPE_COSTI: require("./scope-costi"),
  tuttiLeSezioni: require("./tutte-le-sezioni"),
};
