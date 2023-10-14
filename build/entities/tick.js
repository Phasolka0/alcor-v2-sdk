"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tick = void 0;
const jsbi_1 = __importDefault(require("jsbi"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const utils_1 = require("../utils");
class Tick {
    constructor({ id, liquidityGross, liquidityNet, feeGrowthOutsideAX64 = 0, feeGrowthOutsideBX64 = 0, tickCumulativeOutside = 0, secondsOutside = 0, secondsPerLiquidityOutsideX64 = 0, }) {
        (0, tiny_invariant_1.default)(id >= utils_1.TickMath.MIN_TICK && id <= utils_1.TickMath.MAX_TICK, "TICK");
        this.id = id;
        this.liquidityGross = jsbi_1.default.BigInt(liquidityGross);
        this.liquidityNet = jsbi_1.default.BigInt(liquidityNet);
        this.feeGrowthOutsideAX64 = jsbi_1.default.BigInt(feeGrowthOutsideAX64);
        this.feeGrowthOutsideBX64 = jsbi_1.default.BigInt(feeGrowthOutsideBX64);
        this.tickCumulativeOutside = jsbi_1.default.BigInt(tickCumulativeOutside);
        this.secondsOutside = jsbi_1.default.BigInt(secondsOutside);
        this.secondsPerLiquidityOutsideX64 = jsbi_1.default.BigInt(secondsPerLiquidityOutsideX64);
    }
    static toJSON(tick) {
        return {
            id: tick.id,
            liquidityGross: tick.liquidityGross.toString(),
            liquidityNet: tick.liquidityNet.toString(),
            feeGrowthOutsideAX64: tick.feeGrowthOutsideAX64.toString(),
            feeGrowthOutsideBX64: tick.feeGrowthOutsideBX64.toString(),
            tickCumulativeOutside: tick.tickCumulativeOutside.toString(),
            secondsOutside: tick.secondsOutside.toString(),
            secondsPerLiquidityOutsideX64: tick.secondsPerLiquidityOutsideX64.toString(),
        };
    }
    static deserialize(data) {
        const parsedData = JSON.parse(data);
        return new Tick({
            id: parsedData.id,
            liquidityGross: jsbi_1.default.BigInt(parsedData.liquidityGross),
            liquidityNet: jsbi_1.default.BigInt(parsedData.liquidityNet),
            feeGrowthOutsideAX64: jsbi_1.default.BigInt(parsedData.feeGrowthOutsideAX64),
            feeGrowthOutsideBX64: jsbi_1.default.BigInt(parsedData.feeGrowthOutsideBX64),
            tickCumulativeOutside: jsbi_1.default.BigInt(parsedData.tickCumulativeOutside),
            secondsOutside: jsbi_1.default.BigInt(parsedData.secondsOutside),
            secondsPerLiquidityOutsideX64: jsbi_1.default.BigInt(parsedData.secondsPerLiquidityOutsideX64),
        });
    }
}
exports.Tick = Tick;
