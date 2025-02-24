"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trade = exports.tradeComparator = void 0;
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const fractions_1 = require("./fractions");
const utils_1 = require("../utils");
const internalConstants_1 = require("../internalConstants");
const route_1 = require("./route");
const WorkerPool_1 = require("../workers/WorkerPool");
/**
 * Trades comparator, an extension of the input output comparator that also considers other dimensions of the trade in ranking them
 * @template TInput The input token, either Ether or an ERC-20
 * @template TOutput The output token, either Ether or an ERC-20
 * @template TTradeType The trade type, either exact input or exact output
 * @param a The first trade to compare
 * @param b The second trade to compare
 * @returns A sorted ordering for two neighboring elements in a trade array
 */
function tradeComparator(a, b) {
    // must have same input and output token for comparison
    (0, tiny_invariant_1.default)(a.inputAmount.currency.equals(b.inputAmount.currency), 'INPUT_CURRENCY');
    (0, tiny_invariant_1.default)(a.outputAmount.currency.equals(b.outputAmount.currency), 'OUTPUT_CURRENCY');
    if (a.outputAmount.equalTo(b.outputAmount)) {
        if (a.inputAmount.equalTo(b.inputAmount)) {
            // consider the number of hops since each hop costs gas
            const aHops = a.swaps.reduce((total, cur) => total + cur.route.tokenPath.length, 0);
            const bHops = b.swaps.reduce((total, cur) => total + cur.route.tokenPath.length, 0);
            return aHops - bHops;
        }
        // trade A requires less input than trade B, so A should come first
        if (a.inputAmount.lessThan(b.inputAmount)) {
            return -1;
        }
        else {
            return 1;
        }
    }
    else {
        // tradeA has less output than trade B, so should come second
        if (a.outputAmount.lessThan(b.outputAmount)) {
            return 1;
        }
        else {
            return -1;
        }
    }
}
exports.tradeComparator = tradeComparator;
/**
 * Represents a trade executed against a set of routes where some percentage of the input is
 * split across each route.
 *
 * Each route has its own set of pools. Pools can not be re-used across routes.
 *
 * Does not account for slippage, i.e., changes in price environment that can occur between
 * the time the trade is submitted and when it is executed.
 * @template TInput The input token, either Ether or an ERC-20
 * @template TOutput The output token, either Ether or an ERC-20
 * @template TTradeType The trade type, either exact input or exact output
 */
class Trade {
    /**
     * @deprecated Deprecated in favor of 'swaps' property. If the trade consists of multiple routes
     * this will return an error.
     *
     * When the trade consists of just a single route, this returns the route of the trade,
     * i.e. which pools the trade goes through.
     */
    get route() {
        (0, tiny_invariant_1.default)(this.swaps.length == 1, 'MULTIPLE_ROUTES');
        return this.swaps[0].route;
    }
    /**
     * The input amount for the trade assuming no slippage.
     */
    get inputAmount() {
        if (this._inputAmount) {
            return this._inputAmount;
        }
        const inputCurrency = this.swaps[0].inputAmount.currency;
        const totalInputFromRoutes = this.swaps
            .map(({ inputAmount }) => inputAmount)
            .reduce((total, cur) => total.add(cur), fractions_1.CurrencyAmount.fromRawAmount(inputCurrency, 0));
        this._inputAmount = totalInputFromRoutes;
        return this._inputAmount;
    }
    /**
     * The output amount for the trade assuming no slippage.
     */
    get outputAmount() {
        if (this._outputAmount) {
            return this._outputAmount;
        }
        const outputCurrency = this.swaps[0].outputAmount.currency;
        const totalOutputFromRoutes = this.swaps
            .map(({ outputAmount }) => outputAmount)
            .reduce((total, cur) => total.add(cur), fractions_1.CurrencyAmount.fromRawAmount(outputCurrency, 0));
        this._outputAmount = totalOutputFromRoutes;
        return this._outputAmount;
    }
    /**
     * The price expressed in terms of output amount/input amount.
     */
    get executionPrice() {
        var _a;
        return ((_a = this._executionPrice) !== null && _a !== void 0 ? _a : (this._executionPrice = new fractions_1.Price(this.inputAmount.currency, this.outputAmount.currency, this.inputAmount.quotient, this.outputAmount.quotient)));
    }
    /**
     * Returns the percent difference between the route's mid price and the price impact
     */
    get priceImpact() {
        if (this._priceImpact) {
            return this._priceImpact;
        }
        let spotOutputAmount = fractions_1.CurrencyAmount.fromRawAmount(this.outputAmount.currency, 0);
        for (const { route, inputAmount } of this.swaps) {
            const midPrice = route.midPrice;
            spotOutputAmount = spotOutputAmount.add(midPrice.quote(inputAmount));
        }
        const priceImpact = spotOutputAmount.subtract(this.outputAmount).divide(spotOutputAmount);
        this._priceImpact = new fractions_1.Percent(priceImpact.numerator, priceImpact.denominator);
        return this._priceImpact;
    }
    /**
     * Constructs an exact in trade with the given amount in and route
     * @template TInput The input token, either Ether or an ERC-20
     * @template TOutput The output token, either Ether or an ERC-20
     * @param route The route of the exact in trade
     * @param amountIn The amount being passed in
     * @returns The exact in trade
     */
    static exactIn(route, amountIn) {
        return __awaiter(this, void 0, void 0, function* () {
            return Trade.fromRoute(route, amountIn, internalConstants_1.TradeType.EXACT_INPUT);
        });
    }
    /**
     * Constructs an exact out trade with the given amount out and route
     * @template TInput The input token, either Ether or an ERC-20
     * @template TOutput The output token, either Ether or an ERC-20
     * @param route The route of the exact out trade
     * @param amountOut The amount returned by the trade
     * @returns The exact out trade
     */
    static exactOut(route, amountOut) {
        return __awaiter(this, void 0, void 0, function* () {
            return Trade.fromRoute(route, amountOut, internalConstants_1.TradeType.EXACT_OUTPUT);
        });
    }
    /**
     * Constructs a trade by simulating swaps through the given route
     * @template TInput The input token, either Ether or an ERC-20.
     * @template TOutput The output token, either Ether or an ERC-20.
     * @template TTradeType The type of the trade, either exact in or exact out.
     * @param route route to swap through
     * @param amount the amount specified, either input or output, depending on tradeType
     * @param tradeType whether the trade is an exact input or exact output swap
     * @returns The route
     */
    static fromRoute(route, amount, tradeType) {
        const amounts = new Array(route.tokenPath.length);
        let inputAmount;
        let outputAmount;
        if (tradeType === internalConstants_1.TradeType.EXACT_INPUT) {
            (0, tiny_invariant_1.default)(amount.currency.equals(route.input), 'INPUT');
            amounts[0] = amount;
            for (let i = 0; i < route.tokenPath.length - 1; i++) {
                const pool = route.pools[i];
                amounts[i + 1] = pool.getOutputAmountOptimized(amounts[i]);
            }
            inputAmount = fractions_1.CurrencyAmount.fromFractionalAmount(route.input, amount.numerator, amount.denominator);
            outputAmount = fractions_1.CurrencyAmount.fromFractionalAmount(route.output, amounts[amounts.length - 1].numerator, amounts[amounts.length - 1].denominator);
        }
        else {
            (0, tiny_invariant_1.default)(amount.currency.equals(route.output), 'OUTPUT');
            amounts[amounts.length - 1] = amount;
            for (let i = route.tokenPath.length - 1; i > 0; i--) {
                const pool = route.pools[i - 1];
                amounts[i - 1] = pool.getInputAmountOptimized(amounts[i]);
            }
            inputAmount = fractions_1.CurrencyAmount.fromFractionalAmount(route.input, amounts[0].numerator, amounts[0].denominator);
            outputAmount = fractions_1.CurrencyAmount.fromFractionalAmount(route.output, amount.numerator, amount.denominator);
        }
        return new Trade({
            routes: [{ inputAmount, outputAmount, route }],
            tradeType
        });
    }
    // public static fromRouteForWorkers<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType>(
    //     route: Route<TInput, TOutput>,
    //     amount: TTradeType extends TradeType.EXACT_INPUT ? CurrencyAmount<TInput> : CurrencyAmount<TOutput>,
    //     tradeType: TTradeType
    // ): any {
    //     const amounts: CurrencyAmount<Token>[] = new Array(route.tokenPath.length)
    //     let inputAmount: CurrencyAmount<TInput>
    //     let outputAmount: CurrencyAmount<TOutput>
    //     if (tradeType === TradeType.EXACT_INPUT) {
    //         invariant(amount.currency.equals(route.input), 'INPUT')
    //         amounts[0] = amount
    //         for (let i = 0; i < route.tokenPath.length - 1; i++) {
    //             const pool = route.pools[i]
    //             amounts[i + 1] = pool.getOutputAmountOptimized(amounts[i])
    //         }
    //         inputAmount = CurrencyAmount.fromFractionalAmount(route.input, amount.numerator, amount.denominator)
    //         outputAmount = CurrencyAmount.fromFractionalAmount(
    //             route.output,
    //             amounts[amounts.length - 1].numerator,
    //             amounts[amounts.length - 1].denominator
    //         )
    //     } else {
    //         invariant(amount.currency.equals(route.output), 'OUTPUT')
    //         amounts[amounts.length - 1] = amount
    //         for (let i = route.tokenPath.length - 1; i > 0; i--) {
    //             const pool = route.pools[i - 1]
    //             amounts[i - 1] = pool.getInputAmountOptimized(amounts[i])
    //         }
    //         inputAmount = CurrencyAmount.fromFractionalAmount(route.input, amounts[0].numerator, amounts[0].denominator)
    //         outputAmount = CurrencyAmount.fromFractionalAmount(route.output, amount.numerator, amount.denominator)
    //     }
    //     //if (!trade.inputAmount.greaterThan(0) || !trade.priceImpact.greaterThan(0))
    //         return {inputAmount, outputAmount}
    // }
    /**
     * Constructs a trade from routes by simulating swaps
     *
     * @template TInput The input token, either Ether or an ERC-20.
     * @template TOutput The output token, either Ether or an ERC-20.
     * @template TTradeType The type of the trade, either exact in or exact out.
     * @param routes the routes to swap through and how much of the amount should be routed through each
     * @param tradeType whether the trade is an exact input or exact output swap
     * @returns The trade
     */
    static fromRoutes(routes, tradeType) {
        const populatedRoutes = [];
        for (const { route, amount } of routes) {
            const amounts = new Array(route.tokenPath.length);
            let inputAmount;
            let outputAmount;
            if (tradeType === internalConstants_1.TradeType.EXACT_INPUT) {
                (0, tiny_invariant_1.default)(amount.currency.equals(route.input), 'INPUT');
                inputAmount = fractions_1.CurrencyAmount.fromFractionalAmount(route.input, amount.numerator, amount.denominator);
                amounts[0] = fractions_1.CurrencyAmount.fromFractionalAmount(route.input, amount.numerator, amount.denominator);
                for (let i = 0; i < route.tokenPath.length - 1; i++) {
                    const pool = route.pools[i];
                    amounts[i + 1] = pool.getOutputAmountOptimized(amounts[i]);
                }
                outputAmount = fractions_1.CurrencyAmount.fromFractionalAmount(route.output, amounts[amounts.length - 1].numerator, amounts[amounts.length - 1].denominator);
            }
            else {
                (0, tiny_invariant_1.default)(amount.currency.equals(route.output), 'OUTPUT');
                outputAmount = fractions_1.CurrencyAmount.fromFractionalAmount(route.output, amount.numerator, amount.denominator);
                amounts[amounts.length - 1] = fractions_1.CurrencyAmount.fromFractionalAmount(route.output, amount.numerator, amount.denominator);
                for (let i = route.tokenPath.length - 1; i > 0; i--) {
                    const pool = route.pools[i - 1];
                    amounts[i - 1] = pool.getInputAmountOptimized(amounts[i]);
                }
                inputAmount = fractions_1.CurrencyAmount.fromFractionalAmount(route.input, amounts[0].numerator, amounts[0].denominator);
            }
            populatedRoutes.push({ route, inputAmount, outputAmount });
        }
        return new Trade({
            routes: populatedRoutes,
            tradeType
        });
    }
    /**
     * Creates a trade without computing the result of swapping through the route. Useful when you have simulated the trade
     * elsewhere and do not have any tick data
     * @template TInput The input token, either Ether or an ERC-20
     * @template TOutput The output token, either Ether or an ERC-20
     * @template TTradeType The type of the trade, either exact in or exact out
     * @param constructorArguments The arguments passed to the trade constructor
     * @returns The unchecked trade
     */
    static createUncheckedTrade(constructorArguments) {
        return new Trade(Object.assign(Object.assign({}, constructorArguments), { routes: [
                {
                    inputAmount: constructorArguments.inputAmount,
                    outputAmount: constructorArguments.outputAmount,
                    route: constructorArguments.route
                }
            ] }));
    }
    /**
     * Creates a trade without computing the result of swapping through the routes. Useful when you have simulated the trade
     * elsewhere and do not have any tick data
     * @template TInput The input token, either Ether or an ERC-20
     * @template TOutput The output token, either Ether or an ERC-20
     * @template TTradeType The type of the trade, either exact in or exact out
     * @param constructorArguments The arguments passed to the trade constructor
     * @returns The unchecked trade
     */
    static createUncheckedTradeWithMultipleRoutes(constructorArguments) {
        return new Trade(constructorArguments);
    }
    /**
     * Construct a trade by passing in the pre-computed property values
     * @param routes The routes through which the trade occurs
     * @param tradeType The type of trade, exact input or exact output
     */
    constructor({ routes, tradeType }) {
        const inputCurrency = routes[0].inputAmount.currency;
        const outputCurrency = routes[0].outputAmount.currency;
        (0, tiny_invariant_1.default)(routes.every(({ route }) => inputCurrency.equals(route.input)), 'INPUT_CURRENCY_MATCH');
        (0, tiny_invariant_1.default)(routes.every(({ route }) => outputCurrency.equals(route.output)), 'OUTPUT_CURRENCY_MATCH');
        const numPools = routes.map(({ route }) => route.pools.length).reduce((total, cur) => total + cur, 0);
        const poolAddressSet = new Set();
        for (const { route } of routes) {
            for (const pool of route.pools) {
                poolAddressSet.add(pool.id);
            }
        }
        (0, tiny_invariant_1.default)(numPools == poolAddressSet.size, 'POOLS_DUPLICATED');
        this.swaps = routes;
        this.tradeType = tradeType;
    }
    /**
     * Get the minimum amount that must be received from this trade for the given slippage tolerance
     * @param slippageTolerance The tolerance of unfavorable slippage from the execution price of this trade
     * @returns The amount out
     */
    minimumAmountOut(slippageTolerance, amountOut = this.outputAmount) {
        (0, tiny_invariant_1.default)(!slippageTolerance.lessThan(internalConstants_1.ZERO), 'SLIPPAGE_TOLERANCE');
        if (this.tradeType === internalConstants_1.TradeType.EXACT_OUTPUT) {
            return amountOut;
        }
        else {
            const slippageAdjustedAmountOut = new fractions_1.Fraction(internalConstants_1.ONE)
                .add(slippageTolerance)
                .invert()
                .multiply(amountOut.quotient).quotient;
            return fractions_1.CurrencyAmount.fromRawAmount(amountOut.currency, slippageAdjustedAmountOut);
        }
    }
    /**
     * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
     * @param slippageTolerance The tolerance of unfavorable slippage from the execution price of this trade
     * @returns The amount in
     */
    maximumAmountIn(slippageTolerance, amountIn = this.inputAmount) {
        (0, tiny_invariant_1.default)(!slippageTolerance.lessThan(internalConstants_1.ZERO), 'SLIPPAGE_TOLERANCE');
        if (this.tradeType === internalConstants_1.TradeType.EXACT_INPUT) {
            return amountIn;
        }
        else {
            const slippageAdjustedAmountIn = new fractions_1.Fraction(internalConstants_1.ONE).add(slippageTolerance).multiply(amountIn.quotient).quotient;
            return fractions_1.CurrencyAmount.fromRawAmount(amountIn.currency, slippageAdjustedAmountIn);
        }
    }
    /**
     * Return the execution price after accounting for slippage tolerance
     * @param slippageTolerance the allowed tolerated slippage
     * @returns The execution price
     */
    worstExecutionPrice(slippageTolerance) {
        return new fractions_1.Price(this.inputAmount.currency, this.outputAmount.currency, this.maximumAmountIn(slippageTolerance).quotient, this.minimumAmountOut(slippageTolerance).quotient);
    }
    /**
     * Given a list of pools, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
     * amount to an output token, making at most `maxHops` hops.
     * Note this does not consider aggregation, as routes are linear. It's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param pools the pools to consider in finding the best trade
     * @param nextAmountIn exact amount of input currency to spend
     * @param currencyOut the desired currency out
     * @param maxNumResults maximum number of results to return
     * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pool
     * @param currentPools used in recursion; the current list of pools
     * @param currencyAmountIn used in recursion; the original value of the currencyAmountIn parameter
     * @param bestTrades used in recursion; the current list of best trades
     * @returns The exact in trade
     */
    static bestTradeExactIn(pools, currencyAmountIn, currencyOut, { maxNumResults = 3, maxHops = 3 } = {}, 
    // used in recursion.
    currentPools = [], nextAmountIn = currencyAmountIn, bestTrades = []) {
        (0, tiny_invariant_1.default)(pools.length > 0, 'POOLS');
        (0, tiny_invariant_1.default)(maxHops > 0, 'MAX_HOPS');
        (0, tiny_invariant_1.default)(currencyAmountIn === nextAmountIn || currentPools.length > 0, 'INVALID_RECURSION');
        const amountIn = nextAmountIn;
        const tokenOut = currencyOut;
        for (let i = 0; i < pools.length; i++) {
            const pool = pools[i];
            // pool irrelevant
            if (!pool.tokenA.equals(amountIn.currency) && !pool.tokenB.equals(amountIn.currency))
                continue;
            let amountOut;
            try {
                amountOut = pool.getOutputAmountOptimized(amountIn);
            }
            catch (error) {
                // input too low
                if (error.isInsufficientInputAmountError) {
                    continue;
                }
                throw error;
            }
            // we have arrived at the output token, so this is the final trade of one of the paths
            if (amountOut.currency && amountOut.currency.equals(tokenOut)) {
                const trade = Trade.fromRoute(new route_1.Route([...currentPools, pool], currencyAmountIn.currency, currencyOut), currencyAmountIn, internalConstants_1.TradeType.EXACT_INPUT);
                //FIX hotfix, i do not really sure about it
                if (!trade.inputAmount.greaterThan(0) || !trade.priceImpact.greaterThan(0))
                    continue;
                (0, utils_1.sortedInsert)(bestTrades, trade, maxNumResults, tradeComparator);
            }
            else if (maxHops > 1 && pools.length > 1) {
                const poolsExcludingThisPool = pools.slice(0, i).concat(pools.slice(i + 1, pools.length));
                // otherwise, consider all the other paths that lead from this token as long as we have not exceeded maxHops
                Trade.bestTradeExactIn(poolsExcludingThisPool, currencyAmountIn, currencyOut, {
                    maxNumResults,
                    maxHops: maxHops - 1
                }, [...currentPools, pool], amountOut, bestTrades);
            }
        }
        return bestTrades;
    }
    /**
     * similar to the above method but instead targets a fixed output amount
     * given a list of pools, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
     * to an output token amount, making at most `maxHops` hops
     * note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param pools the pools to consider in finding the best trade
     * @param currencyIn the currency to spend
     * @param currencyAmountOut the desired currency amount out
     * @param nextAmountOut the exact amount of currency out
     * @param maxNumResults maximum number of results to return
     * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pool
     * @param currentPools used in recursion; the current list of pools
     * @param bestTrades used in recursion; the current list of best trades
     * @returns The exact out trade
     */
    static bestTradeExactOut(pools, currencyIn, currencyAmountOut, { maxNumResults = 3, maxHops = 3 } = {}, 
    // used in recursion.
    currentPools = [], nextAmountOut = currencyAmountOut, bestTrades = []) {
        (0, tiny_invariant_1.default)(pools.length > 0, 'POOLS');
        (0, tiny_invariant_1.default)(maxHops > 0, 'MAX_HOPS');
        (0, tiny_invariant_1.default)(currencyAmountOut === nextAmountOut || currentPools.length > 0, 'INVALID_RECURSION');
        const amountOut = nextAmountOut;
        const tokenIn = currencyIn;
        for (let i = 0; i < pools.length; i++) {
            const pool = pools[i];
            // pool irrelevant
            if (!pool.tokenA.equals(amountOut.currency) && !pool.tokenB.equals(amountOut.currency))
                continue;
            let amountIn;
            try {
                amountIn = pool.getInputAmountOptimized(amountOut);
            }
            catch (error) {
                // not enough liquidity in this pool
                if (error.isInsufficientReservesError) {
                    continue;
                }
                throw error;
            }
            // we have arrived at the input token, so this is the first trade of one of the paths
            if (amountIn.currency.equals(tokenIn)) {
                const trade = Trade.fromRoute(new route_1.Route([pool, ...currentPools], currencyIn, currencyAmountOut.currency), currencyAmountOut, internalConstants_1.TradeType.EXACT_OUTPUT);
                // FIX hotfix, i do not really sure about it
                if (!trade.inputAmount.greaterThan(0) || !trade.priceImpact.greaterThan(0))
                    continue;
                //
                (0, utils_1.sortedInsert)(bestTrades, trade, maxNumResults, tradeComparator);
            }
            else if (maxHops > 1 && pools.length > 1) {
                const poolsExcludingThisPool = pools.slice(0, i).concat(pools.slice(i + 1, pools.length));
                // otherwise, consider all the other paths that arrive at this token as long as we have not exceeded maxHops
                Trade.bestTradeExactOut(poolsExcludingThisPool, currencyIn, currencyAmountOut, {
                    maxNumResults,
                    maxHops: maxHops - 1
                }, [pool, ...currentPools], amountIn, bestTrades);
            }
        }
        return bestTrades;
    }
    /**
     * Given a list of routes, and a fixed amount in, returns the best trade that go from an input token to output token.
     * @param routes from input to output.
     * @param currencyAmount the exact amount that will be spent if type "EXACT_INPUT" or that will be received if "EXACT_OUTPUT".
     * @param tradeType the type of trade, exact input or exact output.
     * @returns trade if at least one is found. Otherwise, undefined.
     */
    static bestTradeSingleThread(routes, currencyAmount, tradeType) {
        (0, tiny_invariant_1.default)(routes.length > 0, 'ROUTES');
        const bestTrades = [];
        for (const route of routes) {
            const trade = Trade.fromRoute(route, currencyAmount, tradeType);
            if (!trade.inputAmount.greaterThan(0) || !trade.priceImpact.greaterThan(0))
                continue;
            (0, utils_1.sortedInsert)(bestTrades, trade, 1, tradeComparator);
        }
        const bestTrade = bestTrades[0];
        if (!bestTrade.inputAmount.greaterThan(0) || !bestTrade.priceImpact.greaterThan(0))
            return;
        return bestTrade;
    }
    /**
     * Creates a pool of workers for future use in bestTradeMultiThreads method.
     * @param threadsCount number of created threads.
     * It makes sense to create from 4 threads depending on your device,
     * otherwise it is better to use a single thread solution.
     */
    static initWorkerPool(threadsCount = 7) {
        return __awaiter(this, void 0, void 0, function* () {
            this.workerPool = yield WorkerPool_1.WorkerPool.create(threadsCount);
            console.log('Pool started with', threadsCount, 'workers');
        });
    }
    /**
     * Similar to the above method but uses multithreading, in case you initiated the workers in advance.
     * Otherwise, uses a single-threaded solution.
     * @param routes from input to output.
     * @param currencyAmount the exact amount that will be spent if type "EXACT_INPUT" or that will be received if "EXACT_OUTPUT".
     * @param tradeType the type of trade, exact input or exact output.
     * @returns trade if at least one is found. Otherwise, undefined.
     */
    static bestTradeMultiThreads(routes, currencyAmount, tradeType) {
        return __awaiter(this, void 0, void 0, function* () {
            const workerPool = this.workerPool;
            if (!workerPool) {
                console.warn('workerPool is not initialized, single-threaded version is used.' +
                    '\n use "await Trade.initWorkerPool()" for multi-threaded');
                return this.bestTradeSingleThread(routes, currencyAmount, tradeType);
            }
            (0, tiny_invariant_1.default)(routes.length > 0, 'ROUTES');
            //const serializationStart = performance.now()
            const amountInBuffer = fractions_1.CurrencyAmount.toBuffer(currencyAmount);
            //console.log('routesCount:', routes.length)
            for (const route of routes) {
                const optionsJSON = {
                    route: route,
                    amount: amountInBuffer,
                    tradeType
                };
                workerPool.addTaskJSON(optionsJSON);
                //const optionsBuffer = msgpack.encode(optionsJSON);
                //workerPool.addTaskBuffer(optionsBuffer)
            }
            //console.log('prepare tasks', performance.now() - serializationStart)
            //const workersStart = performance.now()
            const results = yield workerPool.waitForWorkersAndReturnResult();
            //console.log('workers summary', performance.now() - workersStart)
            //const mainThreadPostWorkStart = performance.now()
            const bestResult = {};
            const isExactIn = tradeType === internalConstants_1.TradeType.EXACT_INPUT;
            for (const [index, value] of results) {
                if (!bestResult.amounts) {
                    bestResult.amounts = value;
                    bestResult.routeId = index;
                }
                if (isExactIn) {
                    if (bestResult.amounts.outputAmount.lessThan(value.outputAmount)) {
                        bestResult.amounts = value;
                        bestResult.routeId = index;
                    }
                }
                else {
                    if (value.inputAmount.lessThan(bestResult.amounts.inputAmount)) {
                        bestResult.amounts = value;
                        bestResult.routeId = index;
                    }
                }
            }
            bestResult.route = routes[bestResult.routeId];
            //console.log('mainThreadPostWork', performance.now() - mainThreadPostWorkStart)
            //const finallyTradeStart = performance.now()
            const finallyTrade = Trade.fromRoute(routes[bestResult.routeId], currencyAmount, tradeType);
            if (!finallyTrade.inputAmount.greaterThan(0) || !finallyTrade.priceImpact.greaterThan(0))
                return;
            //console.log('finallyTrade', performance.now() - finallyTradeStart)
            return finallyTrade;
        });
    }
}
exports.Trade = Trade;
