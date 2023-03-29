import invariant from "tiny-invariant";
import { BaseCurrency } from "./baseCurrency";
import { nameToUint64 } from "eosjs-account-name";
import JSBI from "jsbi";

/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
export class Token extends BaseCurrency {
  /**
   * @param contract {@link BaseCurrency#contract}
   * @param decimals {@link BaseCurrency#decimals}
   * @param symbol {@link BaseCurrency#symbol}
   * @param id {@link BaseCurrency#id}
   */
  public constructor(
    contract: string,
    decimals: number,
    symbol: string,
    id?: string
  ) {
    super(contract, decimals, symbol, id);
  }

  public get name(): string {
    console.warn('Token.name is deprecated, use token.id')
    return this.symbol.toLowerCase() + '-' + this.contract
  }

  /**
   * Returns true if the two tokens are equivalent, i.e. have the same contract and symbol.
   * @param other other token to compare
   */
  public equals(other: Token): boolean {
    return (
      this.contract === other.contract &&
      this.symbol === other.symbol &&
      this.decimals === other.decimals
    );
  }

  /**
   * Returns true if the address of this token sorts before the address of the other token
   * @param other other token to compare
   * @throws if the tokens have the same contract and symbol
   */
  public sortsBefore(other: Token): boolean {
    if (this.contract === other.contract) {
      invariant(this.symbol !== other.symbol, "SYMBOLS");
      return this.symbol.toLowerCase() < other.symbol.toLowerCase();
    } else {
      return JSBI.lessThan(
        JSBI.BigInt(nameToUint64(this.contract)),
        JSBI.BigInt(nameToUint64(other.contract))
      );
    }
  }
}
