/* ═══════════════════════════════════════════════════════════════
   CALC — motore di calcolo: replica le formule del file WSN045
   (Stato Patrimoniale, Conto Economico, Rating, Vendite, Budget,
   Cash-Flow, Indicatori, Investimenti, dati BEP).

   ds = {
     voci:[{id, ambito, sezione, descrizione, tipo}],
     val:{ voceId:{ anno:importo } },
     bvar:{ voceId:{ annoRif:variazioneManuale } },
     vend:{ anno:[12 importi] },
     par:{ anno:{peso_vendite, inflazione, produttivita, imposte_budget,
                 investimento, aumento_utile, saldo_iniziale_cf} },
     cf:{ voceId:{ annoRif:[12 importi] } }
   }
   Convenzione: dove Excel darebbe #DIV/0! o testo vuoto il risultato è null.
   ═══════════════════════════════════════════════════════════════ */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./template.js"));
  else root.Calc = factory(root.Template);
})(typeof self !== "undefined" ? self : this, function (Template) {
  const n = (x) => (typeof x === "number" && isFinite(x) ? x : 0);
  const div = (a, b) => (b ? a / b : null);
  const up = (s) => String(s || "").trim().toUpperCase();

  function indexVoci(ds) {
    if (ds._idx && ds._idxSrc === ds.voci) return ds._idx;
    const by = {};
    for (const v of ds.voci) (by[v.sezione] = by[v.sezione] || []).push(v);
    ds._idx = by;
    ds._idxSrc = ds.voci;
    return by;
  }
  const vociSez = (ds, sez) => indexVoci(ds)[sez] || [];
  const valore = (ds, voceId, anno) => n(ds.val && ds.val[voceId] && ds.val[voceId][anno]);
  const sumSez = (ds, sez, anno) => vociSez(ds, sez).reduce((s, v) => s + valore(ds, v.id, anno), 0);
  const par = (ds, anno) => Object.assign(
    { peso_vendite: 1, inflazione: 0, produttivita: 0, imposte_budget: 0, investimento: 0, aumento_utile: 0, saldo_iniziale_cf: 0 },
    (ds.par && ds.par[anno]) || {}
  );

  /* ─────────────── STATO PATRIMONIALE ─────────────── */
  function spYear(ds, a) {
    const S = (id) => sumSez(ds, id, a);
    const r = {};
    r.imm_imm = S("A_IMM_IMM");
    r.imm_mat = S("A_IMM_MAT");
    r.imm_fin = S("A_IMM_FIN");
    r.attivo_fisso = r.imm_imm + r.imm_mat + r.imm_fin;
    r.rimanenze = S("A_RIMANENZE");
    r.crediti_entro = S("A_CRED_ENTRO");
    r.crediti_oltre = S("A_CRED_OLTRE");
    r.tot_crediti = r.crediti_entro + r.crediti_oltre;
    r.liq_differite = r.crediti_entro + r.rimanenze + r.crediti_oltre;
    r.liquidita = S("A_LIQUIDITA");
    r.risconti = S("A_RISCONTI");
    r.attivo_circolante = r.rimanenze + r.crediti_entro + r.liquidita + r.risconti; // (Excel: esclude crediti oltre)
    r.totale_attivo = r.attivo_fisso + r.rimanenze + r.crediti_entro + r.crediti_oltre + r.liquidita + r.risconti;
    r.pn = S("P_PN");
    r.cons_varie = S("P_CONS_VARIE");
    r.finanz = S("P_FINANZ");
    r.tot_pass_cons = r.cons_varie + r.finanz;
    r.tot_consolidato = r.pn + r.finanz + r.cons_varie;
    r.banche = S("P_BANCHE");
    r.corr_varie = S("P_CORR_VARIE");
    r.tot_pass_correnti = r.banche + r.corr_varie;
    r.totale_passivita = r.tot_consolidato + r.tot_pass_correnti;
    r.check = r.totale_passivita - r.totale_attivo;
    r.sez = {};
    for (const s of Template.SEZIONI.SP) r.sez[s.id] = S(s.id);
    return r;
  }

  /* ─────────────── CONTO ECONOMICO ─────────────── */
  // somma per tipo nelle sezioni dell'intervallo 117..420. SUMIF è case-insensitive.
  function sumTipo(ds, a, tipi, valFn) {
    let s = 0;
    for (const id of Template.CE_SCOPE_COSTI)
      for (const v of vociSez(ds, id)) if (tipi.includes(up(v.tipo))) s += valFn(v);
    return s;
  }
  function aggregate(S, imposte, fissiRaw, varRaw, costoMpOverride) {
    const r = {};
    r.ricavi = S.C_RICAVI;
    r.pil = r.ricavi;
    r.rim_iniz = S.C_RIM_INIZ;
    r.acquisti = S.C_ACQUISTI;
    r.rim_fin = S.C_RIM_FIN;
    r.costo_mp = costoMpOverride != null ? costoMpOverride : r.rim_iniz + r.acquisti - r.rim_fin;
    r.produttivi = S.C_PRODUTTIVI;
    r.costo_venduto = r.costo_mp + r.produttivi;
    r.margine1 = r.ricavi - r.costo_venduto;
    r.personale = S.C_PERSONALE;
    r.commerciali = S.C_COMMERCIALI;
    r.amministrativi = S.C_AMMINISTRATIVI;
    r.ammortamenti = S.C_AMMORTAMENTI;
    r.oneri_trib = S.C_ONERI_TRIB;
    r.costi_operativi = r.costo_venduto + r.personale + r.commerciali + r.amministrativi + r.ammortamenti + r.oneri_trib;
    r.ebit = r.ricavi - r.costi_operativi;
    r.ebitda = r.ebit + r.ammortamenti;
    r.oneri_fin = S.C_ONERI_FIN;
    r.proventi_fin = S.C_PROVENTI_FIN;
    r.risultato_gest = r.ebit - r.oneri_fin + r.proventi_fin;
    r.ricavi_extra = S.C_RICAVI_EXTRA;
    r.costi_extra = S.C_COSTI_EXTRA;
    r.ante_imposte = r.risultato_gest + r.ricavi_extra - r.costi_extra;
    r.imposte = imposte;
    r.utile = r.ante_imposte - r.imposte;
    r.spese_fisse = fissiRaw - r.proventi_fin;
    r.spese_var = varRaw;
    const den = r.ricavi ? 1 - (r.costo_mp + r.spese_var) / r.ricavi : 0;
    r.bep_fatturato = den ? r.spese_fisse / den : null;
    r.bep_pct = r.ricavi && r.bep_fatturato != null ? (r.bep_fatturato / r.ricavi) * 100 : null; // in punti %
    r.bep_giorno = r.bep_pct != null ? (r.bep_pct * 365) / 100 : null;
    return r;
  }
  function ceYear(ds, a) {
    const S = {};
    for (const s of Template.SEZIONI.CE) S[s.id] = sumSez(ds, s.id, a);
    // Excel (CE!D426): SUMIF(tipo="F") + SUMIF(C117:C420,"=o") — il secondo termine confronta i VALORI con "o",
    // quindi in pratica conta solo le righe di tipo F.
    const fissi = sumTipo(ds, a, ["F"], (v) => valore(ds, v.id, a));
    const vari = sumTipo(ds, a, ["V"], (v) => valore(ds, v.id, a));
    const r = aggregate(S, S.C_IMPOSTE, fissi, vari);
    r.sez = S;
    const rc = r.ricavi;
    r.pct = (x) => (rc ? (x / rc) * 100 : null);
    return r;
  }

  /* ─────────────── RATING ─────────────── */
  const RATING_LABEL = { AAA: "Rischio molto basso", AA: "Rischio basso", A: "Rischio medio basso", BBB: "Rischio medio", BB: "Rischio medio alto", B: "Rischio alto", CCC: "Default" };
  function ratingYear(sp, ce) {
    const r = {};
    r.rimanenze = sp.rimanenze;
    r.altro_ac = sp.crediti_entro + sp.liquidita + sp.risconti;
    r.immobilizzazioni = sp.attivo_fisso;
    r.totale_attivo = sp.totale_attivo;
    r.passivo_circ = sp.banche + sp.corr_varie;
    r.passivo_ml = sp.cons_varie + sp.finanz;
    r.mezzi_propri = sp.pn;
    r.totale_passivo = sp.totale_passivita;
    r.fatturato = ce.ricavi;
    r.ammortamenti = ce.ammortamenti;
    r.oneri_fin = ce.oneri_fin;
    r.utile = ce.utile;
    const pct = (x, t) => div(x, t);
    r.pct = {
      rimanenze: pct(r.rimanenze, r.totale_attivo), altro_ac: pct(r.altro_ac, r.totale_attivo), immobilizzazioni: pct(r.immobilizzazioni, r.totale_attivo),
      passivo_circ: pct(r.passivo_circ, r.totale_passivo), passivo_ml: pct(r.passivo_ml, r.totale_passivo), mezzi_propri: pct(r.mezzi_propri, r.totale_passivo),
    };
    // indicatori
    r.i1 = r.altro_ac === 0 ? 0 : div(r.altro_ac + r.rimanenze, r.passivo_circ);
    r.i2 = div(r.mezzi_propri, r.totale_passivo);
    r.i3 = div(r.oneri_fin, r.fatturato);
    r.i4 = r.totale_attivo === 0 ? 0 : (r.utile + r.ammortamenti) / r.totale_attivo;
    // scoring (identico alle IF annidate del foglio)
    r.s1 = r.i1 != null && r.i1 > 0 ? (r.i1 >= 1.2 ? 3 : r.i1 <= 1 ? 1 : 2) : 0;
    r.s2 = r.i2 != null && r.i2 > 0 ? (r.i2 >= 0.05 ? 3 : r.i2 <= 0.1 ? 1 : 2) : 0; // (2 non raggiungibile, come in Excel)
    r.s3 = r.i3 != null ? (r.i3 <= 0.05 ? 3 : r.i3 >= 0.1 ? 1 : 2) : 0;
    r.s4 = r.i4 != null && r.i4 > 0 ? (r.i4 >= 0.04 ? 3 : r.i4 <= 0.03 ? 1 : 2) : 0;
    r.punteggio = r.s1 + r.s2 + r.s3 + r.s4;
    const map = { 12: "AAA", 11: "AA", 10: "A", 9: "BBB", 8: "BB", 7: "B", 6: "CCC" };
    r.rating = map[r.punteggio] || null; // Excel restituisce FALSE sotto 6
    r.rating_desc = r.rating ? RATING_LABEL[r.rating] : null;
    r.vuoto = sp.totale_attivo === 0 && ce.ricavi === 0;
    return r;
  }

  /* ─────────────── INDICATORI ─────────────── */
  function indicatoriYear(sp, ce) {
    return {
      ebitda_mol: div(ce.ricavi - (ce.costo_mp + ce.produttivi + ce.personale + ce.commerciali + ce.amministrativi + ce.oneri_trib), ce.ricavi),
      roe: div(ce.utile, sp.pn),
      roi: div(ce.ebit, sp.attivo_fisso + sp.attivo_circolante - sp.tot_pass_correnti),
      ros: div(ce.ebit, ce.ricavi),
      margine_tesoreria: sp.attivo_circolante - sp.tot_pass_correnti,
      current_ratio: div(sp.attivo_circolante, sp.tot_pass_correnti),
      rotazione_magazzino: div(ce.costo_mp, (ce.rim_iniz + ce.rim_fin) / 2),
    };
  }

  /* ─────────────── VENDITE ─────────────── */
  const round8 = (x) => Math.round(x * 1e8) / 1e8;
  function vendite(ds, Y) {
    const years = [Y - 2, Y - 1, Y];
    const w = years.map((a) => n(par(ds, a).peso_vendite));
    const sw = w[0] + w[1] + w[2];
    const v = years.map((a) => Array.from({ length: 12 }, (_, m) => n(ds.vend && ds.vend[a] && ds.vend[a][m])));
    const tot = v.map((col) => col.reduce((s, x) => s + x, 0));
    const wavg = (a, b, c) => (sw ? (a * w[0] + b * w[1] + c * w[2]) / sw : 0);
    const ft = Array.from({ length: 12 }, (_, m) => wavg(v[0][m], v[1][m], v[2][m]));
    const ftTot = wavg(tot[0], tot[1], tot[2]);
    const stag = ft.map((x) => (ftTot ? round8((x / ftTot) * 100) : 0));
    let acc = 0;
    const prog = stag.map((x) => (acc += x));
    return { years, pesi: w, somma_pesi: sw, v, tot, ft, ft_tot: ftTot, stag, prog, stag_tot: stag.reduce((s, x) => s + x, 0) };
  }

  /* ─────────────── BUDGET ─────────────── */
  function fattore(tipo, i, p) {
    switch (up(tipo)) {
      case "I": return 1 + i / 100;
      case "P": return 1 + p / 100;
      case "O": return 1;
      case "IP": return (1 + i / 100) * (1 + p / 100);
      case "Z": return 0;
      case "F": return 1 + i / 100;
      case "V": return (1 + i / 100) * (1 + p / 100);
      default: return 0;
    }
  }
  const budgetValore = (C, F, G) => (!G ? C * F : G - Math.trunc(G) > 0 ? C * G : C + G);

  function budget(ds, Y) {
    const P = par(ds, Y);
    const cons = ceYear(ds, Y); // consolidato anno Y (colonna "C")
    const righe = {};
    const SH = {};
    for (const s of Template.SEZIONI.CE) {
      if (s.id === "C_IMPOSTE") continue;
      let h = 0;
      for (const v of vociSez(ds, s.id)) {
        const C = valore(ds, v.id, Y);
        const G = n(ds.bvar && ds.bvar[v.id] && ds.bvar[v.id][Y]);
        const F = fattore(v.tipo, P.inflazione, P.produttivita);
        const H = budgetValore(C, F, G);
        righe[v.id] = { C, G, F, H };
        h += H;
      }
      SH[s.id] = h;
    }
    SH.C_IMPOSTE = 0;
    // Rimanenze: iniziali budget = finali consolidate ; finali budget = finali consolidate
    SH.C_RIM_INIZ = cons.sez.C_RIM_FIN;
    SH.C_RIM_FIN = cons.sez.C_RIM_FIN;
    // Costo materie prime budget = % consolidata sul fatturato × fatturato budget
    const mpPct = cons.ricavi ? cons.costo_mp / cons.ricavi : 0;
    const mpBud = mpPct * SH.C_RICAVI;
    // Spese fisse/variabili budget: per tipo su valori budget (Excel H392: solo "F", niente "o")
    const fissiH = sumTipo(ds, Y, ["F"], (v) => (righe[v.id] ? righe[v.id].H : 0));
    const varH = sumTipo(ds, Y, ["V"], (v) => (righe[v.id] ? righe[v.id].H : 0));
    const bud = aggregate(SH, n(P.imposte_budget), fissiH, varH, mpBud);
    // Consolidato "colonna C" del foglio Budget: spese fisse = F + o (C392)
    const fissiC = sumTipo(ds, Y, ["F", "O"], (v) => valore(ds, v.id, Y));
    const consB = aggregate(
      Object.assign({}, cons.sez), cons.imposte, fissiC, sumTipo(ds, Y, ["V"], (v) => valore(ds, v.id, Y))
    );
    return {
      anno: Y + 1, rif: Y, inflazione: P.inflazione, produttivita: P.produttivita,
      righe, sez: SH, sezC: cons.sez, C: consB, H: bud,
    };
  }

  /* ─────────────── INVESTIMENTI ─────────────── */
  function investimenti(bud, P) {
    const H = bud.H;
    const r = {};
    r.ricavi = H.ricavi;
    r.costi_var = H.costo_mp + H.spese_var;
    r.differenza = r.ricavi - r.costi_var;
    r.costi_fissi = H.spese_fisse;
    r.utile = r.differenza - r.costi_fissi;
    r.d_ricavi = r.ricavi ? 1 : null;
    r.d_var = div(r.costi_var, r.ricavi);
    r.d_diff = div(r.differenza, r.ricavi);
    r.d_fissi = div(r.costi_fissi, r.ricavi);
    r.d_utile = div(r.utile, r.ricavi);
    r.investimento = n(P.investimento);
    r.aumento_utile = n(P.aumento_utile);
    const m = r.d_diff || 0;
    r.fatturato_necessario = m === 0 ? 0 : (r.investimento + r.aumento_utile) / m;
    const E7 = r.fatturato_necessario;
    r.f_fatt = E7 === 0 ? 0 : 1;
    r.f_inv = E7 === 0 ? 0 : r.investimento / E7;
    r.f_aum = E7 === 0 ? 0 : r.aumento_utile / E7;
    // nuovo budget
    r.n_ricavi = r.ricavi + E7;
    r.n_d_ricavi = r.n_ricavi === 0 ? 0 : 1;
    r.n_costi_var = r.n_ricavi * (r.d_var || 0);
    r.n_differenza = r.n_ricavi - r.n_costi_var;
    r.n_costi_fissi = r.costi_fissi + r.investimento;
    r.n_utile = r.n_differenza - r.n_costi_fissi;
    r.n_d_var = r.d_var;
    r.n_d_diff = r.n_ricavi === 0 ? 0 : r.n_differenza / r.n_ricavi;
    r.n_d_fissi = r.n_ricavi === 0 ? 0 : r.n_costi_fissi / r.n_ricavi;
    r.n_d_utile = r.n_ricavi === 0 ? 0 : r.n_utile / r.n_ricavi;
    return r;
  }

  /* ─────────────── dati BEP ─────────────── */
  function dayLabel(giorno) {
    if (giorno == null || !isFinite(giorno)) return null;
    const g = Math.max(1, Math.floor(giorno));
    if (g > 365) return { oltre: true, giorno: g };
    const lim = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let d = g, m = 0;
    while (d > lim[m]) { d -= lim[m]; m++; }
    return { giorno: g, giornoMese: d, mese: m, mese_nome: Template.MESI[m], oltre: false };
  }
  function bepData(bud, vend) {
    const H = bud.H;
    const varPct = H.ricavi ? (H.costo_mp + H.spese_var) / H.ricavi : 0;
    const fissi = H.spese_fisse;
    const rows = [{ label: "0", vendite: 0, fissi, totali: fissi, bep: H.bep_fatturato }];
    Template.MESI.forEach((mn, m) => {
      const vend_m = (vend.prog[m] / 100) * H.ricavi;
      rows.push({ label: mn.slice(0, 3).toLowerCase(), vendite: vend_m, fissi, totali: vend_m * varPct + fissi, bep: H.bep_fatturato });
    });
    const hit = rows.findIndex((r, i) => i > 0 && r.vendite >= r.totali);
    return { rows, var_pct: varPct, mese_pareggio: hit > 0 ? hit - 1 : null, data_bep: dayLabel(H.bep_giorno) };
  }

  /* ─────────────── CASH FLOW ─────────────── */
  function cashflow(ds, Y) {
    const P = par(ds, Y);
    const cfv = (id, m) => n(ds.cf && ds.cf[id] && ds.cf[id][Y] && ds.cf[id][Y][m]);
    const groups = Template.SEZIONI.CF.map((g) => {
      const voci = vociSez(ds, g.id);
      const tot = Array.from({ length: 12 }, (_, m) => voci.reduce((s, v) => s + cfv(v.id, m), 0));
      return { id: g.id, dir: g.dir, voci, tot };
    });
    const entrate = Array.from({ length: 12 }, (_, m) => groups.filter((g) => g.dir === "E").reduce((s, g) => s + g.tot[m], 0));
    const uscite = Array.from({ length: 12 }, (_, m) => groups.filter((g) => g.dir === "U").reduce((s, g) => s + g.tot[m], 0));
    const saldo = [], liq = [];
    for (let m = 0; m < 12; m++) {
      saldo[m] = m === 0 ? n(P.saldo_iniziale_cf) : liq[m - 1];
      liq[m] = saldo[m] + entrate[m] + uscite[m];
    }
    return { anno: Y + 1, rif: Y, groups, entrate, uscite, saldo, liq, cfv };
  }

  /* ─────────────── API ─────────────── */
  function yearData(ds, a) {
    const sp = spYear(ds, a), ce = ceYear(ds, a);
    return { anno: a, sp, ce, rating: ratingYear(sp, ce), ind: indicatoriYear(sp, ce) };
  }
  function compute(ds, Y) {
    const years = [Y - 2, Y - 1, Y]; // finestra usata da vendite/budget
    // tutti gli esercizi da mostrare: quelli con dati + almeno i 3 fino a Y (così un cliente nuovo può compilare anche gli anni precedenti)
    const tutti = [...new Set([...anni(ds), ...years])].sort((a, b) => a - b);
    const out = { Y, years, tutti, anni: {} };
    for (const a of tutti) out.anni[a] = yearData(ds, a);
    out.vend = vendite(ds, Y);
    out.bud = budget(ds, Y);
    out.inv = investimenti(out.bud, par(ds, Y));
    out.bep = bepData(out.bud, out.vend);
    out.cf = cashflow(ds, Y);
    out.par = par(ds, Y);
    return out;
  }
  // tutti gli anni che hanno una riga parametri o almeno un dato inserito
  function anni(ds) {
    const set = new Set(Object.keys(ds.par || {}).map(Number));
    for (const id of Object.keys(ds.val || {})) for (const a of Object.keys(ds.val[id])) set.add(Number(a));
    for (const a of Object.keys(ds.vend || {})) set.add(Number(a));
    return [...set].filter((x) => x > 1900).sort((a, b) => a - b);
  }
  function riepilogo(ds) {
    const anni_ = anni(ds);
    return anni_.map((a) => {
      const d = yearData(ds, a);
      return {
        anno: a, ricavi: d.ce.ricavi, ebitda: d.ce.ebitda, ebit: d.ce.ebit, utile: d.ce.utile,
        attivo: d.sp.totale_attivo, pn: d.sp.pn, check: d.sp.check,
        rating: d.rating.rating, punteggio: d.rating.punteggio, vuoto: d.rating.vuoto,
        roe: d.ind.roe, ros: d.ind.ros, current_ratio: d.ind.current_ratio,
      };
    });
  }

  /* ─────────────── buildDs: righe DB → struttura di calcolo ─────────────── */
  function buildDs(raw) {
    const ds = { voci: raw.voci || [], val: {}, bvar: {}, vend: {}, par: {}, cf: {} };
    for (const r of raw.valori || []) (ds.val[r.voce_id] = ds.val[r.voce_id] || {})[r.anno] = r.importo;
    for (const r of raw.budget_var || []) (ds.bvar[r.voce_id] = ds.bvar[r.voce_id] || {})[r.anno] = r.valore;
    for (const r of raw.vendite || []) {
      const a = (ds.vend[r.anno] = ds.vend[r.anno] || Array(12).fill(0));
      a[r.mese - 1] = r.importo;
    }
    for (const r of raw.parametri || []) ds.par[r.anno] = r;
    for (const r of raw.cashflow || []) {
      const o = (ds.cf[r.voce_id] = ds.cf[r.voce_id] || {});
      const a = (o[r.anno] = o[r.anno] || Array(12).fill(0));
      a[r.mese - 1] = r.importo;
    }
    return ds;
  }

  return {
    buildDs, compute, yearData, riepilogo, anni, spYear, ceYear, ratingYear, indicatoriYear, vendite, budget, investimenti, bepData, cashflow,
    fattore, budgetValore, dayLabel, par, RATING_LABEL, sumSez,
  };
});
