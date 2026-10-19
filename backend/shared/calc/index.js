/* Punto d'ingresso Node: riunisce i moduli di calcolo in un unico oggetto (nel browser si caricano i singoli file e si registrano su window.Calc). */
const parts = [
  require("./helpers"),
  require("./sp"),
  require("./ce"),
  require("./rating"),
  require("./indicatori"),
  require("./vendite"),
  require("./budget"),
  require("./investimenti"),
  require("./bep"),
  require("./cashflow"),
  require("./anni"),
  require("./year-data"),
  require("./riepilogo"),
  require("./compute"),
  require("./build-ds"),
];
const Calc = Object.assign({}, ...parts);

module.exports = Calc;
