/* Cerca la definizione di una sezione per ambito (SP / CE / CF) e id. */
const Template = require("../../../../shared/template");

const sezioneValida = (ambito, sez) =>
  (Template.SEZIONI[ambito] || []).find((s) => s.id === sez);

module.exports = { sezioneValida };
