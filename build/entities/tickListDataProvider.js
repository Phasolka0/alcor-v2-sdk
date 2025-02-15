"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TickListDataProvider = void 0;
var _tickList = require("../utils/tickList");
var _tick = require("./tick");
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * A data provider for ticks that is backed by an in-memory array of ticks.
 */
let TickListDataProvider = exports.TickListDataProvider = /*#__PURE__*/function () {
  function TickListDataProvider(ticks, tickSpacing) {
    _classCallCheck(this, TickListDataProvider);
    _defineProperty(this, "ticks", void 0);
    const ticksMapped = ticks.map(t => t instanceof _tick.Tick ? t : new _tick.Tick(t));
    _tickList.TickList.validateList(ticksMapped, tickSpacing);
    this.ticks = ticksMapped;
  }
  return _createClass(TickListDataProvider, [{
    key: "getTick",
    value: function getTick(tick) {
      return _tickList.TickList.getTick(this.ticks, tick);
    }
  }, {
    key: "nextInitializedTickWithinOneWord",
    value: function nextInitializedTickWithinOneWord(tick, lte, tickSpacing) {
      return _tickList.TickList.nextInitializedTickWithinOneWord(this.ticks, tick, lte, tickSpacing);
    }
  }], [{
    key: "toJSON",
    value: function toJSON(ticks) {
      return ticks.map(tick => _tick.Tick.toJSON(tick));
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(ticksArray) {
      return ticksArray.map(_tick.Tick.fromJSON);
    }
  }]);
}();