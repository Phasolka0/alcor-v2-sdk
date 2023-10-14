"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const fractions_1 = require("./fractions");
const token_1 = require("./token");
const pool_1 = require("./pool");
const msgpack_lite_1 = __importDefault(require("msgpack-lite"));
/**
 * Represents a list of pools through which a swap can occur
 * @template TInput The input token
 * @template TOutput The output token
 */
class Route {
    /**
     * Creates an instance of route.
     * @param pools An array of `Pool` objects, ordered by the route the swap will take
     * @param input The input token
     * @param output The output token
     */
    constructor(pools, input, output) {
        this._midPrice = null;
        (0, tiny_invariant_1.default)(pools.length > 0, 'POOLS');
        const wrappedInput = input;
        (0, tiny_invariant_1.default)(pools[0].involvesToken(wrappedInput), 'INPUT');
        (0, tiny_invariant_1.default)(pools[pools.length - 1].involvesToken(output), 'OUTPUT');
        /**
         * Normalizes tokenA-tokenB order and selects the next token/fee step to add to the path
         * */
        const tokenPath = [wrappedInput];
        for (const [i, pool] of pools.entries()) {
            const currentInputToken = tokenPath[i];
            (0, tiny_invariant_1.default)(currentInputToken.equals(pool.tokenA) || currentInputToken.equals(pool.tokenB), 'PATH');
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
    get midPrice() {
        if (this._midPrice !== null)
            return this._midPrice;
        const price = this.pools.slice(1).reduce(({ nextInput, price }, pool) => {
            return nextInput.equals(pool.tokenA)
                ? {
                    nextInput: pool.tokenB,
                    price: price.multiply(pool.tokenAPrice)
                }
                : {
                    nextInput: pool.tokenA,
                    price: price.multiply(pool.tokenBPrice)
                };
        }, this.pools[0].tokenA.equals(this.input)
            ? {
                nextInput: this.pools[0].tokenB,
                price: this.pools[0].tokenAPrice
            }
            : {
                nextInput: this.pools[0].tokenA,
                price: this.pools[0].tokenBPrice
            }).price;
        return (this._midPrice = new fractions_1.Price(this.input, this.output, price.denominator, price.numerator));
    }
    static toJSON(route, lightWeightVersion = false) {
        return {
            pools: route.pools.map(pool => {
                if (lightWeightVersion) {
                    return pool.id;
                }
                else {
                    return pool_1.Pool.toBuffer(pool);
                }
            }),
            input: token_1.Token.toJSON(route.input),
            output: token_1.Token.toJSON(route.output),
            _midPrice: route._midPrice,
        };
    }
    static fromJSON(json) {
        const pools = json.pools.map(pool => {
            if (typeof pool === 'number') {
                return pool_1.Pool.fromId(pool);
            }
            else {
                return pool_1.Pool.fromBuffer(pool);
            }
        });
        const input = token_1.Token.fromJSON(json.input);
        const output = token_1.Token.fromJSON(json.output);
        return new Route(pools, input, output);
    }
    static toBuffer(route, lightWeightVersion = false) {
        const json = this.toJSON(route, lightWeightVersion);
        return msgpack_lite_1.default.encode(json);
    }
    static fromBuffer(buffer) {
        const json = msgpack_lite_1.default.decode(buffer);
        return this.fromJSON(json);
    }
    static toBufferAdvanced(route, pools) {
        const json = {
            pools: pools.map(pool => {
                if (typeof pool === 'number') {
                    return pool;
                }
                else {
                    return pool_1.Pool.toBuffer(pool);
                }
            }),
            input: token_1.Token.toJSON(route.input),
            output: token_1.Token.toJSON(route.output),
            _midPrice: route._midPrice,
        };
        return msgpack_lite_1.default.encode(json);
    }
    equals(other) {
        if (this.pools.length !== other.pools.length)
            return false;
        for (let i = 0; i < this.pools.length; i++) {
            if (!this.pools[i].equals(other.pools[i]))
                return false;
        }
        return this.input.equals(other.input) && this.output.equals(other.output);
    }
}
exports.Route = Route;
