"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Route = void 0;
var _msgpackLite = _interopRequireDefault(require("msgpack-lite"));
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _fractions = require("./fractions");
var _token = require("./token");
var _pool = require("./pool");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Represents a list of pools through which a swap can occur
 * @template TInput The input token
 * @template TOutput The output token
 */
let Route = exports.Route = /*#__PURE__*/function () {
  /**
   * Creates an instance of route.
   * @param pools An array of `Pool` objects, ordered by the route the swap will take
   * @param input The input token
   * @param output The output token
   */
  function Route(pools, input, output) {
    _classCallCheck(this, Route);
    _defineProperty(this, "pools", void 0);
    _defineProperty(this, "tokenPath", void 0);
    _defineProperty(this, "input", void 0);
    _defineProperty(this, "output", void 0);
    _defineProperty(this, "_midPrice", null);
    (0, _tinyInvariant.default)(pools.length > 0, 'POOLS');
    const wrappedInput = input;
    (0, _tinyInvariant.default)(pools[0].involvesToken(wrappedInput), 'INPUT');
    (0, _tinyInvariant.default)(pools[pools.length - 1].involvesToken(output), 'OUTPUT');

    /**
     * Normalizes tokenA-tokenB order and selects the next token/fee step to add to the path
     * */
    const tokenPath = [wrappedInput];
    for (const [i, pool] of pools.entries()) {
      const currentInputToken = tokenPath[i];
      (0, _tinyInvariant.default)(currentInputToken.equals(pool.tokenA) || currentInputToken.equals(pool.tokenB), 'PATH');
      const nextToken = currentInputToken.equals(pool.tokenA) ? pool.tokenB : pool.tokenA;
      tokenPath.push(nextToken);
    }
    this.pools = pools;
    this.tokenPath = tokenPath;
    this.input = input;
    this.output = output !== null && output !== void 0 ? output : tokenPath[tokenPath.length - 1];
  }

  /**
   * Returns the mid price of the route
   */
  return _createClass(Route, [{
    key: "midPrice",
    get: function () {
      if (this._midPrice !== null) return this._midPrice;
      const price = this.pools.slice(1).reduce((_ref, pool) => {
        let {
          nextInput,
          price
        } = _ref;
        return nextInput.equals(pool.tokenA) ? {
          nextInput: pool.tokenB,
          price: price.multiply(pool.tokenAPrice)
        } : {
          nextInput: pool.tokenA,
          price: price.multiply(pool.tokenBPrice)
        };
      }, this.pools[0].tokenA.equals(this.input) ? {
        nextInput: this.pools[0].tokenB,
        price: this.pools[0].tokenAPrice
      } : {
        nextInput: this.pools[0].tokenA,
        price: this.pools[0].tokenBPrice
      }).price;
      return this._midPrice = new _fractions.Price(this.input, this.output, price.denominator, price.numerator);
    }
  }, {
    key: "equals",
    value: function equals(other) {
      if (this.pools.length !== other.pools.length) return false;
      for (let i = 0; i < this.pools.length; i++) {
        if (!this.pools[i].equals(other.pools[i])) return false;
      }
      return this.input.equals(other.input) && this.output.equals(other.output);
    }
  }], [{
    key: "toJSON",
    value: function toJSON(route) {
      let lightWeightVersion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      return {
        pools: route.pools.map(pool => {
          if (lightWeightVersion) {
            return pool.id;
          } else {
            return _pool.Pool.toBuffer(pool);
          }
        }),
        input: _token.Token.toJSON(route.input),
        output: _token.Token.toJSON(route.output),
        _midPrice: route._midPrice
      };
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(json) {
      const pools = json.pools.map(pool => {
        if (typeof pool === 'number') {
          return _pool.Pool.fromId(pool);
        } else {
          return _pool.Pool.fromBuffer(Buffer.from(pool));
        }
      });
      const input = _token.Token.fromJSON(json.input);
      const output = _token.Token.fromJSON(json.output);
      return new Route(pools, input, output);
    }
  }, {
    key: "toBuffer",
    value: function toBuffer(route) {
      let lightWeightVersion = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      const json = this.toJSON(route, lightWeightVersion);
      return _msgpackLite.default.encode(json);
    }
  }, {
    key: "fromBuffer",
    value: function fromBuffer(buffer) {
      const json = _msgpackLite.default.decode(buffer);
      return this.fromJSON(json);
    }
  }, {
    key: "toBufferAdvanced",
    value: function toBufferAdvanced(route, pools) {
      const json = {
        pools: pools.map(pool => {
          if (typeof pool === 'number' || Buffer.isBuffer(pool)) {
            return pool;
          } else {
            return _pool.Pool.toBuffer(pool);
          }
        }),
        input: _token.Token.toJSON(route.input),
        output: _token.Token.toJSON(route.output),
        _midPrice: route._midPrice
      };
      return _msgpackLite.default.encode(json);
    }
  }]);
}();