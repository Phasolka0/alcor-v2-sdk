import JSBI from "jsbi";
export declare const NEGATIVE_ONE: JSBI;
export declare const ZERO: JSBI;
export declare const ONE: JSBI;
export declare const Q32: JSBI;
export declare const Q64: JSBI;
export declare const Q96: JSBI;
export declare const Q128: JSBI;
export declare const Q192: JSBI;
export declare const Q256: JSBI;
export declare const MaxUint256: JSBI;
export declare const MaxUint128: JSBI;
export declare const MaxUint64: JSBI;
export type BigintIsh = JSBI | string | number;
export declare enum TradeType {
    EXACT_INPUT = 0,
    EXACT_OUTPUT = 1
}
/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export declare enum FeeAmount {
    LOW = 500,
    MEDIUM = 3000,
    HIGH = 10000
}
export declare enum Rounding {
    ROUND_DOWN = 0,
    ROUND_HALF_UP = 1,
    ROUND_UP = 2
}
/**
 * The default factory tick spacings by fee amount.
 */
export declare const TICK_SPACINGS: {
    [amount in FeeAmount]: number;
};
