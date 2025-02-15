"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TickList = void 0;
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _internalConstants = require("../internalConstants");
var _isSorted = require("./isSorted");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function tickComparator(a, b) {
  return a.id - b.id;
}

/**x
 * Utility methods for interacting with sorted lists of ticks
 */
let TickList = exports.TickList = /*#__PURE__*/function () {
  /**
   * Cannot be constructed
   */
  function TickList() {
    _classCallCheck(this, TickList);
  }
  return _createClass(TickList, null, [{
    key: "validateList",
    value: function validateList(ticks, tickSpacing) {
      (0, _tinyInvariant.default)(tickSpacing > 0, "TICK_SPACING_NONZERO");
      // ensure ticks are spaced appropriately
      (0, _tinyInvariant.default)(ticks.every(_ref => {
        let {
          id
        } = _ref;
        return id % tickSpacing === 0;
      }), "TICK_SPACING");
      const totalNet = ticks.reduce((accumulator, _ref2) => {
        let {
          liquidityNet
        } = _ref2;
        return accumulator + liquidityNet;
      }, _internalConstants.ZERO);
      if (!(totalNet === _internalConstants.ZERO)) console.error('ZERO_NET INVARIAN ISSUE!');

      // HOTFIX ignoring for now TODO
      // ensure tick liquidity deltas sum to 0
      // invariant(
      //   JSBI.equal(
      //     ticks.reduce(
      //       (accumulator, { liquidityNet }) =>
      //         JSBI.add(accumulator, liquidityNet),
      //       ZERO
      //     ),
      //     ZERO
      //   ),
      //   "ZERO_NET"
      // );

      (0, _tinyInvariant.default)((0, _isSorted.isSorted)(ticks, tickComparator), "SORTED");
    }
  }, {
    key: "isBelowSmallest",
    value: function isBelowSmallest(ticks, tick) {
      (0, _tinyInvariant.default)(ticks.length > 0, "LENGTH");
      return tick < ticks[0].id;
    }
  }, {
    key: "isAtOrAboveLargest",
    value: function isAtOrAboveLargest(ticks, tick) {
      (0, _tinyInvariant.default)(ticks.length > 0, "LENGTH");
      return tick >= ticks[ticks.length - 1].id;
    }
  }, {
    key: "getTick",
    value: function getTick(ticks, id) {
      const tick = ticks[this.binarySearch(ticks, id)];
      (0, _tinyInvariant.default)(tick.id === id, "NOT_CONTAINED");
      return tick;
    }

    /**
     * Finds the largest tick in the list of ticks that is less than or equal to tick
     * @param ticks list of ticks
     * @param tick tick to find the largest tick that is less than or equal to tick
     * @private
     */
  }, {
    key: "binarySearch",
    value: function binarySearch(ticks, tick) {
      (0, _tinyInvariant.default)(!this.isBelowSmallest(ticks, tick), "BELOW_SMALLEST");
      let l = 0;
      let r = ticks.length - 1;
      let i;
      while (true) {
        i = Math.floor((l + r) / 2);
        if (ticks[i].id <= tick && (i === ticks.length - 1 || ticks[i + 1].id > tick)) {
          return i;
        }
        if (ticks[i].id < tick) {
          l = i + 1;
        } else {
          r = i - 1;
        }
      }
    }
  }, {
    key: "nextInitializedTick",
    value: function nextInitializedTick(ticks, tick, lte) {
      if (lte) {
        (0, _tinyInvariant.default)(!TickList.isBelowSmallest(ticks, tick), "BELOW_SMALLEST");
        if (TickList.isAtOrAboveLargest(ticks, tick)) {
          return ticks[ticks.length - 1];
        }
        const id = this.binarySearch(ticks, tick);
        return ticks[id];
      } else {
        (0, _tinyInvariant.default)(!this.isAtOrAboveLargest(ticks, tick), "AT_OR_ABOVE_LARGEST");
        if (this.isBelowSmallest(ticks, tick)) {
          return ticks[0];
        }
        const id = this.binarySearch(ticks, tick);
        return ticks[id + 1];
      }
    }
  }, {
    key: "nextInitializedTickWithinOneWord",
    value: function nextInitializedTickWithinOneWord(ticks, tick, lte, tickSpacing) {
      const compressed = Math.floor(tick / tickSpacing); // matches rounding in the code

      if (lte) {
        const wordPos = compressed >> 7;
        const minimum = (wordPos << 7) * tickSpacing;
        if (TickList.isBelowSmallest(ticks, tick)) {
          return [minimum, false];
        }
        const id = TickList.nextInitializedTick(ticks, tick, lte).id;
        const nextInitializedTick = Math.max(minimum, id);
        return [nextInitializedTick, nextInitializedTick === id];
      } else {
        const wordPos = compressed + 1 >> 7;
        const maximum = ((wordPos + 1 << 7) - 1) * tickSpacing;
        if (this.isAtOrAboveLargest(ticks, tick)) {
          return [maximum, false];
        }
        const id = this.nextInitializedTick(ticks, tick, lte).id;
        const nextInitializedTick = Math.min(maximum, id);
        return [nextInitializedTick, nextInitializedTick === id];
      }
    }
  }]);
}();