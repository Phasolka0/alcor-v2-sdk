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
    static serialize(route) {
        return JSON.stringify({
            pools: route.pools.map(pool => pool_1.Pool.serialize(pool)),
            //tokenPath: route.tokenPath.map(token => Token.serialize(token)),
            input: token_1.Token.serialize(route.input),
            output: token_1.Token.serialize(route.output),
            _midPrice: route._midPrice,
        });
    }
    static deserialize(jsonStr) {
        const obj = JSON.parse(jsonStr);
        const pools = obj.pools.map(pool => pool_1.Pool.deserialize(pool)); // предполагается, что у Pool тоже есть метод deserialize
        //const tokenPath = obj.tokenPath.map(token => Token.deserialize(token));
        const input = token_1.Token.deserialize(obj.input);
        const output = token_1.Token.deserialize(obj.output);
        return new Route(pools, input, output);
    }
    equals(other) {
        // Сравниваем длины массивов пулов
        if (this.pools.length !== other.pools.length)
            return false;
        // Сравниваем пулы по одному (предполагается, что у Pool есть метод equals)
        for (let i = 0; i < this.pools.length; i++) {
            if (!this.pools[i].equals(other.pools[i]))
                return false;
        }
        // Сравниваем входные и выходные токены (предполагается, что у Token есть метод equals)
        return this.input.equals(other.input) && this.output.equals(other.output);
    }
}
exports.Route = Route;
