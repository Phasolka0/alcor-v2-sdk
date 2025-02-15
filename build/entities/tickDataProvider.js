"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NoTickDataProvider = void 0;
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Provides information about ticks
 */
/**
 * This tick data provider does not know how to fetch any tick data. It throws whenever it is required. Useful if you
 * do not need to load tick data for your use case.
 */
let NoTickDataProvider = exports.NoTickDataProvider = /*#__PURE__*/function () {
  function NoTickDataProvider() {
    _classCallCheck(this, NoTickDataProvider);
  }
  return _createClass(NoTickDataProvider, [{
    key: "getTick",
    value: function getTick(_tick) {
      throw new Error(NoTickDataProvider.ERROR_MESSAGE);
    }
  }, {
    key: "nextInitializedTickWithinOneWord",
    value: function nextInitializedTickWithinOneWord(_tick, _lte, _tickSpacing) {
      throw new Error(NoTickDataProvider.ERROR_MESSAGE);
    }
  }]);
}();
_defineProperty(NoTickDataProvider, "ERROR_MESSAGE", "No tick data provider was given");