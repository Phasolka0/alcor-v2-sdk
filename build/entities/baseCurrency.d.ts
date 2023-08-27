import { Currency } from "./currency";
/**
 * A currency is any fungible financial instrument, including Ether, all ERC20 tokens, and other chain-native currencies
 */
export declare abstract class BaseCurrency {
    /**
     * The contract address of the currency
     */
    readonly contract: string;
    /**
     * The decimals used in representing currency amounts
     */
    readonly decimals: number;
    /**
     * The symbol of the currency, i.e. a short textual non-unique identifier
     */
    readonly symbol: string;
    /**
     * The id of the currency(<symbol-contract>), i.e. eos-eosio.token
     */
    readonly id?: string;
    /**
     * Constructs an instance of the base class `BaseCurrency`.
     * @param chainId the chain ID on which this currency resides
     * @param decimals decimals of the currency
     * @param symbol symbol of the currency
     * @param name of the currency
     */
    protected constructor(contract: string, decimals: number, symbol: string, id?: string);
    /**
     * Returns whether this currency is functionally equivalent to the other currency
     * @param other the other currency
     */
    abstract equals(other: Currency): boolean;
}
