/* Punto d'ingresso Node: riunisce i moduli di calcolo in un unico oggetto (nel browser si caricano i singoli file e si registrano su window.Calc). */
const parts = [
  require("./helpers"),
  require("./bilancio/sp"),
  require("./bilancio/ce"),
  require("./bilancio/rating"),
  require("./bilancio/indicatori"),
  require("./flussi/vendite"),
  require("./previsioni/budget"),
  require("./previsioni/investimenti"),
  require("./previsioni/bep"),
  require("./flussi/cashflow"),
  require("./dataset/anni"),
  require("./dataset/year-data"),
  require("./dataset/riepilogo"),
  require("./dataset/compute"),
  require("./dataset/build-ds"),
];
const Calc = Object.assign({}, ...parts);

module.exports = Calc;
