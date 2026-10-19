/* Conto Economico del cliente demo (esercizi 2022-2024) e imposte. */
function inserisciContoEconomico({ riga, aggiungi, imposta, esistente }) {
  riga("C_RICAVI", "Vendite prodotti", [1800000, 1950000, 2100000]);
  const servizi = aggiungi("C_RICAVI", "Prestazioni di servizi", "IP");
  imposta(servizi, [200000, 210000, 230000]);
  esistente("C_RIM_INIZ", "RIMANENZE INIZIALI", [90000, 100000, 110000]);
  esistente("C_RIM_FIN", "RIMANENZE FINALI", [100000, 110000, 120000]);
  riga("C_ACQUISTI", "Acquisti merci", [900000, 960000, 1040000]);
  riga("C_ACQUISTI", "Acquisti materiali di consumo", [40000, 42000, 45000]);
  riga("C_PRODUTTIVI", "Lavorazioni di terzi", [120000, 130000, 140000], "V");
  riga("C_PRODUTTIVI", "Energia elettrica", [30000, 32000, 35000], "F");
  riga("C_PRODUTTIVI", "Manutenzioni", [18000, 20000, 22000], "F");
  riga("C_PERSONALE", "Salari e stipendi", [350000, 370000, 390000]);
  riga("C_PERSONALE", "Contributi sociali", [105000, 111000, 117000]);
  riga("C_PERSONALE", "Accantonamento TFR", [25000, 26000, 27000]);
  riga("C_COMMERCIALI", "Provvigioni passive", [40000, 43000, 48000], "V");
  const pubblicita = aggiungi("C_COMMERCIALI", "Pubblicità", "F");
  imposta(pubblicita, [20000, 22000, 25000]);
  riga("C_COMMERCIALI", "Trasporti su vendite", [25000, 27000, 30000], "V");
  riga("C_AMMINISTRATIVI", "Consulenze", [30000, 32000, 33000]);
  riga("C_AMMINISTRATIVI", "Assicurazioni", [12000, 12000, 13000]);
  riga("C_AMMINISTRATIVI", "Spese generali", [22000, 23000, 25000]);
  esistente("C_AMMORTAMENTI", "AMM. MAT", [45000, 48000, 50000]);
  esistente("C_AMMORTAMENTI", "AMM. IMM", [10000, 10000, 10000]);
  riga("C_ONERI_TRIB", "IMU e tributi locali", [8000, 8000, 9000]);
  riga("C_ONERI_FIN", "Interessi passivi su mutui", [22000, 20000, 18000]);
  riga("C_ONERI_FIN", "Interessi passivi c/c", [12000, 11000, 10000]);
  riga("C_PROVENTI_FIN", "Interessi attivi", [1000, 1000, 2000]);
  riga("C_RICAVI_EXTRA", "Sopravvenienze attive", [3000, 0, 5000]);
  riga("C_COSTI_EXTRA", "Sopravvenienze passive", [2000, 4000, 1000]);
  esistente(
    "C_IMPOSTE",
    "IMPOSTE ESERCIZIO (IRES - IRAP)",
    [25000, 30000, 38000],
  );

  return { servizi, pubblicita };
}

module.exports = { inserisciContoEconomico };
