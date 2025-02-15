"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Position = void 0;
var _fractions = require("./fractions");
var _internalConstants = require("../internalConstants");
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _maxLiquidityForAmounts = require("../utils/maxLiquidityForAmounts");
var _priceTickConversions = require("../utils/priceTickConversions");
var _sqrtPriceMath = require("../utils/sqrtPriceMath");
var _tickMath = require("../utils/tickMath");
var _encodeSqrtRatioX = require("../utils/encodeSqrtRatioX64");
var _pool = require("./pool");
var _utils = require("../utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let Position = exports.Position = /*#__PURE__*/function () {
  /**
   * Constructs a position for a given pool with the given liquidity
   * @param pool For which pool the liquidity is assigned
   * @param liquidity The amount of liquidity that is in the position
   * @param lower The lower tick of the position
   * @param upper The upper tick of the position
   */
  function Position(_ref) {
    let {
      id,
      owner,
      pool,
      liquidity,
      tickLower,
      tickUpper,
      feeGrowthInsideALastX64 = 0,
      feeGrowthInsideBLastX64 = 0,
      feesA = 0,
      feesB = 0
    } = _ref;
    _classCallCheck(this, Position);
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "owner", void 0);
    _defineProperty(this, "pool", void 0);
    _defineProperty(this, "tickLower", void 0);
    _defineProperty(this, "tickUpper", void 0);
    _defineProperty(this, "liquidity", void 0);
    _defineProperty(this, "feesA", void 0);
    _defineProperty(this, "feesB", void 0);
    _defineProperty(this, "feeGrowthInsideALastX64", void 0);
    _defineProperty(this, "feeGrowthInsideBLastX64", void 0);
    // cached resuts for the getters
    _defineProperty(this, "_tokenAAmount", null);
    _defineProperty(this, "_tokenBAmount", null);
    _defineProperty(this, "_mintAmounts", null);
    (0, _tinyInvariant.default)(tickLower < tickUpper, "TICK_ORDER");
    (0, _tinyInvariant.default)(tickLower >= _tickMath.TickMath.MIN_TICK && tickLower % pool.tickSpacing === 0, "TICK_LOWER");
    (0, _tinyInvariant.default)(tickUpper <= _tickMath.TickMath.MAX_TICK && tickUpper % pool.tickSpacing === 0, "TICK_UPPER");
    this.id = id;
    this.owner = owner;
    this.pool = pool;
    this.tickLower = tickLower;
    this.tickUpper = tickUpper;
    this.liquidity = BigInt(liquidity);
    this.feeGrowthInsideALastX64 = BigInt(feeGrowthInsideALastX64);
    this.feeGrowthInsideBLastX64 = BigInt(feeGrowthInsideBLastX64);
    this.feesA = BigInt(feesA);
    this.feesB = BigInt(feesB);
  }
  return _createClass(Position, [{
    key: "inRange",
    get: function () {
      return this.tickLower < this.pool.tickCurrent && this.pool.tickCurrent < this.tickUpper;
    }

    /**
     * Returns the price of tokenA at the lower tick
     */
  }, {
    key: "tokenAPriceLower",
    get: function () {
      return (0, _priceTickConversions.tickToPrice)(this.pool.tokenA, this.pool.tokenB, this.tickLower);
    }

    /**
     * Returns the price of tokenA at the upper tick
     */
  }, {
    key: "tokenAPriceUpper",
    get: function () {
      return (0, _priceTickConversions.tickToPrice)(this.pool.tokenA, this.pool.tokenB, this.tickUpper);
    }

    /**
     * Returns the amount of tokenA that this position's liquidity could be burned for at the current pool price
     */
  }, {
    key: "amountA",
    get: function () {
      if (this._tokenAAmount === null) {
        if (this.pool.tickCurrent < this.tickLower) {
          this._tokenAAmount = _fractions.CurrencyAmount.fromRawAmount(this.pool.tokenA, _sqrtPriceMath.SqrtPriceMath.getAmountADelta(_tickMath.TickMath.getSqrtRatioAtTick(this.tickLower), _tickMath.TickMath.getSqrtRatioAtTick(this.tickUpper), this.liquidity, false));
        } else if (this.pool.tickCurrent < this.tickUpper) {
          this._tokenAAmount = _fractions.CurrencyAmount.fromRawAmount(this.pool.tokenA, _sqrtPriceMath.SqrtPriceMath.getAmountADelta(this.pool.sqrtPriceX64, _tickMath.TickMath.getSqrtRatioAtTick(this.tickUpper), this.liquidity, false));
        } else {
          this._tokenAAmount = _fractions.CurrencyAmount.fromRawAmount(this.pool.tokenA, _internalConstants.ZERO);
        }
      }
      return this._tokenAAmount;
    }

    /**
     * Returns the amount of tokenB that this position's liquidity could be burned for at the current pool price
     */
  }, {
    key: "amountB",
    get: function () {
      if (this._tokenBAmount === null) {
        if (this.pool.tickCurrent < this.tickLower) {
          this._tokenBAmount = _fractions.CurrencyAmount.fromRawAmount(this.pool.tokenB, _internalConstants.ZERO);
        } else if (this.pool.tickCurrent < this.tickUpper) {
          this._tokenBAmount = _fractions.CurrencyAmount.fromRawAmount(this.pool.tokenB, _sqrtPriceMath.SqrtPriceMath.getAmountBDelta(_tickMath.TickMath.getSqrtRatioAtTick(this.tickLower), this.pool.sqrtPriceX64, this.liquidity, false));
        } else {
          this._tokenBAmount = _fractions.CurrencyAmount.fromRawAmount(this.pool.tokenB, _sqrtPriceMath.SqrtPriceMath.getAmountBDelta(_tickMath.TickMath.getSqrtRatioAtTick(this.tickLower), _tickMath.TickMath.getSqrtRatioAtTick(this.tickUpper), this.liquidity, false));
        }
      }
      return this._tokenBAmount;
    }

    /**
     * Returns the lower and upper sqrt ratios if the price 'slips' up to slippage tolerance percentage
     * @param slippageTolerance The amount by which the price can 'slip' before the transaction will revert
     * @returns The sqrt ratios after slippage
     */
  }, {
    key: "ratiosAfterSlippage",
    value: function ratiosAfterSlippage(slippageTolerance) {
      const priceLower = this.pool.tokenAPrice.asFraction.multiply(new _fractions.Percent(1).subtract(slippageTolerance));
      const priceUpper = this.pool.tokenAPrice.asFraction.multiply(slippageTolerance.add(1));
      let sqrtPriceX64Lower = (0, _encodeSqrtRatioX.encodeSqrtRatioX64)(priceLower.numerator, priceLower.denominator);
      if (sqrtPriceX64Lower <= _tickMath.TickMath.MIN_SQRT_RATIO) {
        sqrtPriceX64Lower = _tickMath.TickMath.MIN_SQRT_RATIO + 1n;
      }
      let sqrtPriceX64Upper = (0, _encodeSqrtRatioX.encodeSqrtRatioX64)(priceUpper.numerator, priceUpper.denominator);
      if (sqrtPriceX64Upper >= _tickMath.TickMath.MAX_SQRT_RATIO) {
        sqrtPriceX64Upper = _tickMath.TickMath.MAX_SQRT_RATIO - 1n;
      }
      return {
        sqrtPriceX64Lower,
        sqrtPriceX64Upper
      };
    }

    /**
     * Returns the minimum amounts that must be sent in order to safely mint the amount of liquidity held by the position
     * with the given slippage tolerance
     * @param slippageTolerance Tolerance of unfavorable slippage from the current price
     * @returns The amounts, with slippage
     */
  }, {
    key: "mintAmountsWithSlippage",
    value: function mintAmountsWithSlippage(slippageTolerance) {
      // get lower/upper prices
      const {
        sqrtPriceX64Upper,
        sqrtPriceX64Lower
      } = this.ratiosAfterSlippage(slippageTolerance);

      // construct counterfactual pools
      const poolLower = new _pool.Pool({
        id: this.pool.id,
        active: this.pool.active,
        tokenA: this.pool.tokenA,
        tokenB: this.pool.tokenB,
        fee: this.pool.fee,
        sqrtPriceX64: sqrtPriceX64Lower,
        liquidity: 0 /* liquidity doesn't matter */,
        tickCurrent: _tickMath.TickMath.getTickAtSqrtRatio(sqrtPriceX64Lower),
        feeGrowthGlobalAX64: this.feeGrowthInsideALastX64,
        feeGrowthGlobalBX64: this.feeGrowthInsideBLastX64,
        ticks: this.pool.tickDataProvider
      });
      const poolUpper = new _pool.Pool({
        id: this.pool.id,
        active: this.pool.active,
        tokenA: this.pool.tokenA,
        tokenB: this.pool.tokenB,
        fee: this.pool.fee,
        sqrtPriceX64: sqrtPriceX64Upper,
        liquidity: 0 /* liquidity doesn't matter */,
        tickCurrent: _tickMath.TickMath.getTickAtSqrtRatio(sqrtPriceX64Upper),
        feeGrowthGlobalAX64: this.feeGrowthInsideALastX64,
        feeGrowthGlobalBX64: this.feeGrowthInsideBLastX64,
        ticks: this.pool.tickDataProvider
      });

      // because the router is imprecise, we need to calculate the position that will be created (assuming no slippage)
      const positionThatWillBeCreated = Position.fromAmounts(_objectSpread(_objectSpread({
        id: this.id,
        owner: this.owner,
        pool: this.pool,
        tickLower: this.tickLower,
        tickUpper: this.tickUpper
      }, this.mintAmounts), {}, {
        // the mint amounts are what will be passed as calldata
        useFullPrecision: false,
        feeGrowthInsideALastX64: this.feeGrowthInsideALastX64,
        feeGrowthInsideBLastX64: this.feeGrowthInsideBLastX64,
        feesA: this.feesA,
        feesB: this.feesB
      }));

      // we want the smaller amounts...
      // ...which occurs at the upper price for amountA...
      const {
        amountA
      } = new Position({
        id: this.id,
        owner: this.owner,
        pool: poolUpper,
        liquidity: positionThatWillBeCreated.liquidity,
        tickLower: this.tickLower,
        tickUpper: this.tickUpper,
        feeGrowthInsideALastX64: this.feeGrowthInsideALastX64,
        feeGrowthInsideBLastX64: this.feeGrowthInsideBLastX64,
        feesA: this.feesA,
        feesB: this.feesB
      }).mintAmounts;
      // ...and the lower for amountB
      const {
        amountB
      } = new Position({
        id: this.id,
        owner: this.owner,
        pool: poolLower,
        liquidity: positionThatWillBeCreated.liquidity,
        tickLower: this.tickLower,
        tickUpper: this.tickUpper,
        feeGrowthInsideALastX64: this.feeGrowthInsideALastX64,
        feeGrowthInsideBLastX64: this.feeGrowthInsideBLastX64,
        feesA: this.feesA,
        feesB: this.feesB
      }).mintAmounts;
      return {
        amountA,
        amountB
      };
    }

    /**
     * Returns the minimum amounts that should be requested in order to safely burn the amount of liquidity held by the
     * position with the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the current price
     * @returns The amounts, with slippage
     */
  }, {
    key: "burnAmountsWithSlippage",
    value: function burnAmountsWithSlippage(slippageTolerance) {
      // get lower/upper prices
      const {
        sqrtPriceX64Upper,
        sqrtPriceX64Lower
      } = this.ratiosAfterSlippage(slippageTolerance);

      // construct counterfactual pools
      const poolLower = new _pool.Pool({
        id: this.pool.id,
        active: this.pool.active,
        tokenA: this.pool.tokenA,
        tokenB: this.pool.tokenB,
        fee: this.pool.fee,
        sqrtPriceX64: sqrtPriceX64Lower,
        liquidity: 0 /* liquidity doesn't matter */,
        tickCurrent: _tickMath.TickMath.getTickAtSqrtRatio(sqrtPriceX64Lower),
        feeGrowthGlobalAX64: this.feeGrowthInsideALastX64,
        feeGrowthGlobalBX64: this.feeGrowthInsideBLastX64,
        ticks: this.pool.tickDataProvider
      });
      const poolUpper = new _pool.Pool({
        id: this.pool.id,
        active: this.pool.active,
        tokenA: this.pool.tokenA,
        tokenB: this.pool.tokenB,
        fee: this.pool.fee,
        sqrtPriceX64: sqrtPriceX64Upper,
        liquidity: 0 /* liquidity doesn't matter */,
        tickCurrent: _tickMath.TickMath.getTickAtSqrtRatio(sqrtPriceX64Upper),
        feeGrowthGlobalAX64: this.feeGrowthInsideALastX64,
        feeGrowthGlobalBX64: this.feeGrowthInsideBLastX64,
        ticks: this.pool.tickDataProvider
      });

      // we want the smaller amounts...
      // ...which occurs at the upper price for amountA...
      const amountA = new Position({
        id: this.id,
        owner: this.owner,
        pool: poolUpper,
        liquidity: this.liquidity,
        tickLower: this.tickLower,
        tickUpper: this.tickUpper,
        feeGrowthInsideALastX64: this.feeGrowthInsideALastX64,
        feeGrowthInsideBLastX64: this.feeGrowthInsideBLastX64,
        feesA: this.feesA,
        feesB: this.feesB
      }).amountA;
      // ...and the lower for amountB
      const amountB = new Position({
        id: this.id,
        owner: this.owner,
        pool: poolLower,
        liquidity: this.liquidity,
        tickLower: this.tickLower,
        tickUpper: this.tickUpper,
        feeGrowthInsideALastX64: this.feeGrowthInsideALastX64,
        feeGrowthInsideBLastX64: this.feeGrowthInsideBLastX64,
        feesA: this.feesA,
        feesB: this.feesB
      }).amountB;
      return {
        amountA: amountA,
        amountB: amountB
      };
    }

    /**
     * Returns the minimum amounts that must be sent in order to mint the amount of liquidity held by the position at
     * the current price for the pool
     */
  }, {
    key: "mintAmounts",
    get: function () {
      if (this._mintAmounts === null) {
        if (this.pool.tickCurrent < this.tickLower) {
          return {
            amountA: _sqrtPriceMath.SqrtPriceMath.getAmountADelta(_tickMath.TickMath.getSqrtRatioAtTick(this.tickLower), _tickMath.TickMath.getSqrtRatioAtTick(this.tickUpper), this.liquidity, true),
            amountB: _internalConstants.ZERO
          };
        } else if (this.pool.tickCurrent < this.tickUpper) {
          return {
            amountA: _sqrtPriceMath.SqrtPriceMath.getAmountADelta(this.pool.sqrtPriceX64, _tickMath.TickMath.getSqrtRatioAtTick(this.tickUpper), this.liquidity, true),
            amountB: _sqrtPriceMath.SqrtPriceMath.getAmountBDelta(_tickMath.TickMath.getSqrtRatioAtTick(this.tickLower), this.pool.sqrtPriceX64, this.liquidity, true)
          };
        } else {
          return {
            amountA: _internalConstants.ZERO,
            amountB: _sqrtPriceMath.SqrtPriceMath.getAmountBDelta(_tickMath.TickMath.getSqrtRatioAtTick(this.tickLower), _tickMath.TickMath.getSqrtRatioAtTick(this.tickUpper), this.liquidity, true)
          };
        }
      }
      return this._mintAmounts;
    }

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
  }, {
    key: "getFees",
    value:
    /**
     * Computes a position fees
     * @returns The position
     */
    async function getFees() {
      const {
        liquidity,
        tickLower,
        tickUpper,
        feeGrowthInsideALastX64,
        feeGrowthInsideBLastX64,
        pool
      } = this;
      if (liquidity === _internalConstants.ZERO && this.feesA === _internalConstants.ZERO && this.feesB === _internalConstants.ZERO) {
        return {
          feesA: _fractions.CurrencyAmount.fromRawAmount(this.pool.tokenA, _internalConstants.ZERO),
          feesB: _fractions.CurrencyAmount.fromRawAmount(this.pool.tokenB, _internalConstants.ZERO)
        };
      }
      const lower = this.pool.tickDataProvider.getTick(tickLower);
      const upper = this.pool.tickDataProvider.getTick(tickUpper);
      const {
        feeGrowthGlobalAX64,
        feeGrowthGlobalBX64
      } = pool;
      const [feeGrowthInsideAX64, feeGrowthInsideBX64] = _utils.TickLibrary.getFeeGrowthInside(lower, upper, tickLower, tickUpper, pool.tickCurrent, feeGrowthGlobalAX64, feeGrowthGlobalBX64);
      const tokensOwedA = (0, _utils.subIn128)(feeGrowthInsideAX64, feeGrowthInsideALastX64) * liquidity / _internalConstants.Q64;
      const tokensOwedB = (0, _utils.subIn128)(feeGrowthInsideBX64, feeGrowthInsideBLastX64) * liquidity / _internalConstants.Q64;
      return {
        feesA: _fractions.CurrencyAmount.fromRawAmount(this.pool.tokenA, tokensOwedA + this.feesA),
        feesB: _fractions.CurrencyAmount.fromRawAmount(this.pool.tokenB, tokensOwedB + this.feesB)
      };
    }
  }], [{
    key: "fromAmounts",
    value: function fromAmounts(_ref2) {
      let {
        id,
        owner,
        pool,
        tickLower,
        tickUpper,
        amountA,
        amountB,
        useFullPrecision,
        feeGrowthInsideALastX64,
        feeGrowthInsideBLastX64,
        feesA,
        feesB
      } = _ref2;
      const sqrtRatioLX64 = _tickMath.TickMath.getSqrtRatioAtTick(tickLower);
      const sqrtRatioUX64 = _tickMath.TickMath.getSqrtRatioAtTick(tickUpper);
      return new Position({
        id,
        owner,
        pool,
        tickLower,
        tickUpper,
        liquidity: (0, _maxLiquidityForAmounts.maxLiquidityForAmounts)(pool.sqrtPriceX64, sqrtRatioLX64, sqrtRatioUX64, amountA, amountB, useFullPrecision),
        feeGrowthInsideALastX64,
        feeGrowthInsideBLastX64,
        feesA,
        feesB
      });
    }

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
  }, {
    key: "fromAmountA",
    value: function fromAmountA(_ref3) {
      let {
        id,
        owner,
        pool,
        tickLower,
        tickUpper,
        amountA,
        useFullPrecision,
        feeGrowthInsideALastX64,
        feeGrowthInsideBLastX64,
        feesA,
        feesB
      } = _ref3;
      return Position.fromAmounts({
        id,
        owner,
        pool,
        tickLower,
        tickUpper,
        amountA,
        amountB: _internalConstants.MaxUint64,
        useFullPrecision,
        feeGrowthInsideALastX64,
        feeGrowthInsideBLastX64,
        feesA,
        feesB
      });
    }

    /**
     * Computes a position with the maximum amount of liquidity received for a given amount of tokenB, assuming an unlimited amount of tokenA
     * @param pool The pool for which the position is created
     * @param lower The lower tick
     * @param upper The upper tick
     * @param amountB The desired amount of tokenB
     * @returns The position
     */
  }, {
    key: "fromAmountB",
    value: function fromAmountB(_ref4) {
      let {
        id,
        owner,
        pool,
        tickLower,
        tickUpper,
        amountB,
        feeGrowthInsideALastX64,
        feeGrowthInsideBLastX64,
        feesA,
        feesB
      } = _ref4;
      // this function always uses full precision,
      return Position.fromAmounts({
        id,
        owner,
        pool,
        tickLower,
        tickUpper,
        amountA: _internalConstants.MaxUint64,
        amountB,
        useFullPrecision: true,
        feeGrowthInsideALastX64,
        feeGrowthInsideBLastX64,
        feesA,
        feesB
      });
    }
  }]);
}();