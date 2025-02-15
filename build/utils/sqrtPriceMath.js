"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SqrtPriceMath = void 0;
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _internalConstants = require("../internalConstants");
var _fullMath = require("./fullMath");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function multiplyIn128(x, y) {
  const product = x * y;
  return product & _internalConstants.MaxUint128;
}
function addIn128(x, y) {
  const sum = x + y;
  return sum & _internalConstants.MaxUint128;
}
let SqrtPriceMath = exports.SqrtPriceMath = /*#__PURE__*/function () {
  /**
   * Cannot be constructed.
   */
  function SqrtPriceMath() {
    _classCallCheck(this, SqrtPriceMath);
  }
  return _createClass(SqrtPriceMath, null, [{
    key: "getAmountADelta",
    value: function getAmountADelta(sqrtRatioLX64, sqrtRatioUX64, liquidity, roundUp) {
      if (sqrtRatioLX64 > sqrtRatioUX64) {
        [sqrtRatioLX64, sqrtRatioUX64] = [sqrtRatioUX64, sqrtRatioLX64];
      }
      const numerator1 = liquidity << 64n;
      const numerator2 = sqrtRatioUX64 - sqrtRatioLX64;
      return roundUp ? _fullMath.FullMath.mulDivRoundingUp(_fullMath.FullMath.mulDivRoundingUp(numerator1, numerator2, sqrtRatioUX64), _internalConstants.ONE, sqrtRatioLX64) : numerator1 * numerator2 / sqrtRatioUX64 / sqrtRatioLX64;
    }
  }, {
    key: "getAmountBDelta",
    value: function getAmountBDelta(sqrtRatioLX64, sqrtRatioUX64, liquidity, roundUp) {
      if (sqrtRatioLX64 > sqrtRatioUX64) {
        [sqrtRatioLX64, sqrtRatioUX64] = [sqrtRatioUX64, sqrtRatioLX64];
      }
      return roundUp ? _fullMath.FullMath.mulDivRoundingUp(liquidity, sqrtRatioUX64 - sqrtRatioLX64, _internalConstants.Q64) : liquidity * (sqrtRatioUX64 - sqrtRatioLX64) / _internalConstants.Q64;
    }
  }, {
    key: "getNextSqrtPriceFromInput",
    value: function getNextSqrtPriceFromInput(sqrtPX64, liquidity, amountIn, zeroForOne) {
      (0, _tinyInvariant.default)(sqrtPX64 > _internalConstants.ZERO);
      (0, _tinyInvariant.default)(liquidity > _internalConstants.ZERO);
      return zeroForOne ? this.getNextSqrtPriceFromAmountARoundingUp(sqrtPX64, liquidity, amountIn, true) : this.getNextSqrtPriceFromAmountBRoundingDown(sqrtPX64, liquidity, amountIn, true);
    }
  }, {
    key: "getNextSqrtPriceFromOutput",
    value: function getNextSqrtPriceFromOutput(sqrtPX64, liquidity, amountOut, zeroForOne) {
      (0, _tinyInvariant.default)(sqrtPX64 > _internalConstants.ZERO);
      (0, _tinyInvariant.default)(liquidity > _internalConstants.ZERO);
      return zeroForOne ? this.getNextSqrtPriceFromAmountBRoundingDown(sqrtPX64, liquidity, amountOut, false) : this.getNextSqrtPriceFromAmountARoundingUp(sqrtPX64, liquidity, amountOut, false);
    }
  }, {
    key: "getNextSqrtPriceFromAmountARoundingUp",
    value: function getNextSqrtPriceFromAmountARoundingUp(sqrtPX64, liquidity, amount, add) {
      if (amount === _internalConstants.ZERO) return sqrtPX64;
      const numerator1 = liquidity << 64n;
      if (add) {
        let product = multiplyIn128(amount, sqrtPX64);
        if (product / amount === sqrtPX64) {
          const denominator = addIn128(numerator1, product);
          if (denominator >= numerator1) {
            return _fullMath.FullMath.mulDivRoundingUp(numerator1, sqrtPX64, denominator);
          }
        }
        return _fullMath.FullMath.mulDivRoundingUp(numerator1, _internalConstants.ONE, numerator1 / sqrtPX64 + amount);
      } else {
        let product = multiplyIn128(amount, sqrtPX64);
        (0, _tinyInvariant.default)(product / amount === sqrtPX64);
        (0, _tinyInvariant.default)(numerator1 > product);
        const denominator = numerator1 - product;
        return _fullMath.FullMath.mulDivRoundingUp(numerator1, sqrtPX64, denominator);
      }
    }
  }, {
    key: "getNextSqrtPriceFromAmountBRoundingDown",
    value: function getNextSqrtPriceFromAmountBRoundingDown(sqrtPX64, liquidity, amount, add) {
      if (add) {
        const quotient = amount <= _internalConstants.MaxUint128 ? (amount << 64n) / liquidity : amount * _internalConstants.Q64 / liquidity;
        return sqrtPX64 + quotient;
      } else {
        const quotient = _fullMath.FullMath.mulDivRoundingUp(amount, _internalConstants.Q64, liquidity);
        (0, _tinyInvariant.default)(sqrtPX64 > quotient);
        return sqrtPX64 - quotient;
      }
    }
  }]);
}();