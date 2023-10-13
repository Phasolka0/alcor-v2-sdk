import invariant from 'tiny-invariant'

import { Currency } from './currency'
import { Price } from './fractions'
import { Token } from './token'

import { Pool } from './pool'

/**
 * Represents a list of pools through which a swap can occur
 * @template TInput The input token
 * @template TOutput The output token
 */
export class Route<TInput extends Currency, TOutput extends Currency> {
  public readonly pools: Pool[]
  public readonly tokenPath: Token[]
  public readonly input: TInput
  public readonly output: TOutput

  private _midPrice: Price<TInput, TOutput> | null = null

  /**
   * Creates an instance of route.
   * @param pools An array of `Pool` objects, ordered by the route the swap will take
   * @param input The input token
   * @param output The output token
   */
  public constructor(pools: Pool[], input: TInput, output: TOutput) {
    invariant(pools.length > 0, 'POOLS')

    const wrappedInput = input
    invariant(pools[0].involvesToken(wrappedInput), 'INPUT')

    invariant(pools[pools.length - 1].involvesToken(output), 'OUTPUT')

    /**
     * Normalizes tokenA-tokenB order and selects the next token/fee step to add to the path
     * */
    const tokenPath: Token[] = [wrappedInput]
    for (const [i, pool] of pools.entries()) {
      const currentInputToken = tokenPath[i]
      invariant(currentInputToken.equals(pool.tokenA) || currentInputToken.equals(pool.tokenB), 'PATH')
      const nextToken = currentInputToken.equals(pool.tokenA) ? pool.tokenB : pool.tokenA
      tokenPath.push(nextToken)
    }

    this.pools = pools
    this.tokenPath = tokenPath
    this.input = input
    this.output = output ?? tokenPath[tokenPath.length - 1]
  }

  /**
   * Returns the mid price of the route
   */
  public get midPrice(): Price<TInput, TOutput> {
    if (this._midPrice !== null) return this._midPrice

    const price = this.pools.slice(1).reduce(
      ({ nextInput, price }, pool) => {
        return nextInput.equals(pool.tokenA)
          ? {
              nextInput: pool.tokenB,
              price: price.multiply(pool.tokenAPrice)
            }
          : {
              nextInput: pool.tokenA,
              price: price.multiply(pool.tokenBPrice)
            }
      },
      this.pools[0].tokenA.equals(this.input)
        ? {
            nextInput: this.pools[0].tokenB,
            price: this.pools[0].tokenAPrice
          }
        : {
            nextInput: this.pools[0].tokenA,
            price: this.pools[0].tokenBPrice
          }
    ).price

    return (this._midPrice = new Price(this.input, this.output, price.denominator, price.numerator))
  }

    static serialize(route: Route<any, any>) {
        return JSON.stringify({
            pools: route.pools.map(pool => Pool.serialize(pool)), // предполагается, что у Pool тоже есть метод serialize
            //tokenPath: route.tokenPath.map(token => Token.serialize(token)),
            input: Token.serialize(route.input),
            output: Token.serialize(route.output),
            _midPrice: route._midPrice,
        });
    }
    static deserialize(jsonStr: string) {
        const obj = JSON.parse(jsonStr);
        const pools = obj.pools.map(pool => Pool.deserialize(pool)); // предполагается, что у Pool тоже есть метод deserialize
        //const tokenPath = obj.tokenPath.map(token => Token.deserialize(token));
        const input = Token.deserialize(obj.input);
        const output = Token.deserialize(obj.output);
        return new Route(pools, input, output);
    }
    public equals(other: Route<Currency, Currency>): boolean {
        // Сравниваем длины массивов пулов
        if (this.pools.length !== other.pools.length) return false;

        // Сравниваем пулы по одному (предполагается, что у Pool есть метод equals)
        for (let i = 0; i < this.pools.length; i++) {
            if (!this.pools[i].equals(other.pools[i])) return false;
        }

        // Сравниваем входные и выходные токены (предполагается, что у Token есть метод equals)
        return this.input.equals(other.input) && this.output.equals(other.output);
    }
}
