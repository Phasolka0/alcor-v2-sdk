import JSBI from "jsbi";
import { FeeAmount } from "../internalConstants";
export declare abstract class SwapMath {
    /**
     * Cannot be constructed.
     */
    private constructor();
    static computeSwapStep(sqrtRatioCurrentX64: JSBI, sqrtRatioTargetX64: JSBI, liquidity: JSBI, amountRemaining: JSBI, feePips: FeeAmount): [JSBI, JSBI, JSBI, JSBI];
}
