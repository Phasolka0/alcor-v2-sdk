"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nearestUsableTick = nearestUsableTick;
var _tinyInvariant = _interopRequireDefault(require("tiny-invariant"));
var _tickMath = require("./tickMath");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Returns the closest tick that is nearest a given tick and usable for the given tick spacing
 * @param tick the target tick
 * @param tickSpacing the spacing of the pool
 */
function nearestUsableTick(tick, tickSpacing) {
  (0, _tinyInvariant.default)(Number.isInteger(tick) && Number.isInteger(tickSpacing), "INTEGERS");
  (0, _tinyInvariant.default)(tickSpacing > 0, "TICK_SPACING");
  (0, _tinyInvariant.default)(tick >= _tickMath.TickMath.MIN_TICK && tick <= _tickMath.TickMath.MAX_TICK, "TICK_BOUND");
  const rounded = Math.round(tick / tickSpacing) * tickSpacing;
  if (rounded < _tickMath.TickMath.MIN_TICK) return rounded + tickSpacing;else if (rounded > _tickMath.TickMath.MAX_TICK) return rounded - tickSpacing;else return rounded;
}