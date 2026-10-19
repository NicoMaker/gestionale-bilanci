/* Logica dei clienti: lettura, validazione, conteggio dei dati inseriti. */
const { getCliente } = require("./get-cliente");
const { datiCliente } = require("./dati-cliente");
const { validaCliente } = require("./valida-cliente");
const { PARAM_DEFAULT } = require("./param-default");

module.exports = { getCliente, datiCliente, validaCliente, PARAM_DEFAULT };
