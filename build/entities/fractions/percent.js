"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Percent = void 0;
var _fraction = require("./fraction");
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
const ONE_HUNDRED = new _fraction.Fraction(100n);

/**
 * Converts a fraction to a percent
 * @param fraction the fraction to convert
 */
function toPercent(fraction) {
  return new Percent(fraction.numerator, fraction.denominator);
}
let Percent = exports.Percent = /*#__PURE__*/function (_Fraction) {
  function Percent() {
    var _this;
    _classCallCheck(this, Percent);
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _callSuper(this, Percent, [...args]);
    /**
     * This boolean prevents a fraction from being interpreted as a Percent
     */
    _defineProperty(_this, "isPercent", true);
    return _this;
  }
  _inherits(Percent, _Fraction);
  return _createClass(Percent, [{
    key: "add",
    value: function add(other) {
      return toPercent(_superPropGet(Percent, "add", this, 3)([other]));
    }
  }, {
    key: "subtract",
    value: function subtract(other) {
      return toPercent(_superPropGet(Percent, "subtract", this, 3)([other]));
    }
  }, {
    key: "multiply",
    value: function multiply(other) {
      return toPercent(_superPropGet(Percent, "multiply", this, 3)([other]));
    }
  }, {
    key: "divide",
    value: function divide(other) {
      return toPercent(_superPropGet(Percent, "divide", this, 3)([other]));
    }
  }, {
    key: "toSignificant",
    value: function toSignificant() {
      let significantDigits = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
      let format = arguments.length > 1 ? arguments[1] : undefined;
      let rounding = arguments.length > 2 ? arguments[2] : undefined;
      return _superPropGet(Percent, "multiply", this, 3)([ONE_HUNDRED]).toSignificant(significantDigits, format, rounding);
    }
  }, {
    key: "toFixed",
    value: function toFixed() {
      let decimalPlaces = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
      let format = arguments.length > 1 ? arguments[1] : undefined;
      let rounding = arguments.length > 2 ? arguments[2] : undefined;
      return _superPropGet(Percent, "multiply", this, 3)([ONE_HUNDRED]).toFixed(decimalPlaces, format, rounding);
    }
  }]);
}(_fraction.Fraction);