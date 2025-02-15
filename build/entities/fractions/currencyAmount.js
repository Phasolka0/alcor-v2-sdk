"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CurrencyAmount = void 0;
var _msgpackLite = _interopRequireDefault(require("msgpack-lite"));
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _token = require("../token");
var _fraction = require("./fraction");
var _big = _interopRequireDefault(require("big.js"));
var _toformat = _interopRequireDefault(require("toformat"));
var _internalConstants = require("../../internalConstants");
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
const Big = (0, _toformat.default)(_big.default);
let CurrencyAmount = exports.CurrencyAmount = /*#__PURE__*/function (_Fraction) {
  function CurrencyAmount(currency, numerator, denominator) {
    var _this;
    _classCallCheck(this, CurrencyAmount);
    _this = _callSuper(this, CurrencyAmount, [numerator, denominator]);
    _defineProperty(_this, "currency", void 0);
    _defineProperty(_this, "decimalScale", void 0);
    (0, _tinyInvariant.default)(_this.quotient <= _internalConstants.MaxUint256, "AMOUNT");
    _this.currency = currency;
    _this.decimalScale = 10n ** BigInt(currency.decimals);
    return _this;
  }
  _inherits(CurrencyAmount, _Fraction);
  return _createClass(CurrencyAmount, [{
    key: "add",
    value: function add(other) {
      (0, _tinyInvariant.default)(this.currency.equals(other.currency), "CURRENCY");
      const added = _superPropGet(CurrencyAmount, "add", this, 3)([other]);
      return CurrencyAmount.fromFractionalAmount(this.currency, added.numerator, added.denominator);
    }
  }, {
    key: "subtract",
    value: function subtract(other) {
      (0, _tinyInvariant.default)(this.currency.equals(other.currency), "CURRENCY");
      const subtracted = _superPropGet(CurrencyAmount, "subtract", this, 3)([other]);
      return CurrencyAmount.fromFractionalAmount(this.currency, subtracted.numerator, subtracted.denominator);
    }
  }, {
    key: "multiply",
    value: function multiply(other) {
      const multiplied = _superPropGet(CurrencyAmount, "multiply", this, 3)([other]);
      return CurrencyAmount.fromFractionalAmount(this.currency, multiplied.numerator, multiplied.denominator);
    }
  }, {
    key: "divide",
    value: function divide(other) {
      const divided = _superPropGet(CurrencyAmount, "divide", this, 3)([other]);
      return CurrencyAmount.fromFractionalAmount(this.currency, divided.numerator, divided.denominator);
    }
  }, {
    key: "toSignificant",
    value: function toSignificant() {
      let significantDigits = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 6;
      let format = arguments.length > 1 ? arguments[1] : undefined;
      let rounding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _internalConstants.Rounding.ROUND_DOWN;
      return _superPropGet(CurrencyAmount, "divide", this, 3)([this.decimalScale]).toSignificant(significantDigits, format, rounding);
    }
  }, {
    key: "toFixed",
    value: function toFixed() {
      let decimalPlaces = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.currency.decimals;
      let format = arguments.length > 1 ? arguments[1] : undefined;
      let rounding = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _internalConstants.Rounding.ROUND_DOWN;
      (0, _tinyInvariant.default)(decimalPlaces <= this.currency.decimals, "DECIMALS");
      return _superPropGet(CurrencyAmount, "divide", this, 3)([this.decimalScale]).toFixed(decimalPlaces, format, rounding);
    }
  }, {
    key: "toExact",
    value: function toExact() {
      let format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        groupSeparator: ""
      };
      Big.DP = this.currency.decimals;
      return new Big(this.quotient.toString()).div(this.decimalScale.toString()).toFormat(format);
    }
  }, {
    key: "toAsset",
    value: function toAsset() {
      return `${this.toFixed(...arguments)} ${this.currency.symbol}`;
    }
  }, {
    key: "toExtendedAsset",
    value: function toExtendedAsset() {
      return `${this.toFixed(...arguments)} ${this.currency.symbol}@${this.currency.contract}`;
    }
  }, {
    key: "toExtendedAssetObject",
    value: function toExtendedAssetObject() {
      return {
        quantity: `${this.toFixed(...arguments)} ${this.currency.symbol}`,
        contract: this.currency.contract
      };
    }
  }], [{
    key: "fromRawAmount",
    value:
    /**
     * Returns a new currency amount instance from the unitless amount of token, i.e. the raw amount
     * @param currency the currency in the amount
     * @param rawAmount the raw token or ether amount
     */
    function fromRawAmount(currency, rawAmount) {
      return new CurrencyAmount(currency, rawAmount);
    }

    /**
     * Construct a currency amount with a denominator that is not equal to 1
     * @param currency the currency
     * @param numerator the numerator of the fractional token amount
     * @param denominator the denominator of the fractional token amount
     */
  }, {
    key: "fromFractionalAmount",
    value: function fromFractionalAmount(currency, numerator, denominator) {
      return new CurrencyAmount(currency, numerator, denominator);
    }
  }, {
    key: "toJSON",
    value: function toJSON(amount) {
      return {
        currency: _token.Token.toJSON(amount.currency),
        numerator: amount.numerator.toString(),
        denominator: amount.denominator.toString()
      };
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(json) {
      const currency = _token.Token.fromJSON(json.currency);
      const numerator = BigInt(json.numerator);
      const denominator = BigInt(json.denominator);
      return new CurrencyAmount(currency, numerator, denominator);
    }
  }, {
    key: "toBuffer",
    value: function toBuffer(amount) {
      const json = {
        currency: _token.Token.toJSON(amount.currency),
        numerator: amount.numerator.toString(),
        denominator: amount.denominator.toString()
      };
      return _msgpackLite.default.encode(json);
    }
  }, {
    key: "fromBuffer",
    value: function fromBuffer(buffer) {
      const json = _msgpackLite.default.decode(buffer);
      return this.fromJSON(json);
    }
  }]);
}(_fraction.Fraction);