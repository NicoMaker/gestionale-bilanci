/* Wrapper per gli handler: inoltra errori sincroni e asincroni a next(). */
const wrap = (fn) => (req, res, next) => {
  try {
    Promise.resolve(fn(req, res, next)).catch(next);
  } catch (e) {
    next(e);
  }
};

module.exports = { wrap };
