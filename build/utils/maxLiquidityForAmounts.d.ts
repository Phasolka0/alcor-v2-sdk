import JSBI from "jsbi";
import { BigintIsh } from "../internalConstants";
/**
 * Computes the maximum amount of liquidity received for a given amount of token0, token1,
 * and the prices at the tick boundaries.
 * @param sqrtRatioCurrentX64 the current price
 * @param sqrtRatioLX64 price at lower boundary
 * @param sqrtRatioUX64 price at upper boundary
 * @param amountA token0 amount
 * @param amountB token1 amount
 * @param useFullPrecision if false, liquidity will be maximized according to what the router can calculate,
 * not what core can theoretically support
 */
export declare function maxLiquidityForAmounts(sqrtRatioCurrentX64: JSBI, sqrtRatioLX64: JSBI, sqrtRatioUX64: JSBI, amountA: BigintIsh, amountB: BigintIsh, useFullPrecision: boolean): JSBI;
