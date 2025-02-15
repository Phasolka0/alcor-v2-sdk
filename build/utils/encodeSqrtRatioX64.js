"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encodeSqrtRatioX64 = encodeSqrtRatioX64;
var _ = require(".");
/**
 * Returns the sqrt ratio as a Q64.64 corresponding to a given ratio of amountB and amountA
 * @param amountB The numerator amount i.e., the amount of tokenB
 * @param amountA The denominator amount i.e., the amount of tokenA
 * @returns The sqrt ratio
 */

function encodeSqrtRatioX64(amountB, amountA) {
  const numerator = BigInt(amountB) << 128n;
  const denominator = BigInt(amountA);
  const ratioX128 = numerator / denominator;
  return (0, _.sqrt)(ratioX128);
}