"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SwapMath = void 0;
var _internalConstants = require("../internalConstants");
var _fullMath = require("./fullMath");
var _sqrtPriceMath = require("./sqrtPriceMath");
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const MAX_FEE = 10n ** 6n;
let SwapMath = exports.SwapMath = /*#__PURE__*/function () {
  /**
   * Cannot be constructed.
   */
  function SwapMath() {
    _classCallCheck(this, SwapMath);
  }
  return _createClass(SwapMath, null, [{
    key: "computeSwapStep",
    value: function computeSwapStep(sqrtRatioCurrentX64, sqrtRatioTargetX64, liquidity, amountRemaining, feePips) {
      const returnValues = {};
      const zeroForOne = sqrtRatioCurrentX64 >= sqrtRatioTargetX64;
      const exactIn = amountRemaining >= _internalConstants.ZERO;
      if (exactIn) {
        const amountRemainingLessFee = amountRemaining * (MAX_FEE - BigInt(feePips)) / MAX_FEE;
        returnValues.amountIn = zeroForOne ? _sqrtPriceMath.SqrtPriceMath.getAmountADelta(sqrtRatioTargetX64, sqrtRatioCurrentX64, liquidity, true) : _sqrtPriceMath.SqrtPriceMath.getAmountBDelta(sqrtRatioCurrentX64, sqrtRatioTargetX64, liquidity, true);
        if (amountRemainingLessFee >= returnValues.amountIn) {
          returnValues.sqrtRatioNextX64 = sqrtRatioTargetX64;
        } else {
          returnValues.sqrtRatioNextX64 = _sqrtPriceMath.SqrtPriceMath.getNextSqrtPriceFromInput(sqrtRatioCurrentX64, liquidity, amountRemainingLessFee, zeroForOne);
        }
      } else {
        returnValues.amountOut = zeroForOne ? _sqrtPriceMath.SqrtPriceMath.getAmountBDelta(sqrtRatioTargetX64, sqrtRatioCurrentX64, liquidity, false) : _sqrtPriceMath.SqrtPriceMath.getAmountADelta(sqrtRatioCurrentX64, sqrtRatioTargetX64, liquidity, false);
        if (amountRemaining * _internalConstants.NEGATIVE_ONE >= returnValues.amountOut) {
          returnValues.sqrtRatioNextX64 = sqrtRatioTargetX64;
        } else {
          returnValues.sqrtRatioNextX64 = _sqrtPriceMath.SqrtPriceMath.getNextSqrtPriceFromOutput(sqrtRatioCurrentX64, liquidity, amountRemaining * _internalConstants.NEGATIVE_ONE, zeroForOne);
        }
      }
      const max = sqrtRatioTargetX64 === returnValues.sqrtRatioNextX64;
      if (zeroForOne) {
        returnValues.amountIn = max && exactIn ? returnValues.amountIn : _sqrtPriceMath.SqrtPriceMath.getAmountADelta(returnValues.sqrtRatioNextX64, sqrtRatioCurrentX64, liquidity, true);
        returnValues.amountOut = max && !exactIn ? returnValues.amountOut : _sqrtPriceMath.SqrtPriceMath.getAmountBDelta(returnValues.sqrtRatioNextX64, sqrtRatioCurrentX64, liquidity, false);
      } else {
        returnValues.amountIn = max && exactIn ? returnValues.amountIn : _sqrtPriceMath.SqrtPriceMath.getAmountBDelta(sqrtRatioCurrentX64, returnValues.sqrtRatioNextX64, liquidity, true);
        returnValues.amountOut = max && !exactIn ? returnValues.amountOut : _sqrtPriceMath.SqrtPriceMath.getAmountADelta(sqrtRatioCurrentX64, returnValues.sqrtRatioNextX64, liquidity, false);
      }
      if (!exactIn && returnValues.amountOut > amountRemaining * _internalConstants.NEGATIVE_ONE) {
        returnValues.amountOut = amountRemaining * _internalConstants.NEGATIVE_ONE;
      }
      if (exactIn && returnValues.sqrtRatioNextX64 !== sqrtRatioTargetX64) {
        // we didn't reach the target, so take the remainder of the maximum input as fee
        returnValues.feeAmount = amountRemaining - returnValues.amountIn;
      } else {
        returnValues.feeAmount = _fullMath.FullMath.mulDivRoundingUp(returnValues.amountIn, BigInt(feePips), MAX_FEE - BigInt(feePips));
      }
      return [returnValues.sqrtRatioNextX64, returnValues.amountIn, returnValues.amountOut, returnValues.feeAmount];
    }
  }]);
}();