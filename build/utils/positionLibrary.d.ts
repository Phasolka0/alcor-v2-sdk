import JSBI from "jsbi";
export declare abstract class PositionLibrary {
    /**
     * Cannot be constructed.
     */
    private constructor();
    static getTokensOwed(feeGrowthInsideALastX64: JSBI, feeGrowthInsideBLastX64: JSBI, liquidity: JSBI, feeGrowthInsideAX64: JSBI, feeGrowthInsideBX64: JSBI): JSBI[];
}
