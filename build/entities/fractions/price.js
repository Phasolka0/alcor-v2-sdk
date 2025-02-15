"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Price = void 0;
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _fraction = require("./fraction");
var _currencyAmount = require("./currencyAmount");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let Price = exports.Price = /*#__PURE__*/function (_Fraction) {
  // used to adjust the raw fraction w/r/t the decimals of the {base,quote}Token

  /**
   * Construct a price, either with the base and quote currency amount, or the
   * @param args
   */
  function Price() {
    var _this;
    _classCallCheck(this, Price);
    let baseCurrency, quoteCurrency, denominator, numerator;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    if (args.length === 4) {
      [baseCurrency, quoteCurrency, denominator, numerator] = args;
    } else {
      const result = args[0].quoteAmount.divide(args[0].baseAmount);
      [baseCurrency, quoteCurrency, denominator, numerator] = [args[0].baseAmount.currency, args[0].quoteAmount.currency, result.denominator, result.numerator];
    }
    _this = _callSuper(this, Price, [numerator, denominator]);
    _defineProperty(_this, "baseCurrency", void 0);
    // input i.e. denominator
    _defineProperty(_this, "quoteCurrency", void 0);
    // output i.e. numerator
    _defineProperty(_this, "scalar", void 0);
    _this.baseCurrency = baseCurrency;
    _this.quoteCurrency = quoteCurrency;
    _this.scalar = new _fraction.Fraction(10n ** BigInt(baseCurrency.decimals), 10n ** BigInt(quoteCurrency.decimals));
    return _this;
  }

  /**
   * Flip the price, switching the base and quote currency
   */
  _inherits(Price, _Fraction);
  return _createClass(Price, [{
    key: "invert",
    value: function invert() {
      return new Price(this.quoteCurrency, this.baseCurrency, this.numerator, this.denominator);
    }

    /**
     * Multiply the price by another price, returning a new price. The other price must have the same base currency as this price's quote currency
     * @param other the other price
     */
  }, {
    key: "multiply",
    value: function multiply(other) {
      (0, _tinyInvariant.default)(this.quoteCurrency.equals(other.baseCurrency), "TOKEN");
      const fraction = _superPropGet(Price, "multiply", this, 3)([other]);
      return new Price(this.baseCurrency, other.quoteCurrency, fraction.denominator, fraction.numerator);
    }

    /**
     * Return the amount of quote currency corresponding to a given amount of the base currency
     * @param currencyAmount the amount of base currency to quote against the price
     */
  }, {
    key: "quote",
    value: function quote(currencyAmount) {
      (0, _tinyInvariant.default)(currencyAmount.currency.equals(this.baseCurrency), "TOKEN");
      const result = _superPropGet(Price, "multiply", this, 3)([currencyAmount]);
      return _currencyAmount.CurrencyAmount.fromFractionalAmount(this.quoteCurrency, result.numerator, result.denominator);
    }

    /**
     * Get the value scaled by decimals for formatting
     * @private
     */
  }, {
    key: "adjustedForDecimals",
    get: function () {
      return _superPropGet(Price, "multiply", this, 3)([this.scalar]);
    }
  }, {
    key: "toSignificant",
    value: function toSignificant() {
      let significantDigits = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 6;
      let format = arguments.length > 1 ? arguments[1] : undefined;
      let rounding = arguments.length > 2 ? arguments[2] : undefined;
      return this.adjustedForDecimals.toSignificant(significantDigits, format, rounding);
    }
  }, {
    key: "toFixed",
    value: function toFixed() {
      let decimalPlaces = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;
      let format = arguments.length > 1 ? arguments[1] : undefined;
      let rounding = arguments.length > 2 ? arguments[2] : undefined;
      return this.adjustedForDecimals.toFixed(decimalPlaces, format, rounding);
    }
  }]);
}(_fraction.Fraction);