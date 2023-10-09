import { CurrencyAmount, Price, Percent } from "./fractions";
import { Token } from "./token";
import { BigintIsh } from "../internalConstants";
import JSBI from "jsbi";
import { Pool } from "./pool";
interface PositionConstructorArgs {
    id: number;
    owner: string;
    pool: Pool;
    tickLower: number;
    tickUpper: number;
    liquidity: BigintIsh;
    feeGrowthInsideALastX64: BigintIsh;
    feeGrowthInsideBLastX64: BigintIsh;
    feesA: BigintIsh;
    feesB: BigintIsh;
}
interface Fees {
    feesA: CurrencyAmount<Token>;
    feesB: CurrencyAmount<Token>;
}
export declare class Position {
    readonly id: number;
    readonly owner: string;
    readonly pool: Pool;
    readonly tickLower: number;
    readonly tickUpper: number;
    readonly liquidity: JSBI;
    readonly feesA: JSBI;
    readonly feesB: JSBI;
    readonly feeGrowthInsideALastX64: JSBI;
    readonly feeGrowthInsideBLastX64: JSBI;
    private _tokenAAmount;
    private _tokenBAmount;
    private _mintAmounts;
    /**
     * Constructs a position for a given pool with the given liquidity
     * @param pool For which pool the liquidity is assigned
     * @param liquidity The amount of liquidity that is in the position
     * @param lower The lower tick of the position
     * @param upper The upper tick of the position
     */
    constructor({ id, owner, pool, liquidity, tickLower, tickUpper, feeGrowthInsideALastX64, feeGrowthInsideBLastX64, feesA, feesB, }: PositionConstructorArgs);
    get inRange(): boolean;
    /**
     * Returns the price of tokenA at the lower tick
     */
    get tokenAPriceLower(): Price<Token, Token>;
    /**
     * Returns the price of tokenA at the upper tick
     */
    get tokenAPriceUpper(): Price<Token, Token>;
    /**
     * Returns the amount of tokenA that this position's liquidity could be burned for at the current pool price
     */
    get amountA(): CurrencyAmount<Token>;
    /**
     * Returns the amount of tokenB that this position's liquidity could be burned for at the current pool price
     */
    get amountB(): CurrencyAmount<Token>;
    /**
     * Returns the lower and upper sqrt ratios if the price 'slips' up to slippage tolerance percentage
     * @param slippageTolerance The amount by which the price can 'slip' before the transaction will revert
     * @returns The sqrt ratios after slippage
     */
    private ratiosAfterSlippage;
    /**
     * Returns the minimum amounts that must be sent in order to safely mint the amount of liquidity held by the position
     * with the given slippage tolerance
     * @param slippageTolerance Tolerance of unfavorable slippage from the current price
     * @returns The amounts, with slippage
     */
    mintAmountsWithSlippage(slippageTolerance: Percent): Readonly<{
        amountA: JSBI;
        amountB: JSBI;
    }>;
    /**
     * Returns the minimum amounts that should be requested in order to safely burn the amount of liquidity held by the
     * position with the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the current price
     * @returns The amounts, with slippage
     */
    burnAmountsWithSlippage(slippageTolerance: Percent): Readonly<{
        amountA: CurrencyAmount<Token>;
        amountB: CurrencyAmount<Token>;
    }>;
    /**
     * Returns the minimum amounts that must be sent in order to mint the amount of liquidity held by the position at
     * the current price for the pool
     */
    get mintAmounts(): Readonly<{
        amountA: JSBI;
        amountB: JSBI;
    }>;
    /**
     * Computes the maximum amount of liquidity received for a given amount of tokenA, tokenB,
     * and the prices at the tick boundaries.
     * @param pool The pool for which the position should be created
     * @param lower The lower tick of the position
     * @param upper The upper tick of the position
     * @param amountA tokenA amount
     * @param amountB tokenB amount
     * @param useFullPrecision If false, liquidity will be maximized according to what the router can calculate,
     * not what core can theoretically support
     * @returns The amount of liquidity for the position
     */
    static fromAmounts({ id, owner, pool, tickLower, tickUpper, amountA, amountB, useFullPrecision, feeGrowthInsideALastX64, feeGrowthInsideBLastX64, feesA, feesB }: {
        id: number;
        owner: string;
        pool: Pool;
        tickLower: number;
        tickUpper: number;
        amountA: BigintIsh;
        amountB: BigintIsh;
        useFullPrecision: boolean;
        feeGrowthInsideALastX64: BigintIsh;
        feeGrowthInsideBLastX64: BigintIsh;
        feesA: BigintIsh;
        feesB: BigintIsh;
    }): Position;
    /**
     * Computes a position with the maximum amount of liquidity received for a given amount of tokenA, assuming an unlimited amount of tokenB
     * @param pool The pool for which the position is created
     * @param lower The lower tick
     * @param upper The upper tick
     * @param amountA The desired amount of tokenA
     * @param useFullPrecision If true, liquidity will be maximized according to what the router can calculate,
     * not what core can theoretically support
     * @returns The position
     */
    static fromAmountA({ id, owner, pool, tickLower, tickUpper, amountA, useFullPrecision, feeGrowthInsideALastX64, feeGrowthInsideBLastX64, feesA, feesB }: {
        id: number;
        owner: string;
        pool: Pool;
        tickLower: number;
        tickUpper: number;
        amountA: BigintIsh;
        useFullPrecision: boolean;
        feeGrowthInsideALastX64: BigintIsh;
        feeGrowthInsideBLastX64: BigintIsh;
        feesA: BigintIsh;
        feesB: BigintIsh;
    }): Position;
    /**
     * Computes a position with the maximum amount of liquidity received for a given amount of tokenB, assuming an unlimited amount of tokenA
     * @param pool The pool for which the position is created
     * @param lower The lower tick
     * @param upper The upper tick
     * @param amountB The desired amount of tokenB
     * @returns The position
     */
    static fromAmountB({ id, owner, pool, tickLower, tickUpper, amountB, feeGrowthInsideALastX64, feeGrowthInsideBLastX64, feesA, feesB }: {
        id: number;
        owner: string;
        pool: Pool;
        tickLower: number;
        tickUpper: number;
        amountB: BigintIsh;
        feeGrowthInsideALastX64: BigintIsh;
        feeGrowthInsideBLastX64: BigintIsh;
        feesA: BigintIsh;
        feesB: BigintIsh;
    }): Position;
    /**
     * Computes a position fees
     * @returns The position
     */
    getFees(): Promise<Fees>;
}
export {};
