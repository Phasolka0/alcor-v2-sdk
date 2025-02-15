"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MAX_SAFE_INTEGER = void 0;
exports.sqrt = sqrt;
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const MAX_SAFE_INTEGER = exports.MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
const ZERO = 0n;
const ONE = 1n;
const TWO = 2n;

/**
 * Computes floor(sqrt(value))
 * @param value the value for which to compute the square root, rounded down
 */
function sqrt(value) {
  (0, _tinyInvariant.default)(value >= ZERO, "NEGATIVE");

  // rely on built in sqrt if possible
  if (value < MAX_SAFE_INTEGER) {
    return BigInt(Math.floor(Math.sqrt(Number(value))));
  }
  let z;
  let x;
  z = value;
  x = value / TWO + ONE;
  while (x < z) {
    z = x;
    x = (value / x + x) / TWO;
  }
  return z;
}