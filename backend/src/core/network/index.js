/* Indirizzi di rete mostrati nel banner di avvio. */
const { getLocalIP } = require("./local-ip");
const { getPublicIP } = require("./public-ip");

module.exports = { getLocalIP, getPublicIP };
