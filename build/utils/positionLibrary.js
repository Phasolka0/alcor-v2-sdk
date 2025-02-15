"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PositionLibrary = void 0;
var _ = require(".");
var _internalConstants = require("../internalConstants");
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let PositionLibrary = exports.PositionLibrary = /*#__PURE__*/function () {
  /**
   * Cannot be constructed.
   */
  function PositionLibrary() {
    _classCallCheck(this, PositionLibrary);
  }

  // replicates the portions of Position#update required to compute unaccounted fees
  return _createClass(PositionLibrary, null, [{
    key: "getTokensOwed",
    value: function getTokensOwed(feeGrowthInsideALastX64, feeGrowthInsideBLastX64, liquidity, feeGrowthInsideAX64, feeGrowthInsideBX64) {
      const tokensOwed0 = (0, _.subIn128)(feeGrowthInsideAX64, feeGrowthInsideALastX64) * liquidity / _internalConstants.Q64;
      const tokensOwed1 = (0, _.subIn128)(feeGrowthInsideBX64, feeGrowthInsideBLastX64) * liquidity / _internalConstants.Q64;
      return [tokensOwed0, tokensOwed1];
    }
  }]);
}();