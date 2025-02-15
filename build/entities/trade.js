"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Trade = void 0;
exports.tradeComparator = tradeComparator;
var _lodash = _interopRequireDefault(require("lodash"));
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _fractions = require("./fractions");
var _utils = require("../utils");
var _internalConstants = require("../internalConstants");
var _getBestSwapRoute = require("../utils/getBestSwapRoute");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
  (0, _tinyInvariant.default)(a.inputAmount.currency.equals(b.inputAmount.currency), 'INPUT_CURRENCY');
  (0, _tinyInvariant.default)(a.outputAmount.currency.equals(b.outputAmount.currency), 'OUTPUT_CURRENCY');
  if (a.outputAmount.equalTo(b.outputAmount)) {
    if (a.inputAmount.equalTo(b.inputAmount)) {
      // consider the number of hops since each hop costs cpu
      const aHops = a.swaps.reduce((total, cur) => total + cur.route.tokenPath.length, 0);
      const bHops = b.swaps.reduce((total, cur) => total + cur.route.tokenPath.length, 0);
      return aHops - bHops;
    }
    // trade A requires less input than trade B, so A should come first
    if (a.inputAmount.lessThan(b.inputAmount)) {
      return -1;
    } else {
      return 1;
    }
  } else {
    // tradeA has less output than trade B, so should come second
    if (a.outputAmount.lessThan(b.outputAmount)) {
      return 1;
    } else {
      return -1;
    }
  }
}
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
let Trade = exports.Trade = /*#__PURE__*/function () {
  /**
   * Construct a trade by passing in the pre-computed property values
   * @param routes The routes through which the trade occurs
   * @param tradeType The type of trade, exact input or exact output
   */
  function Trade(_ref) {
    let {
      routes,
      tradeType
    } = _ref;
    _classCallCheck(this, Trade);
    /**
     * The swaps of the trade, i.e. which routes and how much is swapped in each that
     * make up the trade.
     */
    _defineProperty(this, "swaps", void 0);
    /**
     * The type of the trade, either exact in or exact out.
     */
    _defineProperty(this, "tradeType", void 0);
    /**
     * The cached result of the input amount computation
     * @private
     */
    _defineProperty(this, "_inputAmount", void 0);
    /**
     * The cached result of the output amount computation
     * @private
     */
    _defineProperty(this, "_outputAmount", void 0);
    /**
     * The cached result of the computed execution price
     * @private
     */
    _defineProperty(this, "_executionPrice", void 0);
    /**
     * The cached result of the price impact computation
     * @private
     */
    _defineProperty(this, "_priceImpact", void 0);
    const inputCurrency = routes[0].inputAmount.currency;
    const outputCurrency = routes[0].outputAmount.currency;
    (0, _tinyInvariant.default)(routes.every(_ref2 => {
      let {
        route
      } = _ref2;
      return inputCurrency.equals(route.input);
    }), 'INPUT_CURRENCY_MATCH');
    (0, _tinyInvariant.default)(routes.every(_ref3 => {
      let {
        route
      } = _ref3;
      return outputCurrency.equals(route.output);
    }), 'OUTPUT_CURRENCY_MATCH');
    const numPools = routes.map(_ref4 => {
      let {
        route
      } = _ref4;
      return route.pools.length;
    }).reduce((total, cur) => total + cur, 0);
    const poolAddressSet = new Set();
    for (const {
      route
    } of routes) {
      for (const pool of route.pools) {
        poolAddressSet.add(pool.id);
      }
    }
    (0, _tinyInvariant.default)(numPools == poolAddressSet.size, 'POOLS_DUPLICATED');
    this.swaps = routes;
    this.tradeType = tradeType;
  }

  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance The tolerance of unfavorable slippage from the execution price of this trade
   * @returns The amount out
   */
  return _createClass(Trade, [{
    key: "route",
    get:
    /**
     * @deprecated Deprecated in favor of 'swaps' property. If the trade consists of multiple routes
     * this will return an error.
     *
     * When the trade consists of just a single route, this returns the route of the trade,
     * i.e. which pools the trade goes through.
     */
    function () {
      (0, _tinyInvariant.default)(this.swaps.length == 1, 'MULTIPLE_ROUTES');
      return this.swaps[0].route;
    }
  }, {
    key: "inputAmount",
    get:
    /**
     * The input amount for the trade assuming no slippage.
     */
    function () {
      if (this._inputAmount) {
        return this._inputAmount;
      }
      const inputCurrency = this.swaps[0].inputAmount.currency;
      const totalInputFromRoutes = this.swaps.map(_ref5 => {
        let {
          inputAmount
        } = _ref5;
        return inputAmount;
      }).reduce((total, cur) => total.add(cur), _fractions.CurrencyAmount.fromRawAmount(inputCurrency, 0));
      this._inputAmount = totalInputFromRoutes;
      return this._inputAmount;
    }
  }, {
    key: "outputAmount",
    get:
    /**
     * The output amount for the trade assuming no slippage.
     */
    function () {
      if (this._outputAmount) {
        return this._outputAmount;
      }
      const outputCurrency = this.swaps[0].outputAmount.currency;
      const totalOutputFromRoutes = this.swaps.map(_ref6 => {
        let {
          outputAmount
        } = _ref6;
        return outputAmount;
      }).reduce((total, cur) => total.add(cur), _fractions.CurrencyAmount.fromRawAmount(outputCurrency, 0));
      this._outputAmount = totalOutputFromRoutes;
      return this._outputAmount;
    }
  }, {
    key: "executionPrice",
    get:
    /**
     * The price expressed in terms of output amount/input amount.
     */
    function () {
      var _this$_executionPrice;
      return (_this$_executionPrice = this._executionPrice) !== null && _this$_executionPrice !== void 0 ? _this$_executionPrice : this._executionPrice = new _fractions.Price(this.inputAmount.currency, this.outputAmount.currency, this.inputAmount.quotient, this.outputAmount.quotient);
    }
  }, {
    key: "priceImpact",
    get:
    /**
     * Returns the percent difference between the route's mid price and the price impact
     */
    function () {
      if (this._priceImpact) {
        return this._priceImpact;
      }
      let spotOutputAmount = _fractions.CurrencyAmount.fromRawAmount(this.outputAmount.currency, 0);
      for (const {
        route,
        inputAmount
      } of this.swaps) {
        const midPrice = route.midPrice;
        spotOutputAmount = spotOutputAmount.add(midPrice.quote(inputAmount));
      }
      const priceImpact = spotOutputAmount.subtract(this.outputAmount).divide(spotOutputAmount);
      this._priceImpact = new _fractions.Percent(priceImpact.numerator, priceImpact.denominator);
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
  }, {
    key: "minimumAmountOut",
    value: function minimumAmountOut(slippageTolerance) {
      let amountOut = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.outputAmount;
      (0, _tinyInvariant.default)(!slippageTolerance.lessThan(_internalConstants.ZERO), 'SLIPPAGE_TOLERANCE');
      if (this.tradeType === _internalConstants.TradeType.EXACT_OUTPUT) {
        return amountOut;
      } else {
        const slippageAdjustedAmountOut = new _fractions.Fraction(_internalConstants.ONE).add(slippageTolerance).invert().multiply(amountOut.quotient).quotient;
        return _fractions.CurrencyAmount.fromRawAmount(amountOut.currency, slippageAdjustedAmountOut);
      }
    }

    /**
     * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
     * @param slippageTolerance The tolerance of unfavorable slippage from the execution price of this trade
     * @returns The amount in
     */
  }, {
    key: "maximumAmountIn",
    value: function maximumAmountIn(slippageTolerance) {
      let amountIn = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.inputAmount;
      (0, _tinyInvariant.default)(!slippageTolerance.lessThan(_internalConstants.ZERO), 'SLIPPAGE_TOLERANCE');
      if (this.tradeType === _internalConstants.TradeType.EXACT_INPUT) {
        return amountIn;
      } else {
        const slippageAdjustedAmountIn = new _fractions.Fraction(_internalConstants.ONE).add(slippageTolerance).multiply(amountIn.quotient).quotient;
        return _fractions.CurrencyAmount.fromRawAmount(amountIn.currency, slippageAdjustedAmountIn);
      }
    }

    /**
     * Return the execution price after accounting for slippage tolerance
     * @param slippageTolerance the allowed tolerated slippage
     * @returns The execution price
     */
  }, {
    key: "worstExecutionPrice",
    value: function worstExecutionPrice(slippageTolerance) {
      return new _fractions.Price(this.inputAmount.currency, this.outputAmount.currency, this.maximumAmountIn(slippageTolerance).quotient, this.minimumAmountOut(slippageTolerance).quotient);
    }
  }], [{
    key: "exactIn",
    value: function exactIn(route, amountIn) {
      return Trade.fromRoute(route, amountIn, _internalConstants.TradeType.EXACT_INPUT);
    }

    /**
     * Constructs an exact out trade with the given amount out and route
     * @template TInput The input token, either Ether or an ERC-20
     * @template TOutput The output token, either Ether or an ERC-20
     * @param route The route of the exact out trade
     * @param amountOut The amount returned by the trade
     * @returns The exact out trade
     */
  }, {
    key: "exactOut",
    value: function exactOut(route, amountOut) {
      return Trade.fromRoute(route, amountOut, _internalConstants.TradeType.EXACT_OUTPUT);
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
  }, {
    key: "fromRoute",
    value: function fromRoute(route, amount, tradeType) {
      let percent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 100;
      const amounts = new Array(route.tokenPath.length);
      let inputAmount;
      let outputAmount;
      if (tradeType === _internalConstants.TradeType.EXACT_INPUT) {
        (0, _tinyInvariant.default)(amount.currency.equals(route.input), 'INPUT');
        amounts[0] = amount;
        for (let i = 0; i < route.tokenPath.length - 1; i++) {
          const pool = route.pools[i];
          const outputAmount = pool.getOutputAmount(amounts[i]);
          amounts[i + 1] = outputAmount;
        }
        inputAmount = _fractions.CurrencyAmount.fromFractionalAmount(route.input, amount.numerator, amount.denominator);
        outputAmount = _fractions.CurrencyAmount.fromFractionalAmount(route.output, amounts[amounts.length - 1].numerator, amounts[amounts.length - 1].denominator);
      } else {
        (0, _tinyInvariant.default)(amount.currency.equals(route.output), 'OUTPUT');
        amounts[amounts.length - 1] = amount;
        for (let i = route.tokenPath.length - 1; i > 0; i--) {
          const pool = route.pools[i - 1];
          const inputAmount = pool.getInputAmount(amounts[i]);
          amounts[i - 1] = inputAmount;
        }
        inputAmount = _fractions.CurrencyAmount.fromFractionalAmount(route.input, amounts[0].numerator, amounts[0].denominator);
        outputAmount = _fractions.CurrencyAmount.fromFractionalAmount(route.output, amount.numerator, amount.denominator);
      }
      return new Trade({
        routes: [{
          inputAmount,
          outputAmount,
          route,
          percent
        }],
        tradeType
      });
    }

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
  }, {
    key: "fromRoutes",
    value: function fromRoutes(routes, tradeType) {
      const populatedRoutes = [];
      for (const {
        route,
        amount,
        percent
      } of routes) {
        const amounts = new Array(route.tokenPath.length);
        let inputAmount;
        let outputAmount;
        if (tradeType === _internalConstants.TradeType.EXACT_INPUT) {
          (0, _tinyInvariant.default)(amount.currency.equals(route.input), 'INPUT');
          inputAmount = _fractions.CurrencyAmount.fromFractionalAmount(route.input, amount.numerator, amount.denominator);
          amounts[0] = _fractions.CurrencyAmount.fromFractionalAmount(route.input, amount.numerator, amount.denominator);
          for (let i = 0; i < route.tokenPath.length - 1; i++) {
            const pool = route.pools[i];
            const outputAmount = pool.getOutputAmount(amounts[i]);
            amounts[i + 1] = outputAmount;
          }
          outputAmount = _fractions.CurrencyAmount.fromFractionalAmount(route.output, amounts[amounts.length - 1].numerator, amounts[amounts.length - 1].denominator);
        } else {
          (0, _tinyInvariant.default)(amount.currency.equals(route.output), 'OUTPUT');
          outputAmount = _fractions.CurrencyAmount.fromFractionalAmount(route.output, amount.numerator, amount.denominator);
          amounts[amounts.length - 1] = _fractions.CurrencyAmount.fromFractionalAmount(route.output, amount.numerator, amount.denominator);
          for (let i = route.tokenPath.length - 1; i > 0; i--) {
            const pool = route.pools[i - 1];
            const inputAmount = pool.getInputAmount(amounts[i]);
            amounts[i - 1] = inputAmount;
          }
          inputAmount = _fractions.CurrencyAmount.fromFractionalAmount(route.input, amounts[0].numerator, amounts[0].denominator);
        }
        populatedRoutes.push({
          route,
          inputAmount,
          outputAmount,
          percent
        });
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
  }, {
    key: "createUncheckedTrade",
    value: function createUncheckedTrade(constructorArguments) {
      return new Trade(_objectSpread(_objectSpread({}, constructorArguments), {}, {
        routes: [{
          percent: constructorArguments.percent,
          inputAmount: constructorArguments.inputAmount,
          outputAmount: constructorArguments.outputAmount,
          route: constructorArguments.route
        }]
      }));
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
  }, {
    key: "createUncheckedTradeWithMultipleRoutes",
    value: function createUncheckedTradeWithMultipleRoutes(constructorArguments) {
      return new Trade(constructorArguments);
    }
  }, {
    key: "bestTradeExactIn",
    value: function bestTradeExactIn(routes, currencyAmountIn) {
      let maxNumResults = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      (0, _tinyInvariant.default)(routes.length > 0, 'ROUTES');
      const bestTrades = [];
      for (const route of routes) {
        let trade;
        try {
          trade = Trade.fromRoute(route, currencyAmountIn, _internalConstants.TradeType.EXACT_INPUT);
        } catch (error) {
          // not enough liquidity in this pair
          if (error.isInsufficientInputAmountError) {
            continue;
          }
          throw error;
        }

        // FIXME! Sorting bug multiple pools
        if (!trade.inputAmount.greaterThan(0) || !trade.priceImpact.greaterThan(0)) continue;
        (0, _utils.sortedInsert)(bestTrades, trade, maxNumResults, tradeComparator);
      }
      return bestTrades;
    }
  }, {
    key: "bestTradeExactOut",
    value: function bestTradeExactOut(routes, currencyAmountOut) {
      let maxNumResults = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      (0, _tinyInvariant.default)(routes.length > 0, 'ROUTES');
      const bestTrades = [];
      for (const route of routes) {
        let trade;
        try {
          trade = Trade.fromRoute(route, currencyAmountOut, _internalConstants.TradeType.EXACT_OUTPUT);
        } catch (error) {
          // not enough liquidity in this pair
          if (error.isInsufficientReservesError) {
            continue;
          }
          throw error;
        }
        if (!trade.inputAmount.greaterThan(0) || !trade.priceImpact.greaterThan(0)) continue;
        (0, _utils.sortedInsert)(bestTrades, trade, maxNumResults, tradeComparator);
      }
      return bestTrades;
    }
  }, {
    key: "bestTradeWithSplit",
    value: function bestTradeWithSplit(_routes, amount, percents, tradeType) {
      let swapConfig = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {
        minSplits: 1,
        maxSplits: 10
      };
      // TODO Need rafactor
      (0, _tinyInvariant.default)(_routes.length > 0, 'ROUTES');
      (0, _tinyInvariant.default)(percents.length > 0, 'PERCENTS');

      // Compute routes for all percents for all routes
      const percentToTrades = {};
      for (const percent of percents) {
        const splitAmount = amount.multiply(percent).divide(100);
        for (const route of _routes) {
          try {
            const trade = Trade.fromRoute(route, splitAmount, tradeType, percent);
            if (!trade.inputAmount.greaterThan(0) || !trade.priceImpact.greaterThan(0)) continue;
            if (!percentToTrades[percent]) {
              percentToTrades[percent] = [];
            }
            percentToTrades[percent].push(trade);
          } catch (error) {
            // not enough liquidity in this pair
            if (error.isInsufficientReservesError || error.isInsufficientInputAmountError) {
              continue;
            }
            throw error;
          }
        }
      }
      const bestTrades = (0, _getBestSwapRoute.getBestSwapRoute)(tradeType, percentToTrades, percents, swapConfig);
      if (!bestTrades) return null;
      const routes = bestTrades.map(_ref7 => {
        let {
          inputAmount,
          outputAmount,
          route,
          swaps
        } = _ref7;
        return {
          inputAmount,
          outputAmount,
          route,
          percent: swaps[0].percent
        };
      });

      // Check missing input after splitting
      // TODO Do we need it for exact out?
      if (tradeType === _internalConstants.TradeType.EXACT_INPUT) {
        const totalAmount = _lodash.default.reduce(routes, (total, route) => total.add(route.inputAmount), _fractions.CurrencyAmount.fromRawAmount(routes[0].route.input, 0));
        const missingAmount = amount.subtract(totalAmount);
        if (missingAmount.greaterThan(0)) {
          console.log("MISSING AMOUNT!!!", missingAmount.toFixed());
          routes[0].inputAmount = routes[0].inputAmount.add(missingAmount);
        }
      }
      return new Trade({
        routes,
        tradeType
      });
    }
  }]);
}();