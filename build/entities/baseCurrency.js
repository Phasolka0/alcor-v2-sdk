"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseCurrency = void 0;
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * A currency is any fungible financial instrument, including Ether, all ERC20 tokens, and other chain-native currencies
 */
let BaseCurrency = exports.BaseCurrency = /*#__PURE__*/_createClass(
/**
 * Constructs an instance of the base class `BaseCurrency`.
 * @param chainId the chain ID on which this currency resides
 * @param decimals decimals of the currency
 * @param symbol symbol of the currency
 * @param name of the currency
 */
function BaseCurrency(contract, decimals, symbol) {
  _classCallCheck(this, BaseCurrency);
  /**
   * The contract address of the currency
   */
  _defineProperty(this, "contract", void 0);
  /**
   * The decimals used in representing currency amounts
   */
  _defineProperty(this, "decimals", void 0);
  /**
   * The symbol of the currency, i.e. a short textual non-unique identifier
   */
  _defineProperty(this, "symbol", void 0);
  _defineProperty(this, "id", void 0);
  (0, _tinyInvariant.default)(decimals >= 0 && decimals < 19 && Number.isInteger(decimals), "DECIMALS");
  this.contract = contract;
  this.decimals = decimals;
  this.symbol = symbol;
  this.id = symbol.toLowerCase() + '-' + contract;
}

/**
 * Returns whether this currency is functionally equivalent to the other currency
 * @param other the other currency
 */);