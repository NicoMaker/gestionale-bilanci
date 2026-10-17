# Gestionale Bilanci

Analisi di bilancio per cliente: Stato Patrimoniale, Conto Economico, rating, indicatori, vendite, budget, punto di pareggio, investimenti e cash flow.
Node.js + Express + SQLite (sql.js), frontend in JavaScript puro (nessun build).

## Avvio

```bash
cd backend
npm install
npm start          # http://localhost:3000
npm run demo       # crea il cliente demo
npm test           # test automatici
```

## Struttura

```
gestionale-bilanci/
├── backend/
│   ├── server.js                 avvio, banner, chiusura pulita
│   ├── shared/                   codice condiviso server + browser
│   │   ├── template.js           struttura del bilancio (sezioni, tipi riga)
│   │   └── calc.js               motore di calcolo
│   ├── src/
│   │   ├── app.js                app Express (API, /shared, frontend)
│   │   ├── config.js             porta e percorsi
│   │   ├── core/                 db, errori HTTP, validatori, rete
│   │   └── modules/              una cartella per funzionalità
│   │       ├── clienti/          anagrafica + seed struttura di partenza
│   │       ├── dataset/          dataset completo di un cliente
│   │       ├── anni/             esercizi
│   │       ├── voci/             righe di conto
│   │       ├── valori/           valori di bilancio
│   │       ├── budget/           variazioni manuali
│   │       ├── vendite/          vendite mensili
│   │       ├── cashflow/         cash flow mensile
│   │       ├── parametri/        parametri annuali
│   │       ├── demo/             cliente demo
│   │       ├── database/         download del file .db
│   │       └── health/
│   ├── scripts/seed-demo.js
│   ├── docs/                     schema del database
│   └── test/
└── frontend/
    ├── index.html
    ├── assets/icons/             favicon e icone
    ├── css/
    │   ├── base/                 token (colori, font) e reset
    │   ├── layout/               sidebar, area principale, tema
    │   ├── components/           un file per componente
    │   └── print.css
    └── js/
        ├── core/                 namespace, formati numerici, DOM, helper di stampa
        ├── components/           toast, modal, search-select, num-input,
        │                         grid-nav, auto-sign, chart, fin-table, multi-table
        ├── features/             anni (aggiungi/elimina), voci (elimina riga)
        ├── services/             api e store (stato dell'app)
        ├── pages/                una cartella per pagina (sp, ce, rating, …)
        ├── app/                  theme, sidebar, topbar, router
        └── main.js               avvio
```

I file JS del frontend sono script classici (nessun bundler): l'ordine di caricamento è in `frontend/index.html`.
