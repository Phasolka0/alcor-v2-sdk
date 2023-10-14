import JSBI from "jsbi";
import { BigintIsh } from "../internalConstants";
export interface TickConstructorArgs {
    id: number;
    liquidityGross: BigintIsh;
    liquidityNet: BigintIsh;
    feeGrowthOutsideAX64: BigintIsh;
    feeGrowthOutsideBX64: BigintIsh;
    tickCumulativeOutside: BigintIsh;
    secondsPerLiquidityOutsideX64: BigintIsh;
    secondsOutside: BigintIsh;
}
export declare class Tick {
    readonly id: number;
    readonly liquidityGross: JSBI;
    readonly liquidityNet: JSBI;
    readonly feeGrowthOutsideAX64: JSBI;
    readonly feeGrowthOutsideBX64: JSBI;
    readonly tickCumulativeOutside: JSBI;
    readonly secondsOutside: JSBI;
    readonly secondsPerLiquidityOutsideX64: JSBI;
    constructor({ id, liquidityGross, liquidityNet, feeGrowthOutsideAX64, feeGrowthOutsideBX64, tickCumulativeOutside, secondsOutside, secondsPerLiquidityOutsideX64, }: TickConstructorArgs);
    static toJSON(tick: Tick): object;
    static fromJSON(json: any): Tick;
}
