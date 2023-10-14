import { CurrencyAmount, Price } from "./fractions";
import { Token } from "./token";
import { BigintIsh, FeeAmount } from "../internalConstants";
import JSBI from "jsbi";
import { Tick, TickConstructorArgs } from "./tick";
import { TickDataProvider } from "./tickDataProvider";
export interface PoolConstructorArgs {
    id: number;
    tokenA: Token;
    tokenB: Token;
    fee: FeeAmount;
    sqrtPriceX64: BigintIsh;
    liquidity: BigintIsh;
    tickCurrent: number;
    feeGrowthGlobalAX64: BigintIsh;
    feeGrowthGlobalBX64: BigintIsh;
    ticks: TickDataProvider | (Tick | TickConstructorArgs)[];
}
/**
 * Represents a V3 pool
 */
export declare class Pool {
    readonly id: number;
    readonly tokenA: Token;
    readonly tokenB: Token;
    readonly fee: FeeAmount;
    readonly sqrtPriceX64: JSBI;
    readonly liquidity: JSBI;
    readonly tickCurrent: number;
    readonly feeGrowthGlobalAX64: JSBI;
    readonly feeGrowthGlobalBX64: JSBI;
    readonly tickDataProvider: TickDataProvider;
    json: {};
    private _tokenAPrice?;
    private _tokenBPrice?;
    /**
     * Construct a pool
     * @param tokenA One of the tokens in the pool
     * @param tokenB The other token in the pool
     * @param fee The fee in hundredths of a bips of the input amount of every swap that is collected by the pool
     * @param sqrtPriceX64 The sqrt of the current ratio of amounts of tokenB to tokenA
     * @param liquidity The current value of in range liquidity
     * @param tickCurrent The current tick of the pool
     * @param ticks The current state of the pool ticks or a data provider that can return tick data
     */
    constructor({ id, tokenA, tokenB, fee, sqrtPriceX64, liquidity, tickCurrent, ticks, feeGrowthGlobalAX64, feeGrowthGlobalBX64, }: PoolConstructorArgs);
    /**
     * Returns true if the token is either tokenA or tokenB
     * @param token The token to check
     * @returns True if token is either tokenA or token
     */
    involvesToken(token: Token): boolean;
    /**
     * Returns the current mid price of the pool in terms of tokenA, i.e. the ratio of tokenB over tokenA
     */
    get tokenAPrice(): Price<Token, Token>;
    /**
     * Returns the current mid price of the pool in terms of tokenB, i.e. the ratio of tokenA over tokenB
     */
    get tokenBPrice(): Price<Token, Token>;
    /**
     * Return the price of the given token in terms of the other token in the pool.
     * @param token The token to return price of
     * @returns The price of the given token, in terms of the other.
     */
    priceOf(token: Token): Price<Token, Token>;
    /**
     * Given an input amount of a token, return the computed output amount, and a pool with state updated after the trade
     * @param inputAmount The input amount for which to quote the output amount
     * @param sqrtPriceLimitX64 The Q64.96 sqrt price limit
     * @returns The output amount and the pool with updated state
     */
    getOutputAmount(inputAmount: CurrencyAmount<Token>, sqrtPriceLimitX64?: JSBI): [CurrencyAmount<Token>, Pool];
    /**
     * Given an input amount of a token, return the computed output amount, and a pool with state updated after the trade
     * @param inputAmount The input amount for which to quote the output amount
     * @param sqrtPriceLimitX64 The Q64.96 sqrt price limit
     * @returns The output amount and the pool with updated state
     */
    getOutputAmountOptimized(inputAmount: CurrencyAmount<Token>, sqrtPriceLimitX64?: JSBI): CurrencyAmount<Token>;
    getInputAmount(outputAmount: CurrencyAmount<Token>, sqrtPriceLimitX64?: JSBI): [CurrencyAmount<Token>, Pool];
    getInputAmountOptimized(outputAmount: CurrencyAmount<Token>, sqrtPriceLimitX64?: JSBI): CurrencyAmount<Token>;
    /**
     * Given an input amount of a token, return the computed output amount, and a pool with state updated after the trade
     * @param inputAmount The input amount for which to quote the output amount
     * @param sqrtPriceLimitX64 The Q64.96 sqrt price limit
     * @returns The output amount and the pool with updated state
     */
    /**
     * Executes a swap
     * @param zeroForOne Whether the amount in is tokenA or tokenB
     * @param amountSpecified The amount of the swap, which implicitly configures the swap as exact input (positive), or exact output (negative)
     * @param sqrtPriceLimitX64 The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap
     * @returns amountCalculated
     * @returns sqrtPriceX64
     * @returns liquidity
     * @returns tickCurrent
     */
    private swap;
    get tickSpacing(): number;
    static toJSON(pool: Pool): object;
    static deserialize(data: string): Pool;
    equals(other: Pool): boolean;
}
