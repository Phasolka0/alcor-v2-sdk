"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerExpose = void 0;
const entities_1 = require("../entities");
const threads_1 = require("threads");
const msgpack_lite_1 = __importDefault(require("msgpack-lite"));
function fromRoute(optionsBuffer) {
    try {
        const optionsJSON = msgpack_lite_1.default.decode(optionsBuffer);
        const route = entities_1.Route.fromBuffer(optionsJSON.route);
        const amount = entities_1.CurrencyAmount.fromBuffer(optionsJSON.amount);
        const { inputAmount, outputAmount } = entities_1.Trade.fromRouteForWorkers(route, amount, optionsJSON.tradeType);
        const resultJson = {
            inputAmount: entities_1.CurrencyAmount.toBuffer(inputAmount),
            outputAmount: entities_1.CurrencyAmount.toBuffer(outputAmount)
        };
        return msgpack_lite_1.default.encode(resultJson);
    }
    catch (e) {
        console.log(e);
    }
}
function fromRouteBulk(buffer) {
    const tasksArray = msgpack_lite_1.default.decode(buffer);
    const results = [];
    for (const optionsBuffer of tasksArray) {
        results.push(fromRoute(optionsBuffer));
    }
    const resultsBuffer = msgpack_lite_1.default.encode(results);
    return resultsBuffer;
}
function loadPools(poolsBuffer) {
    const poolsArray = msgpack_lite_1.default.decode(poolsBuffer);
    const pools = poolsArray.map((poolBuffer) => {
        return entities_1.Pool.fromBuffer(poolBuffer);
    });
    for (const pool of pools) {
        entities_1.Pool.idToPoolMap.set(pool.id, pool);
    }
}
exports.WorkerExpose = {
    fromRoute,
    fromRouteBulk,
    loadPools
};
(0, threads_1.expose)(exports.WorkerExpose);
