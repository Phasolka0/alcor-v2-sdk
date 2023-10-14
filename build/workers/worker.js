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
    const optionsJSON = msgpack_lite_1.default.decode(optionsBuffer);
    console.log(optionsJSON);
    const route = entities_1.Route.fromBuffer(optionsJSON.route);
    const amount = entities_1.CurrencyAmount.fromBuffer(optionsJSON.amount);
    const tradeType = msgpack_lite_1.default.decode(optionsJSON.tradeType);
    //console.log({route, amount, tradeType});
    const { inputAmount, outputAmount } = entities_1.Trade.fromRouteForWorkers(route, amount, tradeType);
    const resultJson = {
        inputAmount: entities_1.CurrencyAmount.toBuffer(inputAmount),
        outputAmount: entities_1.CurrencyAmount.toBuffer(outputAmount)
    };
    return msgpack_lite_1.default.encode(resultJson);
}
exports.WorkerExpose = {
    fromRoute
};
(0, threads_1.expose)(exports.WorkerExpose);
