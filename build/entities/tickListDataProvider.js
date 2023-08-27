"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TickListDataProvider = void 0;
const utils_1 = require("../utils");
const tick_1 = require("./tick");
/**
 * A data provider for ticks that is backed by an in-memory array of ticks.
 */
class TickListDataProvider {
    constructor(ticks, tickSpacing) {
        const ticksMapped = ticks.map((t) => t instanceof tick_1.Tick ? t : new tick_1.Tick(t));
        utils_1.TickList.validateList(ticksMapped, tickSpacing);
        this.ticks = ticksMapped;
    }
    getTick(tick) {
        return utils_1.TickList.getTick(this.ticks, tick);
    }
    nextInitializedTickWithinOneWord(tick, lte, tickSpacing) {
        return utils_1.TickList.nextInitializedTickWithinOneWord(this.ticks, tick, lte, tickSpacing);
    }
}
exports.TickListDataProvider = TickListDataProvider;
