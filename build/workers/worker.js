"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerExpose = void 0;
const entities_1 = require("../entities");
const threads_1 = require("threads");
function fromRoute(options) {
    return entities_1.Trade.fromRoute(options.route, options.currencyAmountIn, options.tradeType);
}
exports.WorkerExpose = {
    fromRoute
};
(0, threads_1.expose)(exports.WorkerExpose);
