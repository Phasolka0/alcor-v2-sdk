"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.priceToClosestTick = priceToClosestTick;
exports.tickToPrice = tickToPrice;
var _price = require("../entities/fractions/price");
var _internalConstants = require("../internalConstants");
var _encodeSqrtRatioX = require("./encodeSqrtRatioX64");
var _tickMath = require("./tickMath");
/**
 * Returns a price object corresponding to the input tick and the base/quote token
 * Inputs must be tokens because the address order is used to interpret the price represented by the tick
 * @param baseToken the base token of the price
 * @param quoteToken the quote token of the price
 * @param tick the tick for which to return the price
 */
function tickToPrice(baseToken, quoteToken, tick) {
  const sqrtRatioX64 = _tickMath.TickMath.getSqrtRatioAtTick(tick);
  const ratioX128 = sqrtRatioX64 * sqrtRatioX64;
  return baseToken.sortsBefore(quoteToken) ? new _price.Price(baseToken, quoteToken, _internalConstants.Q128, ratioX128) : new _price.Price(baseToken, quoteToken, ratioX128, _internalConstants.Q128);
}

/**
 * Returns the first tick for which the given price is greater than or equal to the tick price
 * @param price for which to return the closest tick that represents a price less than or equal to the input price,
 * i.e. the price of the returned tick is less than or equal to the input price
 */
function priceToClosestTick(price) {
  const sorted = price.baseCurrency.sortsBefore(price.quoteCurrency);
  const sqrtRatioX64 = sorted ? (0, _encodeSqrtRatioX.encodeSqrtRatioX64)(price.numerator, price.denominator) : (0, _encodeSqrtRatioX.encodeSqrtRatioX64)(price.denominator, price.numerator);
  let tick = _tickMath.TickMath.getTickAtSqrtRatio(sqrtRatioX64);
  const nextTickPrice = tickToPrice(price.baseCurrency, price.quoteCurrency, tick + 1);
  if (sorted) {
    if (!price.lessThan(nextTickPrice)) {
      tick++;
    }
  } else {
    if (!price.greaterThan(nextTickPrice)) {
      tick++;
    }
  }
  return tick;
}