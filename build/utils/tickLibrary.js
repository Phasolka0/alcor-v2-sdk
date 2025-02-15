"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TickLibrary = void 0;
exports.subIn128 = subIn128;
exports.subIn256 = subIn256;
var _internalConstants = require("../internalConstants");
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function subIn256(x, y) {
  const difference = x - y;
  if (difference < _internalConstants.ZERO) {
    return _internalConstants.Q256 + difference;
  } else {
    return difference;
  }
}
function subIn128(x, y) {
  const difference = x - y;
  if (difference < _internalConstants.ZERO) {
    return _internalConstants.Q128 + difference;
  } else {
    return difference;
  }
}
let TickLibrary = exports.TickLibrary = /*#__PURE__*/function () {
  /**
   * Cannot be constructed.
   */
  function TickLibrary() {
    _classCallCheck(this, TickLibrary);
  }
  return _createClass(TickLibrary, null, [{
    key: "getFeeGrowthInside",
    value: function getFeeGrowthInside(feeGrowthOutsideLower, feeGrowthOutsideUpper, tickLower, tickUpper, tickCurrent, feeGrowthGlobalAX64, feeGrowthGlobalBX64) {
      let feeGrowthBelowAX64;
      let feeGrowthBelowBX64;
      if (tickCurrent >= tickLower) {
        feeGrowthBelowAX64 = feeGrowthOutsideLower.feeGrowthOutsideAX64;
        feeGrowthBelowBX64 = feeGrowthOutsideLower.feeGrowthOutsideBX64;
      } else {
        feeGrowthBelowAX64 = subIn128(feeGrowthGlobalAX64, feeGrowthOutsideLower.feeGrowthOutsideAX64);
        feeGrowthBelowBX64 = subIn128(feeGrowthGlobalBX64, feeGrowthOutsideLower.feeGrowthOutsideBX64);
      }
      let feeGrowthAboveAX64;
      let feeGrowthAboveBX64;
      if (tickCurrent < tickUpper) {
        feeGrowthAboveAX64 = feeGrowthOutsideUpper.feeGrowthOutsideAX64;
        feeGrowthAboveBX64 = feeGrowthOutsideUpper.feeGrowthOutsideBX64;
      } else {
        feeGrowthAboveAX64 = subIn128(feeGrowthGlobalAX64, feeGrowthOutsideUpper.feeGrowthOutsideAX64);
        feeGrowthAboveBX64 = subIn128(feeGrowthGlobalBX64, feeGrowthOutsideUpper.feeGrowthOutsideBX64);
      }
      return [subIn128(subIn128(feeGrowthGlobalAX64, feeGrowthBelowAX64), feeGrowthAboveAX64), subIn128(subIn128(feeGrowthGlobalBX64, feeGrowthBelowBX64), feeGrowthAboveBX64)];
    }
  }]);
}();