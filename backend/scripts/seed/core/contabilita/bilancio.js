/* Inserisce Conto Economico e Stato Patrimoniale a partire da un profilo p (ogni campo: numero, array per anno o null).
   Le voci predefinite del template vengono valorizzate, le altre vengono aggiunte come nuove righe. */

// [campo, sezione, descrizione, "def" = riga predefinita | tipo riga per le nuove]
const CE = [
  ["ricavi", "C_RICAVI", "Ricavi vendite", "IP"],
  ["rimIniz", "C_RIM_INIZ", "RIMANENZE INIZIALI", "def"],
  ["acquisti", "C_ACQUISTI", "Acquisti di merci", "IP"],
  ["rimFin", "C_RIM_FIN", "RIMANENZE FINALI", "def"],
  ["produttivi", "C_PRODUTTIVI", "Costi di produzione", "@produttivi"],
  ["personale", "C_PERSONALE", "Salari e stipendi", "@personale"],
  ["commerciali", "C_COMMERCIALI", "Costi commerciali", "V"],
  ["amministrativi", "C_AMMINISTRATIVI", "Costi amministrativi", "F"],
  ["ammortamenti", "C_AMMORTAMENTI", "AMM. MAT", "def"],
  ["oneriTrib", "C_ONERI_TRIB", "Imposte e tasse locali", "F"],
  ["oneriFin", "C_ONERI_FIN", "Interessi passivi", "F"],
  ["proventiFin", "C_PROVENTI_FIN", "Interessi attivi", "F"],
  ["ricaviExtra", "C_RICAVI_EXTRA", "Sopravvenienze attive", "Z"],
  ["costiExtra", "C_COSTI_EXTRA", "Sopravvenienze passive", "Z"],
  ["imposte", "C_IMPOSTE", "IMPOSTE ESERCIZIO (IRES - IRAP)", "def"],
];
const SP = [
  ["immImm", "A_IMM_IMM", "Software e licenze", ""],
  ["fondoImm", "A_IMM_IMM", "F.DO AMM.", "def"],
  ["immMat", "A_IMM_MAT", "Fabbricati e impianti", ""],
  ["fondoMat", "A_IMM_MAT", "F.DO AMM.", "def"],
  ["immFin", "A_IMM_FIN", "TITOLI/AZIONI", "def"],
  ["rimanenze", "A_RIMANENZE", "MERCI", "def"],
  ["crediti", "A_CRED_ENTRO", "CLIENTI", "def"],
  ["creditiOltre", "A_CRED_OLTRE", "Crediti a lungo termine", ""],
  ["cassa", "A_LIQUIDITA", "CASSA", "def"],
  ["liquidita", "A_LIQUIDITA", "BANCHE", "def"],
  ["risconti", "A_RISCONTI", "RISCONTI ATTIVI", "def"],
  ["capitale", "P_PN", "CAPITALE SOCIALE", "def"],
  ["riservaLegale", "P_PN", "RISERVA LEGALE", "def"],
  ["tfr", "P_CONS_VARIE", "FDO TFR", "def"],
  ["mutui", "P_FINANZ", "MUTUI", "def"],
  ["banche", "P_BANCHE", "BANCA C/C", "def"],
  ["fornitori", "P_CORR_VARIE", "FORNITORI", "def"],
  ["debitiTrib", "P_CORR_VARIE", "Debiti tributari", ""],
];

function popolaBilancio(ctx, p) {
  const { riga, esistente } = ctx.h;
  const tipi = Object.assign({ produttivi: "V", personale: "F" }, p.tipi || {});
  for (const [campo, sez, descr, tipo] of [...CE, ...SP]) {
    if (p[campo] == null) continue;
    if (tipo === "def") esistente(sez, descr, p[campo]);
    else
      riga(
        sez,
        descr,
        p[campo],
        tipo.startsWith("@") ? tipi[tipo.slice(1)] : tipo,
      );
  }
  // righe personalizzate: { sez, descr, valori, tipo?, codice? }
  for (const e of p.extra || [])
    riga(e.sez, e.descr, e.valori, e.tipo, e.codice);
}

module.exports = { popolaBilancio };
