"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Pool = void 0;
var _msgpackLite = _interopRequireDefault(require("msgpack-lite"));
var _crypto = _interopRequireDefault(require("crypto"));
var _fractions = require("./fractions");
var _token = require("./token");
var _internalConstants = require("../internalConstants");
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _liquidityMath = require("../utils/liquidityMath");
var _swapMath = require("../utils/swapMath");
var _tickMath = require("../utils/tickMath");
var _tickDataProvider = require("./tickDataProvider");
var _tickListDataProvider = require("./tickListDataProvider");
var _errors = require("../errors");
var _Pool;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * By default, pools will not allow operations that require ticks.
 */
const NO_TICK_DATA_PROVIDER_DEFAULT = new _tickDataProvider.NoTickDataProvider();

/**
 * Represents a V3 pool
 */
let Pool = exports.Pool = /*#__PURE__*/function () {
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
  function Pool(_ref) {
    let {
      id,
      active,
      tokenA,
      tokenB,
      fee,
      sqrtPriceX64,
      liquidity,
      tickCurrent,
      ticks = NO_TICK_DATA_PROVIDER_DEFAULT,
      feeGrowthGlobalAX64 = 0,
      feeGrowthGlobalBX64 = 0
    } = _ref;
    _classCallCheck(this, Pool);
    // public readonly id: number;
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "active", void 0);
    _defineProperty(this, "tokenA", void 0);
    _defineProperty(this, "tokenB", void 0);
    _defineProperty(this, "fee", void 0);
    _defineProperty(this, "sqrtPriceX64", void 0);
    _defineProperty(this, "liquidity", void 0);
    _defineProperty(this, "tickCurrent", void 0);
    _defineProperty(this, "feeGrowthGlobalAX64", void 0);
    _defineProperty(this, "feeGrowthGlobalBX64", void 0);
    _defineProperty(this, "tickDataProvider", void 0);
    _defineProperty(this, "json", void 0);
    _defineProperty(this, "buffer", void 0);
    _defineProperty(this, "bufferHash", void 0);
    _defineProperty(this, "_tokenAPrice", void 0);
    _defineProperty(this, "_tokenBPrice", void 0);
    (0, _tinyInvariant.default)(Number.isInteger(fee) && fee < 1000000, "FEE");
    const tickCurrentSqrtRatioX64 = _tickMath.TickMath.getSqrtRatioAtTick(tickCurrent);
    const nextTickSqrtRatioX64 = _tickMath.TickMath.getSqrtRatioAtTick(tickCurrent + 1);
    (0, _tinyInvariant.default)(BigInt(sqrtPriceX64) >= tickCurrentSqrtRatioX64 && BigInt(sqrtPriceX64) <= nextTickSqrtRatioX64, "PRICE_BOUNDS");
    // always create a copy of the list since we want the pool's tick list to be immutable
    this.id = id;
    this.fee = fee;
    this.active = active;
    this.sqrtPriceX64 = BigInt(sqrtPriceX64);
    this.liquidity = BigInt(liquidity);
    this.tickCurrent = tickCurrent;
    this.feeGrowthGlobalAX64 = BigInt(feeGrowthGlobalAX64);
    this.feeGrowthGlobalBX64 = BigInt(feeGrowthGlobalBX64);
    this.tickDataProvider = Array.isArray(ticks) ? new _tickListDataProvider.TickListDataProvider(ticks, _internalConstants.TICK_SPACINGS[fee]) : ticks;
    [this.tokenA, this.tokenB] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA];
  }

  /**
   * Returns true if the token is either tokenA or tokenB
   * @param token The token to check
   * @returns True if token is either tokenA or token
   */
  return _createClass(Pool, [{
    key: "involvesToken",
    value: function involvesToken(token) {
      return token.equals(this.tokenA) || token.equals(this.tokenB);
    }

    /**
     * Returns the current mid price of the pool in terms of tokenA, i.e. the ratio of tokenB over tokenA
     */
  }, {
    key: "tokenAPrice",
    get: function () {
      var _this$_tokenAPrice;
      return (_this$_tokenAPrice = this._tokenAPrice) !== null && _this$_tokenAPrice !== void 0 ? _this$_tokenAPrice : this._tokenAPrice = new _fractions.Price(this.tokenA, this.tokenB, _internalConstants.Q128, this.sqrtPriceX64 * this.sqrtPriceX64);
    }

    /**
     * Returns the current mid price of the pool in terms of tokenB, i.e. the ratio of tokenA over tokenB
     */
  }, {
    key: "tokenBPrice",
    get: function () {
      var _this$_tokenBPrice;
      return (_this$_tokenBPrice = this._tokenBPrice) !== null && _this$_tokenBPrice !== void 0 ? _this$_tokenBPrice : this._tokenBPrice = new _fractions.Price(this.tokenB, this.tokenA, this.sqrtPriceX64 * this.sqrtPriceX64, _internalConstants.Q128);
    }

    /**
     * Return the price of the given token in terms of the other token in the pool.
     * @param token The token to return price of
     * @returns The price of the given token, in terms of the other.
     */
  }, {
    key: "priceOf",
    value: function priceOf(token) {
      (0, _tinyInvariant.default)(this.involvesToken(token), "TOKEN");
      return token.equals(this.tokenA) ? this.tokenAPrice : this.tokenBPrice;
    }

    /**
     * Given an input amount of a token, return the computed output amount, and a pool with state updated after the trade
     * @param inputAmount The input amount for which to quote the output amount
     * @param sqrtPriceLimitX64 The Q64.96 sqrt price limit
     * @returns The output amount and the pool with updated state
     */
  }, {
    key: "getOutputAmount",
    value: function getOutputAmount(inputAmount, sqrtPriceLimitX64) {
      (0, _tinyInvariant.default)(this.involvesToken(inputAmount.currency), "TOKEN");
      const zeroForOne = inputAmount.currency.equals(this.tokenA);
      const {
        amountA,
        amountB
      } = this.swap(zeroForOne, inputAmount.quotient, sqrtPriceLimitX64);
      const outputToken = zeroForOne ? this.tokenB : this.tokenA;
      const outputAmount = zeroForOne ? amountB : amountA;
      const amountIn = zeroForOne ? amountA : amountB;

      //console.log(JSBI.equal(amountIn, inputAmount.quotient))
      if (!(inputAmount.quotient >= amountIn)) {
        //if (!JSBI.equal(amountIn, inputAmount.quotient)) {
        throw new _errors.InsufficientInputAmountError();
      }
      return _fractions.CurrencyAmount.fromRawAmount(outputToken, outputAmount * _internalConstants.NEGATIVE_ONE);
    }
  }, {
    key: "getOutputAmountOptimized",
    value: function getOutputAmountOptimized(inputAmount, sqrtPriceLimitX64) {
      const zeroForOne = inputAmount.currency.equals(this.tokenA);
      const {
        amountA,
        amountB
      } = this.swap(zeroForOne, inputAmount.quotient, sqrtPriceLimitX64);
      const outputToken = zeroForOne ? this.tokenB : this.tokenA;
      const outputAmount = zeroForOne ? amountB : amountA;
      return _fractions.CurrencyAmount.fromRawAmount(outputToken, outputAmount * _internalConstants.NEGATIVE_ONE);
    }

    /**
     * Given a desired output amount of a token, return the computed input amount and a pool with state updated after the trade
     * @param outputAmount the output amount for which to quote the input amount
     * @param sqrtPriceLimitX64 The Q64.96 sqrt price limit. If zero for one, the price cannot be less than this value after the swap. If one for zero, the price cannot be greater than this value after the swap
     * @returns The input amount and the pool with updated state
     */
  }, {
    key: "getInputAmount",
    value: function getInputAmount(outputAmount, sqrtPriceLimitX64) {
      const zeroForOne = outputAmount.currency.equals(this.tokenB);
      const {
        amountA,
        amountB
      } = this.swap(zeroForOne, outputAmount.quotient * _internalConstants.NEGATIVE_ONE, sqrtPriceLimitX64);
      const inputToken = zeroForOne ? this.tokenA : this.tokenB;
      const inputAmount = zeroForOne ? amountA : amountB;
      const amountOutReceived = (zeroForOne ? amountB : amountA) * _internalConstants.NEGATIVE_ONE;
      if (!(amountOutReceived === outputAmount.quotient)) {
        throw new _errors.InsufficientReservesError();
      }
      return _fractions.CurrencyAmount.fromRawAmount(inputToken, inputAmount);
    }

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
  }, {
    key: "swap",
    value: function swap(zeroForOne, amountSpecified, sqrtPriceLimitX64) {
      if (!sqrtPriceLimitX64) sqrtPriceLimitX64 = zeroForOne ? _tickMath.TickMath.MIN_SQRT_RATIO + _internalConstants.ONE : _tickMath.TickMath.MAX_SQRT_RATIO - _internalConstants.ONE;
      if (zeroForOne) {
        (0, _tinyInvariant.default)(sqrtPriceLimitX64 > _tickMath.TickMath.MIN_SQRT_RATIO, "RATIO_MIN");
        (0, _tinyInvariant.default)(sqrtPriceLimitX64 < this.sqrtPriceX64, "RATIO_CURRENT");
      } else {
        (0, _tinyInvariant.default)(sqrtPriceLimitX64 < _tickMath.TickMath.MAX_SQRT_RATIO, "RATIO_MAX");
        (0, _tinyInvariant.default)(sqrtPriceLimitX64 > this.sqrtPriceX64, "RATIO_CURRENT");
      }
      const exactInput = amountSpecified >= _internalConstants.ZERO;
      const state = {
        amountSpecifiedRemaining: amountSpecified,
        amountCalculated: _internalConstants.ZERO,
        sqrtPriceX64: this.sqrtPriceX64,
        tick: this.tickCurrent,
        liquidity: this.liquidity
      };
      while (state.amountSpecifiedRemaining !== _internalConstants.ZERO && state.sqrtPriceX64 != sqrtPriceLimitX64) {
        const step = {};
        step.sqrtPriceStartX64 = state.sqrtPriceX64;
        [step.tickNext, step.initialized] = this.tickDataProvider.nextInitializedTickWithinOneWord(state.tick, zeroForOne, this.tickSpacing);
        if (step.tickNext < _tickMath.TickMath.MIN_TICK) {
          step.tickNext = _tickMath.TickMath.MIN_TICK;
        } else if (step.tickNext > _tickMath.TickMath.MAX_TICK) {
          step.tickNext = _tickMath.TickMath.MAX_TICK;
        }
        step.sqrtPriceNextX64 = _tickMath.TickMath.getSqrtRatioAtTick(step.tickNext);
        [state.sqrtPriceX64, step.amountIn, step.amountOut, step.feeAmount] = _swapMath.SwapMath.computeSwapStep(state.sqrtPriceX64, (zeroForOne ? step.sqrtPriceNextX64 < sqrtPriceLimitX64 : step.sqrtPriceNextX64 > sqrtPriceLimitX64) ? sqrtPriceLimitX64 : step.sqrtPriceNextX64, state.liquidity, state.amountSpecifiedRemaining, this.fee);
        if (exactInput) {
          state.amountSpecifiedRemaining = state.amountSpecifiedRemaining - (step.amountIn + step.feeAmount);
          state.amountCalculated = state.amountCalculated - step.amountOut;
        } else {
          state.amountSpecifiedRemaining = state.amountSpecifiedRemaining + step.amountOut;
          state.amountCalculated = state.amountCalculated + (step.amountIn + step.feeAmount);
        }
        if (state.sqrtPriceX64 === step.sqrtPriceNextX64) {
          if (step.initialized) {
            let liquidityNet = BigInt(this.tickDataProvider.getTick(step.tickNext).liquidityNet);
            if (zeroForOne) liquidityNet = liquidityNet * _internalConstants.NEGATIVE_ONE;
            state.liquidity = _liquidityMath.LiquidityMath.addDelta(state.liquidity, liquidityNet);
          }
          state.tick = zeroForOne ? step.tickNext - 1 : step.tickNext;
        } else if (state.sqrtPriceX64 !== step.sqrtPriceStartX64) {
          state.tick = _tickMath.TickMath.getTickAtSqrtRatio(state.sqrtPriceX64);
        }
      }
      const amountA = zeroForOne == exactInput ? amountSpecified - state.amountSpecifiedRemaining : state.amountCalculated;
      const amountB = zeroForOne == exactInput ? state.amountCalculated : amountSpecified - state.amountSpecifiedRemaining;
      return {
        amountA,
        amountB,
        sqrtPriceX64: state.sqrtPriceX64,
        liquidity: state.liquidity,
        tickCurrent: state.tick
      };
    }
  }, {
    key: "tickSpacing",
    get: function () {
      return _internalConstants.TICK_SPACINGS[this.fee];
    }
  }, {
    key: "equals",
    value: function equals(other) {
      // Сравниваем id пулов
      if (this.id !== other.id) return false;

      // Сравниваем fee
      if (this.fee !== other.fee) return false;

      // Сравниваем sqrtPriceX64
      if (!(this.sqrtPriceX64 === other.sqrtPriceX64)) return false;

      // Сравниваем liquidity
      if (!(this.liquidity === other.liquidity)) return false;

      // Сравниваем tickCurrent
      if (this.tickCurrent !== other.tickCurrent) return false;

      // Сравниваем токены (предполагается, что у Token есть метод equals)
      if (!this.tokenA.equals(other.tokenA) || !this.tokenB.equals(other.tokenB)) return false;

      // Если все проверки прошли, объекты считаются равными
      return true;
    }
  }], [{
    key: "toJSON",
    value: function toJSON(pool) {
      if (pool.json) return pool.json;
      pool.json = {
        id: pool.id,
        tokenA: _token.Token.toJSON(pool.tokenA),
        tokenB: _token.Token.toJSON(pool.tokenB),
        active: pool.active,
        fee: pool.fee,
        sqrtPriceX64: pool.sqrtPriceX64.toString(),
        liquidity: pool.liquidity.toString(),
        tickCurrent: pool.tickCurrent,
        feeGrowthGlobalAX64: pool.feeGrowthGlobalAX64.toString(),
        feeGrowthGlobalBX64: pool.feeGrowthGlobalBX64.toString(),
        tickDataProvider: _tickListDataProvider.TickListDataProvider.toJSON(pool.tickDataProvider.ticks)
      };
      return pool.json;
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(json) {
      return new Pool({
        id: json.id,
        active: json.active,
        tokenA: _token.Token.fromJSON(json.tokenA),
        tokenB: _token.Token.fromJSON(json.tokenB),
        fee: json.fee,
        sqrtPriceX64: BigInt(json.sqrtPriceX64),
        liquidity: BigInt(json.liquidity),
        tickCurrent: json.tickCurrent,
        feeGrowthGlobalAX64: BigInt(json.feeGrowthGlobalAX64),
        feeGrowthGlobalBX64: BigInt(json.feeGrowthGlobalBX64),
        ticks: _tickListDataProvider.TickListDataProvider.fromJSON(json.tickDataProvider)
      });
    }
    /**
     * Converts the pool to a Buffer using msgpack encoding.
     * @param {Pool} pool - The pool instance to convert.
     * @returns {Buffer} The encoded buffer.
     */
  }, {
    key: "toBuffer",
    value: function toBuffer(pool) {
      if (pool.buffer) return pool.buffer;
      const json = Pool.toJSON(pool);
      pool.buffer = _msgpackLite.default.encode(json);
      pool.bufferHash = Pool.createHash(pool.buffer);
      return pool.buffer;
    }

    /**
     * Creates a Pool instance from a Buffer or serialized data.
     * @param {Buffer | any} data - The buffer or serialized data.
     * @returns {Pool} The pool instance.
     */
  }, {
    key: "fromBuffer",
    value: function fromBuffer(data) {
      const bufferHash = Pool.createHash(data instanceof Buffer ? data : data.buffer);
      if (this.hashToPoolMap.has(bufferHash)) {
        return this.hashToPoolMap.get(bufferHash);
      }
      const json = _msgpackLite.default.decode(data instanceof Buffer ? data : data.buffer);
      const pool = Pool.fromJSON(json);
      this.hashToPoolMap.set(bufferHash, pool);
      this.idToPoolMap.set(pool.id, pool);
      return pool;
    }
  }, {
    key: "fromId",
    value: function fromId(id) {
      //console.log('fromId', id)
      const pool = Pool.idToPoolMap.get(id);
      if (!pool) throw new Error('pool does not exist in idToPoolMap');
      return pool;
    }
  }, {
    key: "createHash",
    value: function createHash(buffer, pool) {
      if (pool && pool.bufferHash) {
        return pool.bufferHash;
      }
      const hash = _crypto.default.createHash('sha256');
      hash.update(buffer);
      const hexHash = hash.digest('hex');
      if (pool) {
        pool.bufferHash = hexHash;
      }
      return hexHash;
    }
  }, {
    key: "hashEquals",
    value: function hashEquals(pool, hash) {
      return pool.bufferHash === hash;
    }
  }]);
}();
_Pool = Pool;
_defineProperty(Pool, "hashToPoolMap", new Map());
_defineProperty(Pool, "idToPoolMap", new Map());