/* Esecuzione e conteggio dei test: t(nome, fn), near(a, b), report(). */
const assert = require("assert");

let ok = 0;

const t = async (name, fn) => {
  try {
    await fn();
    ok++;
    console.log("  ✓", name);
  } catch (e) {
    console.error("  ✗", name, "\n    ", e.message);
    process.exitCode = 1;
  }
};

const near = (a, b, eps = 0.005) =>
  assert.ok(Math.abs(a - b) <= eps, `${a} ≠ ${b}`);

const report = () =>
  console.log(
    `\n${ok} test superati${process.exitCode ? " — CI SONO FALLIMENTI" : ""}\n`,
  );

module.exports = { t, near, report };
