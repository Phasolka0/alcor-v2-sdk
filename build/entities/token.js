"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Token = void 0;
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _baseCurrency = require("./baseCurrency");
var _eosCommon = require("eos-common");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
let Token = exports.Token = /*#__PURE__*/function (_BaseCurrency) {
  /**
   * @param contract {@link BaseCurrency#contract}
   * @param decimals {@link BaseCurrency#decimals}
   * @param symbol {@link BaseCurrency#symbol}
   */
  function Token(contract, decimals, symbol) {
    _classCallCheck(this, Token);
    return _callSuper(this, Token, [contract, decimals, symbol]);
  }
  _inherits(Token, _BaseCurrency);
  return _createClass(Token, [{
    key: "name",
    get: function () {
      console.warn('Token.name is deprecated, use token.id');
      return this.symbol.toLowerCase() + '-' + this.contract;
    }

    /**
     * Returns true if the two tokens are equivalent, i.e. have the same contract and symbol.
     * @param other other token to compare
     */
  }, {
    key: "equals",
    value: function equals(other) {
      return this.contract === other.contract && this.symbol === other.symbol && this.decimals === other.decimals;
    }

    /**
     * Returns true if the address of this token sorts before the address of the other token
     * @param other other token to compare
     * @throws if the tokens have the same contract and symbol
     */
  }, {
    key: "sortsBefore",
    value: function sortsBefore(other) {
      if (this.contract === other.contract) {
        (0, _tinyInvariant.default)(this.symbol !== other.symbol, "SYMBOLS");
        const token0Symbol = (0, _eosCommon.symbol)(this.symbol, this.decimals);
        const token1Symbol = (0, _eosCommon.symbol)(other.symbol, other.decimals);
        return token0Symbol.raw().lt(token1Symbol.raw());
      } else {
        return (0, _eosCommon.name)(this.contract).raw().lt((0, _eosCommon.name)(other.contract).raw());
      }
    }
  }], [{
    key: "toJSON",
    value: function toJSON(token) {
      return {
        contract: token.contract,
        decimals: token.decimals,
        symbol: token.symbol
      };
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(json) {
      return new Token(json.contract, json.decimals, json.symbol);
    }
  }]);
}(_baseCurrency.BaseCurrency);