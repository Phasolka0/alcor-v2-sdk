"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkerExpose = void 0;
var _entities = require("../entities");
var _threads = require("threads");
var _msgpackLite = _interopRequireDefault(require("msgpack-lite"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function fromRoute(optionsBuffer) {
  try {
    const optionsJSON = _msgpackLite.default.decode(optionsBuffer);
    const route = _entities.Route.fromBuffer(optionsJSON.route);
    const amount = _entities.CurrencyAmount.fromBuffer(optionsJSON.amount);
    const trade = _entities.Trade.fromRoute(route, amount, optionsJSON.tradeType);
    if (!trade.inputAmount.greaterThan(0) || !trade.priceImpact.greaterThan(0)) return null;
    const {
      inputAmount,
      outputAmount
    } = trade;
    const resultJson = {
      inputAmount: _entities.CurrencyAmount.toBuffer(inputAmount),
      outputAmount: _entities.CurrencyAmount.toBuffer(outputAmount)
    };
    return _msgpackLite.default.encode(resultJson);
  } catch (e) {
    console.log(e);
  }
}
function fromRouteBulk(buffer) {
  const tasksArray = _msgpackLite.default.decode(buffer);
  const results = [];
  for (const optionsBuffer of tasksArray) {
    results.push(fromRoute(optionsBuffer));
  }
  const resultsBuffer = _msgpackLite.default.encode(results);
  return resultsBuffer;
}
function loadPools(poolsBuffer) {
  const poolsArray = _msgpackLite.default.decode(poolsBuffer);
  const pools = poolsArray.map(poolBuffer => {
    return _entities.Pool.fromBuffer(poolBuffer);
  });
  for (const pool of pools) {
    _entities.Pool.idToPoolMap.set(pool.id, pool);
  }
}
const WorkerExpose = exports.WorkerExpose = {
  fromRoute,
  fromRouteBulk,
  loadPools
};
(0, _threads.expose)(WorkerExpose);