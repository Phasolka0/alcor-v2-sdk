"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FullMath = void 0;
var _internalConstants = require("../internalConstants");
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let FullMath = exports.FullMath = /*#__PURE__*/function () {
  /**
   * Cannot be constructed.
   */
  function FullMath() {
    _classCallCheck(this, FullMath);
  }
  return _createClass(FullMath, null, [{
    key: "mulDivRoundingUp",
    value: function mulDivRoundingUp(a, b, denominator) {
      const product = a * b;
      let result = product / denominator;
      if (product % denominator !== _internalConstants.ZERO) result = result + _internalConstants.ONE;
      return result;
    }
  }]);
}();