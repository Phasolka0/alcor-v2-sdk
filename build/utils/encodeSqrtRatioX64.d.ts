import JSBI from "jsbi";
import { BigintIsh } from "../internalConstants";
/**
 * Returns the sqrt ratio as a Q64.64 corresponding to a given ratio of amountB and amountA
 * @param amountB The numerator amount i.e., the amount of tokenB
 * @param amountA The denominator amount i.e., the amount of tokenA
 * @returns The sqrt ratio
 */
export declare function encodeSqrtRatioX64(amountB: BigintIsh, amountA: BigintIsh): JSBI;
