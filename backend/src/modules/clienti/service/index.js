/* Logica dei clienti: lettura, validazione, conteggio dei dati inseriti. */
const { getCliente } = require("./get-cliente");
const { datiCliente } = require("./dati-cliente");
const { validaCliente } = require("./valida-cliente");
const { PARAM_DEFAULT } = require("./param-default");
const { eliminaCliente } = require("./elimina-cliente");

module.exports = {
  getCliente,
  datiCliente,
  validaCliente,
  eliminaCliente,
  PARAM_DEFAULT,
};
