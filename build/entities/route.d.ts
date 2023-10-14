/// <reference types="node" />
import { Currency } from './currency';
import { Price } from './fractions';
import { Token } from './token';
import { Pool } from './pool';
/**
 * Represents a list of pools through which a swap can occur
 * @template TInput The input token
 * @template TOutput The output token
 */
export declare class Route<TInput extends Currency, TOutput extends Currency> {
    readonly pools: Pool[];
    readonly tokenPath: Token[];
    readonly input: TInput;
    readonly output: TOutput;
    private _midPrice;
    /**
     * Creates an instance of route.
     * @param pools An array of `Pool` objects, ordered by the route the swap will take
     * @param input The input token
     * @param output The output token
     */
    constructor(pools: Pool[], input: TInput, output: TOutput);
    /**
     * Returns the mid price of the route
     */
    get midPrice(): Price<TInput, TOutput>;
    static toJSON(route: Route<Currency, Currency>): {
        pools: object[];
        input: {
            contract: string;
            decimals: number;
            symbol: string;
        };
        output: {
            contract: string;
            decimals: number;
            symbol: string;
        };
        _midPrice: Price<Token, Token> | null;
    };
    static fromJSON(json: any): Route<Token, Token>;
    static toBuffer(route: Route<Currency, Currency>): Buffer;
    static fromBuffer(buffer: Buffer): Route<Token, Token>;
    equals(other: Route<Currency, Currency>): boolean;
}
