"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ZERO = exports.TradeType = exports.TICK_SPACINGS = exports.Rounding = exports.Q96 = exports.Q64 = exports.Q32 = exports.Q256 = exports.Q192 = exports.Q128 = exports.ONE = exports.NEGATIVE_ONE = exports.MaxUint64 = exports.MaxUint256 = exports.MaxUint128 = exports.FeeAmount = void 0;
// constants used internally but not expected to be used externally
const NEGATIVE_ONE = exports.NEGATIVE_ONE = BigInt(-1);
const ZERO = exports.ZERO = 0n;
const ONE = exports.ONE = 1n;

// used in liquidity amount math
const Q32 = exports.Q32 = 2n ** 32n;
const Q64 = exports.Q64 = 2n ** 64n;
const Q96 = exports.Q96 = 2n ** 96n;
const Q128 = exports.Q128 = 2n ** 128n;
const Q192 = exports.Q192 = 2n ** 192n;
const Q256 = exports.Q256 = 2n ** 256n;
const MaxUint256 = exports.MaxUint256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
const MaxUint128 = exports.MaxUint128 = BigInt("0xffffffffffffffffffffffffffffffff");
const MaxUint64 = exports.MaxUint64 = BigInt("0xffffffffffffffff");

// exports for external consumption
let TradeType = exports.TradeType = /*#__PURE__*/function (TradeType) {
  TradeType[TradeType["EXACT_INPUT"] = 0] = "EXACT_INPUT";
  TradeType[TradeType["EXACT_OUTPUT"] = 1] = "EXACT_OUTPUT";
  return TradeType;
}({});
/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
let FeeAmount = exports.FeeAmount = /*#__PURE__*/function (FeeAmount) {
  FeeAmount[FeeAmount["LOW"] = 500] = "LOW";
  FeeAmount[FeeAmount["MEDIUM"] = 3000] = "MEDIUM";
  FeeAmount[FeeAmount["HIGH"] = 10000] = "HIGH";
  return FeeAmount;
}({});
let Rounding = exports.Rounding = /*#__PURE__*/function (Rounding) {
  Rounding[Rounding["ROUND_DOWN"] = 0] = "ROUND_DOWN";
  Rounding[Rounding["ROUND_HALF_UP"] = 1] = "ROUND_HALF_UP";
  Rounding[Rounding["ROUND_UP"] = 2] = "ROUND_UP";
  return Rounding;
}({});
/**
 * The default factory tick spacings by fee amount.
 */
const TICK_SPACINGS = exports.TICK_SPACINGS = {
  [FeeAmount.LOW]: 10,
  [FeeAmount.MEDIUM]: 60,
  [FeeAmount.HIGH]: 200
};

// export const TICK_SPACINGS: { [amount in FeeAmount]: number } = {
//   [FeeAmount.LOW]: 4,
//   [FeeAmount.MEDIUM]: 10,
//   [FeeAmount.HIGH]: 50,
// };