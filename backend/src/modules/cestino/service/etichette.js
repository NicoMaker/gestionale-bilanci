/* Testi mostrati nell'elenco del cestino. */
const Template = require("../../../../../shared/template");

const sezioni = Object.fromEntries(
  Template.tuttiLeSezioni().map((s) => [s.id, s.label]),
);
const ELENCO_MAX = 3;

const elencoNomi = (nomi) =>
  nomi.slice(0, ELENCO_MAX).join(", ") +
  (nomi.length > ELENCO_MAX ? ` e altre ${nomi.length - ELENCO_MAX}` : "");

function etichettaVoci(voci) {
  const nomi = voci.map((v) => v.descrizione || "(senza nome)");
  const sez = [...new Set(voci.map((v) => sezioni[v.sezione] || v.sezione))];
  return {
    etichetta:
      voci.length === 1
        ? `Riga «${nomi[0]}»`
        : `${voci.length} righe: ${elencoNomi(nomi)}`,
    dettaglio: "Sezione: " + elencoNomi(sez),
  };
}

module.exports = { etichettaVoci, elencoNomi, sezioni };
