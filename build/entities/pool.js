"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = void 0;
const fractions_1 = require("./fractions");
const token_1 = require("./token");
const internalConstants_1 = require("../internalConstants");
const jsbi_1 = __importDefault(require("jsbi"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const internalConstants_2 = require("../internalConstants");
const liquidityMath_1 = require("../utils/liquidityMath");
const swapMath_1 = require("../utils/swapMath");
const utils_1 = require("../utils");
const tickDataProvider_1 = require("./tickDataProvider");
const tickListDataProvider_1 = require("./tickListDataProvider");
/**
 * By default, pools will not allow operations that require ticks.
 */
const NO_TICK_DATA_PROVIDER_DEFAULT = new tickDataProvider_1.NoTickDataProvider();
/**
 * Represents a V3 pool
 */
class Pool {
    // private cache = new Map()
    // private cacheSizeLimit = 100000
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
    constructor({ id, tokenA, tokenB, fee, sqrtPriceX64, liquidity, tickCurrent, ticks = NO_TICK_DATA_PROVIDER_DEFAULT, feeGrowthGlobalAX64 = 0, feeGrowthGlobalBX64 = 0, }) {
        (0, tiny_invariant_1.default)(Number.isInteger(fee) && fee < 1000000, "FEE");
        const tickCurrentSqrtRatioX64 = utils_1.TickMath.getSqrtRatioAtTick(tickCurrent);
        const nextTickSqrtRatioX64 = utils_1.TickMath.getSqrtRatioAtTick(tickCurrent + 1);
        (0, tiny_invariant_1.default)(jsbi_1.default.greaterThanOrEqual(jsbi_1.default.BigInt(sqrtPriceX64), tickCurrentSqrtRatioX64) &&
            jsbi_1.default.lessThanOrEqual(jsbi_1.default.BigInt(sqrtPriceX64), nextTickSqrtRatioX64), "PRICE_BOUNDS");
        // always create a copy of the list since we want the pool's tick list to be immutable
        this.id = id;
        this.fee = fee;
        this.sqrtPriceX64 = jsbi_1.default.BigInt(sqrtPriceX64);
        this.liquidity = jsbi_1.default.BigInt(liquidity);
        this.tickCurrent = tickCurrent;
        this.feeGrowthGlobalAX64 = jsbi_1.default.BigInt(feeGrowthGlobalAX64);
        this.feeGrowthGlobalBX64 = jsbi_1.default.BigInt(feeGrowthGlobalBX64);
        this.tickDataProvider = Array.isArray(ticks)
            ? new tickListDataProvider_1.TickListDataProvider(ticks, internalConstants_1.TICK_SPACINGS[fee])
            : ticks;
        [this.tokenA, this.tokenB] = tokenA.sortsBefore(tokenB)
            ? [tokenA, tokenB]
            : [tokenB, tokenA];
    }
    /**
     * Returns true if the token is either tokenA or tokenB
     * @param token The token to check
     * @returns True if token is either tokenA or token
     */
    involvesToken(token) {
        return token.equals(this.tokenA) || token.equals(this.tokenB);
    }
    /**
     * Returns the current mid price of the pool in terms of tokenA, i.e. the ratio of tokenB over tokenA
     */
    get tokenAPrice() {
        var _a;
        return ((_a = this._tokenAPrice) !== null && _a !== void 0 ? _a : (this._tokenAPrice = new fractions_1.Price(this.tokenA, this.tokenB, internalConstants_2.Q128, jsbi_1.default.multiply(this.sqrtPriceX64, this.sqrtPriceX64))));
    }
    /**
     * Returns the current mid price of the pool in terms of tokenB, i.e. the ratio of tokenA over tokenB
     */
    get tokenBPrice() {
        var _a;
        return ((_a = this._tokenBPrice) !== null && _a !== void 0 ? _a : (this._tokenBPrice = new fractions_1.Price(this.tokenB, this.tokenA, jsbi_1.default.multiply(this.sqrtPriceX64, this.sqrtPriceX64), internalConstants_2.Q128)));
    }
    /**
     * Return the price of the given token in terms of the other token in the pool.
     * @param token The token to return price of
     * @returns The price of the given token, in terms of the other.
     */
    priceOf(token) {
        (0, tiny_invariant_1.default)(this.involvesToken(token), "TOKEN");
        return token.equals(this.tokenA) ? this.tokenAPrice : this.tokenBPrice;
    }
    /**
     * Given an input amount of a token, return the computed output amount, and a pool with state updated after the trade
     * @param inputAmount The input amount for which to quote the output amount
     * @param sqrtPriceLimitX64 The Q64.96 sqrt price limit
     * @returns The output amount and the pool with updated state
     */
    getOutputAmount(inputAmount, sqrtPriceLimitX64) {
        (0, tiny_invariant_1.default)(this.involvesToken(inputAmount.currency), "TOKEN");
        const zeroForOne = inputAmount.currency.equals(this.tokenA);
        const { amountCalculated: outputAmount, sqrtPriceX64, liquidity, tickCurrent, } = this.swap(zeroForOne, inputAmount.quotient, sqrtPriceLimitX64);
        const outputToken = zeroForOne ? this.tokenB : this.tokenA;
        return [
            fractions_1.CurrencyAmount.fromRawAmount(outputToken, jsbi_1.default.multiply(outputAmount, internalConstants_2.NEGATIVE_ONE)),
            new Pool({
                id: this.id,
                tokenA: this.tokenA,
                tokenB: this.tokenB,
                fee: this.fee,
                sqrtPriceX64,
                liquidity,
                tickCurrent,
                ticks: this.tickDataProvider,
                feeGrowthGlobalAX64: this.feeGrowthGlobalAX64,
                feeGrowthGlobalBX64: this.feeGrowthGlobalBX64,
            })
        ];
    }
    /**
     * Given an input amount of a token, return the computed output amount, and a pool with state updated after the trade
     * @param inputAmount The input amount for which to quote the output amount
     * @param sqrtPriceLimitX64 The Q64.96 sqrt price limit
     * @returns The output amount and the pool with updated state
     */
    getOutputAmountOptimized(inputAmount, sqrtPriceLimitX64) {
        const zeroForOne = inputAmount.currency.equals(this.tokenA);
        const { amountCalculated: outputAmount } = this.swap(zeroForOne, inputAmount.quotient, sqrtPriceLimitX64);
        const outputToken = zeroForOne ? this.tokenB : this.tokenA;
        return fractions_1.CurrencyAmount.fromRawAmount(outputToken, jsbi_1.default.multiply(outputAmount, internalConstants_2.NEGATIVE_ONE));
    }
    // /**
    //  * Given an input amount of a token, return the computed output amount, and a pool with state updated after the trade
    //  * @param inputAmount The input amount for which to quote the output amount
    //  * @param sqrtPriceLimitX64 The Q64.96 sqrt price limit
    //  * @returns The output amount and the pool with updated state
    //  */
    // public getOutputAmountOptimizedWithCache(
    //     inputAmount: CurrencyAmount<Token>,
    //     sqrtPriceLimitX64?: JSBI
    // ): CurrencyAmount<Token> {
    //   const cacheKey = `${inputAmount.currency.symbol}-${inputAmount.numerator.toString()}-${inputAmount.denominator.toString()}`;
    //   const fromCache = this.cache.get(cacheKey)
    //   if (fromCache) {
    //     return fromCache
    //   }
    //   const zeroForOne = inputAmount.currency.equals(this.tokenA);
    //
    //   const {
    //     amountCalculated: outputAmount
    //   } = this.swap(zeroForOne, inputAmount.quotient, sqrtPriceLimitX64);
    //   const outputToken = zeroForOne ? this.tokenB : this.tokenA;
    //   const result = CurrencyAmount.fromRawAmount(
    //       outputToken,
    //       JSBI.multiply(outputAmount, NEGATIVE_ONE)
    //   )
    //   if (this.cache.size < this.cacheSizeLimit) {
    //     this.cache.set(cacheKey, result)
    //   }
    //   return result;
    // }
    getInputAmount(outputAmount, sqrtPriceLimitX64) {
        const zeroForOne = outputAmount.currency.equals(this.tokenB);
        const { amountCalculated: inputAmount, sqrtPriceX64, liquidity, tickCurrent, } = this.swap(zeroForOne, jsbi_1.default.multiply(outputAmount.quotient, internalConstants_2.NEGATIVE_ONE), sqrtPriceLimitX64);
        const inputToken = zeroForOne ? this.tokenA : this.tokenB;
        return [
            fractions_1.CurrencyAmount.fromRawAmount(inputToken, inputAmount),
            new Pool({
                id: this.id,
                tokenA: this.tokenA,
                tokenB: this.tokenB,
                fee: this.fee,
                sqrtPriceX64,
                liquidity,
                tickCurrent,
                ticks: this.tickDataProvider,
                feeGrowthGlobalAX64: this.feeGrowthGlobalAX64,
                feeGrowthGlobalBX64: this.feeGrowthGlobalBX64,
            }),
        ];
    }
    getInputAmountOptimized(outputAmount, sqrtPriceLimitX64) {
        const zeroForOne = outputAmount.currency.equals(this.tokenB);
        const { amountCalculated: inputAmount } = this.swap(zeroForOne, jsbi_1.default.multiply(outputAmount.quotient, internalConstants_2.NEGATIVE_ONE), sqrtPriceLimitX64);
        const inputToken = zeroForOne ? this.tokenA : this.tokenB;
        return fractions_1.CurrencyAmount.fromRawAmount(inputToken, inputAmount);
    }
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
    swap(zeroForOne, amountSpecified, sqrtPriceLimitX64) {
        if (!sqrtPriceLimitX64)
            sqrtPriceLimitX64 = zeroForOne
                ? jsbi_1.default.add(utils_1.TickMath.MIN_SQRT_RATIO, internalConstants_2.ONE)
                : jsbi_1.default.subtract(utils_1.TickMath.MAX_SQRT_RATIO, internalConstants_2.ONE);
        if (zeroForOne) {
            (0, tiny_invariant_1.default)(jsbi_1.default.greaterThan(sqrtPriceLimitX64, utils_1.TickMath.MIN_SQRT_RATIO), "RATIO_MIN");
            (0, tiny_invariant_1.default)(jsbi_1.default.lessThan(sqrtPriceLimitX64, this.sqrtPriceX64), "RATIO_CURRENT");
        }
        else {
            (0, tiny_invariant_1.default)(jsbi_1.default.lessThan(sqrtPriceLimitX64, utils_1.TickMath.MAX_SQRT_RATIO), "RATIO_MAX");
            (0, tiny_invariant_1.default)(jsbi_1.default.greaterThan(sqrtPriceLimitX64, this.sqrtPriceX64), "RATIO_CURRENT");
        }
        const exactInput = jsbi_1.default.greaterThanOrEqual(amountSpecified, internalConstants_2.ZERO);
        // keep track of swap state
        const state = {
            amountSpecifiedRemaining: amountSpecified,
            amountCalculated: internalConstants_2.ZERO,
            sqrtPriceX64: this.sqrtPriceX64,
            tick: this.tickCurrent,
            liquidity: this.liquidity,
        };
        // start swap while loop
        while (jsbi_1.default.notEqual(state.amountSpecifiedRemaining, internalConstants_2.ZERO) &&
            state.sqrtPriceX64 != sqrtPriceLimitX64) {
            const step = {};
            step.sqrtPriceStartX64 = state.sqrtPriceX64;
            // because each iteration of the while loop rounds, we can't optimize this code (relative to the smart contract)
            // by simply traversing to the next available tick, we instead need to exactly replicate
            // tickBitmap.nextInitializedTickWithinOneWord
            [step.tickNext, step.initialized] =
                this.tickDataProvider.nextInitializedTickWithinOneWord(state.tick, zeroForOne, this.tickSpacing);
            if (step.tickNext < utils_1.TickMath.MIN_TICK) {
                step.tickNext = utils_1.TickMath.MIN_TICK;
            }
            else if (step.tickNext > utils_1.TickMath.MAX_TICK) {
                step.tickNext = utils_1.TickMath.MAX_TICK;
            }
            step.sqrtPriceNextX64 = utils_1.TickMath.getSqrtRatioAtTick(step.tickNext);
            [state.sqrtPriceX64, step.amountIn, step.amountOut, step.feeAmount] =
                swapMath_1.SwapMath.computeSwapStep(state.sqrtPriceX64, (zeroForOne
                    ? jsbi_1.default.lessThan(step.sqrtPriceNextX64, sqrtPriceLimitX64)
                    : jsbi_1.default.greaterThan(step.sqrtPriceNextX64, sqrtPriceLimitX64))
                    ? sqrtPriceLimitX64
                    : step.sqrtPriceNextX64, state.liquidity, state.amountSpecifiedRemaining, this.fee);
            if (exactInput) {
                state.amountSpecifiedRemaining = jsbi_1.default.subtract(state.amountSpecifiedRemaining, jsbi_1.default.add(step.amountIn, step.feeAmount));
                state.amountCalculated = jsbi_1.default.subtract(state.amountCalculated, step.amountOut);
            }
            else {
                state.amountSpecifiedRemaining = jsbi_1.default.add(state.amountSpecifiedRemaining, step.amountOut);
                state.amountCalculated = jsbi_1.default.add(state.amountCalculated, jsbi_1.default.add(step.amountIn, step.feeAmount));
            }
            // TODO
            if (jsbi_1.default.equal(state.sqrtPriceX64, step.sqrtPriceNextX64)) {
                // if the tick is initialized, run the tick transition
                if (step.initialized) {
                    let liquidityNet = jsbi_1.default.BigInt((this.tickDataProvider.getTick(step.tickNext)).liquidityNet);
                    // if we're moving leftward, we interpret liquidityNet as the opposite sign
                    // safe because liquidityNet cannot be type(int128).min
                    if (zeroForOne)
                        liquidityNet = jsbi_1.default.multiply(liquidityNet, internalConstants_2.NEGATIVE_ONE);
                    state.liquidity = liquidityMath_1.LiquidityMath.addDelta(state.liquidity, liquidityNet);
                }
                state.tick = zeroForOne ? step.tickNext - 1 : step.tickNext;
            }
            else if (jsbi_1.default.notEqual(state.sqrtPriceX64, step.sqrtPriceStartX64)) {
                // updated comparison function
                // recompute unless we're on a lower tick boundary (i.e. already transitioned ticks), and haven't moved
                state.tick = utils_1.TickMath.getTickAtSqrtRatio(state.sqrtPriceX64);
            }
        }
        return {
            amountCalculated: state.amountCalculated,
            sqrtPriceX64: state.sqrtPriceX64,
            liquidity: state.liquidity,
            tickCurrent: state.tick,
        };
    }
    get tickSpacing() {
        return internalConstants_1.TICK_SPACINGS[this.fee];
    }
    static toJSON(pool) {
        if (pool.json)
            return pool.json;
        pool.json = {
            id: pool.id,
            tokenA: token_1.Token.toJSON(pool.tokenA),
            tokenB: token_1.Token.toJSON(pool.tokenB),
            fee: pool.fee,
            sqrtPriceX64: pool.sqrtPriceX64.toString(),
            liquidity: pool.liquidity.toString(),
            tickCurrent: pool.tickCurrent,
            feeGrowthGlobalAX64: pool.feeGrowthGlobalAX64.toString(),
            feeGrowthGlobalBX64: pool.feeGrowthGlobalBX64.toString(),
            tickDataProvider: tickListDataProvider_1.TickListDataProvider.toJSON(pool.tickDataProvider.ticks)
        };
        return pool.json;
    }
    static fromJSON(json) {
        return new Pool({
            id: json.id,
            tokenA: token_1.Token.fromJSON(json.tokenA),
            tokenB: token_1.Token.fromJSON(json.tokenB),
            fee: json.fee,
            sqrtPriceX64: jsbi_1.default.BigInt(json.sqrtPriceX64),
            liquidity: jsbi_1.default.BigInt(json.liquidity),
            tickCurrent: json.tickCurrent,
            feeGrowthGlobalAX64: jsbi_1.default.BigInt(json.feeGrowthGlobalAX64),
            feeGrowthGlobalBX64: jsbi_1.default.BigInt(json.feeGrowthGlobalBX64),
            ticks: tickListDataProvider_1.TickListDataProvider.fromJSON(json.tickDataProvider)
        });
    }
    equals(other) {
        // Сравниваем id пулов
        if (this.id !== other.id)
            return false;
        // Сравниваем fee
        if (this.fee !== other.fee)
            return false;
        // Сравниваем sqrtPriceX64
        if (!jsbi_1.default.equal(this.sqrtPriceX64, other.sqrtPriceX64))
            return false;
        // Сравниваем liquidity
        if (!jsbi_1.default.equal(this.liquidity, other.liquidity))
            return false;
        // Сравниваем tickCurrent
        if (this.tickCurrent !== other.tickCurrent)
            return false;
        // Сравниваем токены (предполагается, что у Token есть метод equals)
        if (!this.tokenA.equals(other.tokenA) || !this.tokenB.equals(other.tokenB))
            return false;
        // Если все проверки прошли, объекты считаются равными
        return true;
    }
}
exports.Pool = Pool;
