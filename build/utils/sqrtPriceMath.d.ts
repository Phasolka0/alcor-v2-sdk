import JSBI from "jsbi";
export declare abstract class SqrtPriceMath {
    /**
     * Cannot be constructed.
     */
    private constructor();
    static getAmountADelta(sqrtRatioLX64: JSBI, sqrtRatioUX64: JSBI, liquidity: JSBI, roundUp: boolean): JSBI;
    static getAmountBDelta(sqrtRatioLX64: JSBI, sqrtRatioUX64: JSBI, liquidity: JSBI, roundUp: boolean): JSBI;
    static getNextSqrtPriceFromInput(sqrtPX64: JSBI, liquidity: JSBI, amountIn: JSBI, zeroForOne: boolean): JSBI;
    static getNextSqrtPriceFromOutput(sqrtPX64: JSBI, liquidity: JSBI, amountOut: JSBI, zeroForOne: boolean): JSBI;
    private static getNextSqrtPriceFromAmountARoundingUp;
    private static getNextSqrtPriceFromAmountBRoundingDown;
}
