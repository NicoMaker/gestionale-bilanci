# 📊 Gestionale Bilanci

Applicazione web per l'**analisi di bilancio per cliente**, costruita sul modello Excel `WSN045 – vendite.xlsx`
(Stato Patrimoniale, Conto Economico, Rating, Vendite, Budget, Cash‑Flow, Indicatori, Investimenti, dati BEP).

- **Backend:** Node.js + Express
- **Database:** SQLite (file `.db` reale, scaricabile dall'app)
- **Frontend:** HTML + CSS + JavaScript puro (nessun framework, nessuna build)
- **Stile:** ripreso da [NicoMaker/Gestionale-Fiscale](https://github.com/NicoMaker/Gestionale-Fiscale) — palette "Ledger" (inchiostro su carta), tema chiaro/scuro, sidebar, tabelle a griglia.

---

## 🚀 Avvio rapido

Requisiti: **Node.js 18 o superiore** (https://nodejs.org).

```bash
cd backend
npm install
npm start
```

Apri **http://localhost:3000**. All'avvio il terminale mostra anche l'IP pubblico, l'IP locale e l'indirizzo localhost.
`package.json` e le dipendenze stanno nella cartella `backend/` (la radice del progetto contiene solo pochi file): vedi anche **[backend/GUIDA.md](backend/GUIDA.md)**.

Esegui i comandi dalla cartella `backend/`:

| Comando         | Cosa fa                                                         |
|-----------------|-----------------------------------------------------------------|
| `npm start`     | Avvia il server (porta 3000, variabile `PORT` per cambiarla)    |
| `npm run dev`   | Avvio con riavvio automatico                                    |
| `npm run demo`  | Crea nel database un cliente demo con dati di esempio           |
| `npm test`      | Esegue i test automatici (calcoli + API)                        |

> Nell'app puoi anche premere **«✨ Carica cliente demo»** nella pagina *Clienti*.
> Il cliente demo (*Azienda Demo S.r.l.*) ha **4 esercizi (2022‑2025)** con bilancio in pareggio, vendite mensili, variazioni di budget, investimenti e cash flow, così puoi vedere il budget 2026 già calcolato.
> Se il demo esiste già l'app lo segnala: eliminalo (digitando il nome) per ricrearlo.

---

## 🧭 Come si usa

1. **Clienti → ＋ Nuovo cliente**: inserisci ragione sociale, P.IVA e l'**anno impostato** (l'ultimo esercizio chiuso, es. 2025).
   Per il cliente vengono create automaticamente tutte le sezioni del bilancio, le voci predefinite del file Excel e la struttura del cash flow.
2. Dal menu in alto scegli il **Cliente**: la select ha un campo di **ricerca** (digita parte della ragione sociale o della P.IVA; ↑ ↓ e Invio per scegliere).
   *Stato Patrimoniale*, *Conto Economico*, *Rating* e *Indicatori* mostrano **tutti gli anni affiancati**: scorri la pagina in orizzontale (la barra è in fondo alla finestra)
   mentre codice e descrizione restano fissi a sinistra. Nelle pagine che dipendono da un anno (Riepilogo, Vendite, Budget, Punto di pareggio, Investimenti, Cash Flow, Report)
   in alto compare **Anno rif.**, l'esercizio da cui si calcola il **budget dell'anno successivo** (di norma l'ultimo).
3. Compila le pagine: ogni cella è modificabile direttamente (come in Excel). Salvataggio automatico, totali e percentuali ricalcolati al volo.
   - `Invio` / `↓` → cella sotto · `↑` → cella sopra · `Tab` → cella successiva
   - Formati accettati: `1234,56` · `1.234,56` · `1234.56` · `-500` · `(500)`
4. **＋ Aggiungi anno** (in *Stato Patrimoniale* e *Conto Economico*, oppure ＋ accanto a *Anno rif.*) aggiunge l'esercizio successivo: la nuova annata appare come nuova colonna.
   Per eliminare un anno usa la **✕ nell'intestazione della colonna** (o 🗑 accanto a *Anno rif.*).
5. **Confronto di tutti gli esercizi**: *Budget*, *Punto di pareggio*, *Investimenti*, *Cash Flow* e *Vendite* hanno in fondo una tabella (e un grafico) che affianca **tutti gli esercizi** del cliente, non solo l'anno di riferimento. Ogni esercizio usa i propri parametri; l'anno di riferimento è evidenziato e un clic sull'intestazione di una colonna lo imposta come nuovo anno di riferimento. Il Riepilogo mostra anche ricavi, utile e BEP del budget di ogni anno.
6. **Riepilogo cliente** mostra tutti gli anni affiancati (ricavi, EBITDA, utile, rating, quadratura S.P.) con grafici: clic su una riga per aprire quell'esercizio.
7. **🖨️ Stampa** (in alto) stampa la pagina corrente in A4 orizzontale pronta per l'archivio/PDF.
   **Report completo** compone tutte le pagine del cliente in un unico documento, una pagina per foglio, con frontespizio.
8. **Eliminazioni con verifica dei dati** (la stessa logica è imposta anche dal server, non solo dall'interfaccia):
   - **Riga di conto** senza valori → eliminata subito; con valori → chiede conferma indicando quanti valori si perdono.
   - **Anno** senza dati → conferma semplice; con dati → riepilogo di cosa si perde (bilancio, vendite, cash flow, variazioni budget, parametri) e conferma esplicita. Non si può eliminare l'ultimo anno rimasto.
   - **Cliente** senza dati → conferma semplice; con dati → riepilogo per anno e **conferma digitando la ragione sociale**. Senza conferma l'API risponde `409`.
   - Controlli in creazione/modifica cliente: ragione sociale obbligatoria e univoca, P.IVA di 11 cifre e univoca, anno impostato tra 1990 e 2100, importi numerici entro limiti ragionevoli.
9. **💾 Scarica database** (menu a sinistra) scarica il file SQLite con tutti i clienti e tutti gli anni.

---

## 📑 Mappa Excel → pagine dell'app

| Foglio Excel          | Pagina app                | Cosa fa                                                                                       |
|-----------------------|---------------------------|-----------------------------------------------------------------------------------------------|
| Stato Patrimoniale    | **Stato Patrimoniale**    | Attivo/Passivo riclassificato su tutti gli anni, % sul totale, totali di sezione, **Check = 0**       |
| Conto Economico       | **Conto Economico**       | Ricavi→Costo venduto→Margini→EBITDA→EBIT→Utile, colonna **Tipo**, spese fisse/variabili, BEP |
| Rating                | **Rating**                | Sintesi S.P./C.E., 4 indicatori con scoring 1‑3, punteggio e classe AAA…CCC                  |
| Indicatori            | **Indicatori**            | EBITDA‑MOL, ROE, ROI, ROS, margine di tesoreria, current ratio, rotazione magazzino          |
| Vendite               | **Vendite**               | Ricavi mensili 3 anni, pesi, fattore medio ponderato, stagionalità % e progressiva           |
| Budget                | **Budget**                | Previsione anno+1 con inflazione/produttività, fattori per tipo e **variazioni manuali**     |
| dati BEP              | **Punto di pareggio**     | Vendite cumulate vs costi (grafico), fatturato minimo, data BEP, mese di pareggio            |
| Investimenti          | **Investimenti**          | Fatturato necessario per coprire un investimento + richiesta di aumento utile; nuovo budget  |
| Cash - Flow           | **Cash Flow**             | Piano di tesoreria 12 mesi, entrate/uscite per gruppo, liquidità di banca                    |

### Regole di calcolo replicate dal file Excel

**Tipo riga (Conto Economico → Budget):**

| Tipo | Fattore applicato al consolidato | Significato                       |
|------|----------------------------------|-----------------------------------|
| `I`  | 1 + i                            | Inflazione prevista               |
| `P`  | 1 + p                            | Maggior produttività              |
| `IP` | (1 + i)(1 + p)                   | Inflazione + produttività         |
| `F`  | 1 + i                            | Spesa fissa                       |
| `V`  | (1 + i)(1 + p)                   | Spesa variabile                   |
| `O`  | 1                                | Valore come anno precedente       |
| `Z`  | 0                                | Valore azzerato                   |

**Variazioni manuali (colonna G del Budget):** vuoto/0 → `consolidato × fattore del tipo` ·
numero con decimali (es. `1,10`, `0,95`) → `consolidato × numero` ·
numero intero (es. `5000`, `-2000`) → `consolidato + numero`.

**Altre regole:** rimanenze iniziali e finali di budget = rimanenze finali consolidate · costo materie prime di budget = % consolidata sul fatturato × fatturato di budget ·
spese fisse = righe di tipo `F` (+ `O` nel consolidato del budget) meno i proventi finanziari · spese variabili = righe `V` ·
fatturato minimo BEP = spese fisse / (1 − (materie prime + variabili) / ricavi) · giorno BEP = % BEP × 365 ·
Rating: punteggio = somma di 4 scoring (max 12) → 12 AAA, 11 AA, 10 A, 9 BBB, 8 BB, 7 B, 6 CCC.

> Il motore di calcolo (`shared/calc.js`) è stato **verificato contro il file Excel**: dati di prova inseriti nel foglio, ricalcolati con LibreOffice
> e confrontati con l'app → 299 valori confrontati, 0 differenze (C.E., S.P., Rating, Indicatori, Vendite, Budget, BEP).

### ⚠️ Note sul modello Excel (comportamenti replicati così come sono)

- **Spese fisse nel C.E.**: la formula Excel somma anche `SUMIF(C117:C420,"=o",…)` che confronta i *valori* (non il tipo) con "o": in pratica conta solo le righe di tipo `F`. Nel Budget consolidato invece vengono contate `F` **e** `O`.
- **Rating – Mezzi propri / Totale passivo**: la soglia `≥5%` → 3 punti, altrimenti `≤10%` → 1 punto: il punteggio intermedio (2) non è mai raggiungibile.
- **Rating sotto 6 punti**: Excel restituisce `FALSE`; l'app mostra «n.d.» (sotto la soglia CCC).
- **Attivo circolante**: nel foglio non include i *crediti oltre l'esercizio* (che sono invece nel totale attività).
- **Foglio Investimenti / dati BEP**: nel file ricevuto molte celle erano `#REF!`. Sono state ricostruite con la logica coerente del foglio
  (costi variabili = costo materie prime + spese variabili del budget; utile = ricavi − variabili − fissi; vendite BEP = fatturato budget × progressiva di stagionalità).
- I fondi ammortamento e le uscite del cash flow vanno inseriti **con segno negativo**, come nel file originale.

---

## 🗂️ Struttura del progetto

```
gestionale-bilanci/               radice con pochi file
├── README.md  LICENSE.txt  .gitignore
├── shared/                       codice condiviso server + browser
│   ├── template.js               struttura del bilancio (sezioni, voci predefinite, cash flow)
│   └── calc.js                   motore di calcolo (formule dell'Excel)
├── backend/
│   ├── package.json  package-lock.json   dipendenze e comandi (npm si usa da qui)
│   ├── GUIDA.md                  guida rapida all'uso e all'avvio
│   ├── database.mmd              diagramma Mermaid del database
│   ├── server.js                 Express: API + file statici
│   ├── db/                       gestionale.db (creato al primo avvio)
│   ├── src/
│   │   ├── db.js                 SQLite (sql.js) + schema + salvataggio su file
│   │   ├── routes.js             API REST
│   │   ├── dataset.js            lettura completa dei dati di un cliente
│   │   ├── seedTemplate.js       struttura iniziale di un nuovo cliente
│   │   ├── demo.js / seed-demo.js  cliente demo
│   └── test/run-tests.js         test automatici
└── frontend/
    ├── index.html
    ├── css/  tokens · layout · components · print
    └── js/   ui · api · store · charts · fin · main · pages/ (una per ogni foglio)
```

### Database

Tabelle: `clienti`, `parametri_anno`, `voci`, `valori`, `budget_var`, `vendite`, `cashflow`.
Le righe di conto (`voci`) sono per cliente; i valori sono per voce e per anno, quindi ogni anno si aggiunge senza duplicare la struttura.
Il file si trova in `backend/db/gestionale.db` (cambia percorso con le variabili `DB_PATH` / `DB_DIR`).
Il diagramma delle tabelle è in [`backend/database.mmd`](backend/database.mmd) (Mermaid: si visualizza su GitHub, in VS Code o su mermaid.live).

> **Nota tecnica:** il driver è **sql.js** (SQLite compilato in WebAssembly), come nel progetto di riferimento: nessuna compilazione nativa,
> funziona identico su Windows/macOS/Linux e produce un file SQLite3 standard apribile con *DB Browser for SQLite* o `sqlite3`.
> Il codice di accesso è tutto in `backend/src/db.js`, facilmente sostituibile con `better-sqlite3` se preferisci.

### API principali

```
GET    /api/clienti                       elenco clienti
POST   /api/clienti                       nuovo cliente  {ragione_sociale, partita_iva, anno_base, note}
PUT    /api/clienti/:id                   modifica       DELETE /api/clienti/:id
GET    /api/clienti/:id/dataset           tutti i dati del cliente (tutti gli anni)
GET    /api/clienti/:id/dati              quanti dati contiene il cliente (per anno)
DELETE /api/clienti/:id?conferma=<nome>   con dati richiede la ragione sociale, altrimenti 409
POST   /api/clienti/:id/anni              aggiunge un anno
GET    /api/clienti/:id/anni/:anno/dati   dati presenti nell'anno
DELETE /api/clienti/:id/anni/:anno?conferma=1   con dati richiede conferma, altrimenti 409
POST   /api/clienti/:id/voci              aggiunge una riga di conto
PUT    /api/voci/:id   DELETE /api/voci/:id
PUT    /api/clienti/:id/valore            {voce_id, anno, importo}
PUT    /api/clienti/:id/budget-var        {voce_id, anno, valore}
PUT    /api/clienti/:id/vendite           {anno, mese, importo}
PUT    /api/clienti/:id/cashflow          {voce_id, anno, mese, importo}
PUT    /api/clienti/:id/parametri         {anno, campo, valore}
POST   /api/demo                          crea il cliente demo
GET    /api/download-db                   scarica il database SQLite
```

---

## 🖨️ Stampa

Ogni pagina ha un layout di stampa dedicato: A4 orizzontale, barra laterale e pulsanti nascosti, intestazione con cliente/esercizi/data,
righe che non si spezzano, intestazioni di tabella ripetute a ogni foglio, campi di input resi come testo semplice.
Dal dialogo di stampa del browser puoi scegliere «Salva come PDF».

## ⚠️ Note

- Applicazione pensata per uso **locale / singolo studio**: non include login. Il server ascolta su `0.0.0.0`, quindi è raggiungibile anche dagli altri dispositivi della rete (IP locale mostrato all'avvio): se la esponi in rete o su internet, mettila dietro autenticazione.
- Fai periodicamente un backup con **Scarica database**.
- I font (Plus Jakarta Sans, Fraunces, JetBrains Mono) sono caricati da Google Fonts; offline si usano i font di sistema.

Licenza: MIT.
