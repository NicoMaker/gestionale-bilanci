/* Generatore pseudo-casuale con seme fisso (mulberry32): il seed produce sempre gli stessi dati. */
function rng(seme) {
  let a = seme >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r2 = (x) => Math.round(x * 100) / 100;

// curva mensile leggermente diversa per ogni anno (±jitter), sempre normalizzata a 100
function curvaAnno(base, rand, jitter = 0.05) {
  const v = base.map((p) => p * (1 + (rand() * 2 - 1) * jitter));
  const s = v.reduce((a, b) => a + b, 0);
  return v.map((p) => (p * 100) / s);
}

module.exports = { rng, r2, curvaAnno };
