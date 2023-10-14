import { BaseCurrency } from "./baseCurrency";
/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
export declare class Token extends BaseCurrency {
    /**
     * @param contract {@link BaseCurrency#contract}
     * @param decimals {@link BaseCurrency#decimals}
     * @param symbol {@link BaseCurrency#symbol}
     */
    constructor(contract: string, decimals: number, symbol: string);
    get name(): string;
    /**
     * Returns true if the two tokens are equivalent, i.e. have the same contract and symbol.
     * @param other other token to compare
     */
    equals(other: Token): boolean;
    /**
     * Returns true if the address of this token sorts before the address of the other token
     * @param other other token to compare
     * @throws if the tokens have the same contract and symbol
     */
    sortsBefore(other: Token): boolean;
    static toJSON(token: Token): {
        contract: string;
        decimals: number;
        symbol: string;
    };
    static fromJSON(json: any): Token;
}
