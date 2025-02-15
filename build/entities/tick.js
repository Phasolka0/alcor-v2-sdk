"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tick = void 0;
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _utils = require("../utils");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let Tick = exports.Tick = /*#__PURE__*/function () {
  function Tick(_ref) {
    let {
      id,
      liquidityGross,
      liquidityNet,
      feeGrowthOutsideAX64 = 0,
      feeGrowthOutsideBX64 = 0,
      tickCumulativeOutside = 0,
      secondsOutside = 0,
      secondsPerLiquidityOutsideX64 = 0
    } = _ref;
    _classCallCheck(this, Tick);
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "liquidityGross", void 0);
    _defineProperty(this, "liquidityNet", void 0);
    _defineProperty(this, "feeGrowthOutsideAX64", void 0);
    _defineProperty(this, "feeGrowthOutsideBX64", void 0);
    _defineProperty(this, "tickCumulativeOutside", void 0);
    _defineProperty(this, "secondsOutside", void 0);
    _defineProperty(this, "secondsPerLiquidityOutsideX64", void 0);
    (0, _tinyInvariant.default)(id >= _utils.TickMath.MIN_TICK && id <= _utils.TickMath.MAX_TICK, "TICK");
    this.id = id;
    this.liquidityGross = BigInt(liquidityGross);
    this.liquidityNet = BigInt(liquidityNet);
    this.feeGrowthOutsideAX64 = BigInt(feeGrowthOutsideAX64);
    this.feeGrowthOutsideBX64 = BigInt(feeGrowthOutsideBX64);
    this.tickCumulativeOutside = BigInt(tickCumulativeOutside);
    this.secondsOutside = BigInt(secondsOutside);
    this.secondsPerLiquidityOutsideX64 = BigInt(secondsPerLiquidityOutsideX64);
  }
  return _createClass(Tick, null, [{
    key: "toJSON",
    value: function toJSON(tick) {
      return {
        id: tick.id,
        liquidityGross: tick.liquidityGross.toString(),
        liquidityNet: tick.liquidityNet.toString(),
        feeGrowthOutsideAX64: tick.feeGrowthOutsideAX64.toString(),
        feeGrowthOutsideBX64: tick.feeGrowthOutsideBX64.toString(),
        tickCumulativeOutside: tick.tickCumulativeOutside.toString(),
        secondsOutside: tick.secondsOutside.toString(),
        secondsPerLiquidityOutsideX64: tick.secondsPerLiquidityOutsideX64.toString()
      };
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(json) {
      return new Tick({
        id: json.id,
        liquidityGross: BigInt(json.liquidityGross),
        liquidityNet: BigInt(json.liquidityNet),
        feeGrowthOutsideAX64: BigInt(json.feeGrowthOutsideAX64),
        feeGrowthOutsideBX64: BigInt(json.feeGrowthOutsideBX64),
        tickCumulativeOutside: BigInt(json.tickCumulativeOutside),
        secondsOutside: BigInt(json.secondsOutside),
        secondsPerLiquidityOutsideX64: BigInt(json.secondsPerLiquidityOutsideX64)
      });
    }
  }]);
}();