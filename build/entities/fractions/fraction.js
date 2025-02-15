"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Fraction = void 0;
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _toformat = _interopRequireDefault(require("toformat"));
var _decimal = _interopRequireDefault(require("decimal.js-light"));
var _big = _interopRequireDefault(require("big.js"));
var _internalConstants = require("../../internalConstants");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const Decimal = (0, _toformat.default)(_decimal.default);
const Big = (0, _toformat.default)(_big.default);
const toSignificantRounding = {
  [_internalConstants.Rounding.ROUND_DOWN]: Decimal.ROUND_DOWN,
  [_internalConstants.Rounding.ROUND_HALF_UP]: Decimal.ROUND_HALF_UP,
  [_internalConstants.Rounding.ROUND_UP]: Decimal.ROUND_UP
};

// const toFixedRounding = {
//   [Rounding.ROUND_DOWN]: RoundingMode.RoundDown,
//   [Rounding.ROUND_HALF_UP]: RoundingMode.RoundHalfUp,
//   [Rounding.ROUND_UP]: RoundingMode.RoundUp
// }
const toFixedRounding = {
  [_internalConstants.Rounding.ROUND_DOWN]: 0,
  [_internalConstants.Rounding.ROUND_HALF_UP]: 1,
  [_internalConstants.Rounding.ROUND_UP]: 3
};
let Fraction = exports.Fraction = /*#__PURE__*/function () {
  function Fraction(numerator) {
    let denominator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1n;
    _classCallCheck(this, Fraction);
    _defineProperty(this, "numerator", void 0);
    _defineProperty(this, "denominator", void 0);
    this.numerator = BigInt(numerator);
    this.denominator = BigInt(denominator);
  }
  return _createClass(Fraction, [{
    key: "quotient",
    get:
    // performs floor division
    function () {
      return this.numerator / this.denominator;
    }

    // remainder after floor division
  }, {
    key: "remainder",
    get: function () {
      return new Fraction(this.numerator % this.denominator, this.denominator);
    }
  }, {
    key: "invert",
    value: function invert() {
      return new Fraction(this.denominator, this.numerator);
    }
  }, {
    key: "add",
    value: function add(other) {
      const otherParsed = Fraction.tryParseFraction(other);
      if (this.denominator === otherParsed.denominator) {
        return new Fraction(this.numerator + otherParsed.numerator, this.denominator);
      }
      return new Fraction(this.numerator * otherParsed.denominator + otherParsed.numerator * this.denominator, this.denominator * otherParsed.denominator);
    }
  }, {
    key: "subtract",
    value: function subtract(other) {
      const otherParsed = Fraction.tryParseFraction(other);
      if (this.denominator === otherParsed.denominator) {
        return new Fraction(this.numerator - otherParsed.numerator, this.denominator);
      }
      return new Fraction(this.numerator * otherParsed.denominator - otherParsed.numerator * this.denominator, this.denominator * otherParsed.denominator);
    }
  }, {
    key: "lessThan",
    value: function lessThan(other) {
      const otherParsed = Fraction.tryParseFraction(other);
      return this.numerator * otherParsed.denominator < otherParsed.numerator * this.denominator;
    }
  }, {
    key: "equalTo",
    value: function equalTo(other) {
      const otherParsed = Fraction.tryParseFraction(other);
      return this.numerator * otherParsed.denominator === otherParsed.numerator * this.denominator;
    }
  }, {
    key: "greaterThan",
    value: function greaterThan(other) {
      const otherParsed = Fraction.tryParseFraction(other);
      return this.numerator * otherParsed.denominator > otherParsed.numerator * this.denominator;
    }
  }, {
    key: "multiply",
    value: function multiply(other) {
      const otherParsed = Fraction.tryParseFraction(other);
      return new Fraction(this.numerator * otherParsed.numerator, this.denominator * otherParsed.denominator);
    }
  }, {
    key: "divide",
    value: function divide(other) {
      const otherParsed = Fraction.tryParseFraction(other);
      return new Fraction(this.numerator * otherParsed.denominator, this.denominator * otherParsed.numerator);
    }
  }, {
    key: "toSignificant",
    value: function toSignificant(significantDigits) {
      let format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        groupSeparator: ""
      };
      let rounding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _internalConstants.Rounding.ROUND_HALF_UP;
      (0, _tinyInvariant.default)(Number.isInteger(significantDigits), `${significantDigits} is not an integer.`);
      (0, _tinyInvariant.default)(significantDigits > 0, `${significantDigits} is not positive.`);
      Decimal.set({
        precision: significantDigits + 1,
        rounding: toSignificantRounding[rounding]
      });
      const quotient = new Decimal(this.numerator.toString()).div(this.denominator.toString()).toSignificantDigits(significantDigits);
      return quotient.toFormat(quotient.decimalPlaces(), format);
    }
  }, {
    key: "toFixed",
    value: function toFixed(decimalPlaces) {
      let format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        groupSeparator: ""
      };
      let rounding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _internalConstants.Rounding.ROUND_HALF_UP;
      (0, _tinyInvariant.default)(Number.isInteger(decimalPlaces), `${decimalPlaces} is not an integer.`);
      (0, _tinyInvariant.default)(decimalPlaces >= 0, `${decimalPlaces} is negative.`);
      Big.DP = decimalPlaces;
      Big.RM = toFixedRounding[rounding];
      return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(decimalPlaces, format);
    }

    /**
     * Helper method for converting any super class back to a fraction
     */
  }, {
    key: "asFraction",
    get: function () {
      return new Fraction(this.numerator, this.denominator);
    }
  }], [{
    key: "tryParseFraction",
    value: function tryParseFraction(fractionish) {
      if (typeof fractionish === "bigint" || typeof fractionish === "number" || typeof fractionish === "string") return new Fraction(fractionish);
      if ("numerator" in fractionish && "denominator" in fractionish) return fractionish;
      throw new Error("Could not parse fraction");
    }
  }]);
}();