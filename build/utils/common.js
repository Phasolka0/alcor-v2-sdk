"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseTrade = parseTrade;
var _entities = require("../entities");
var _internalConstants = require("../internalConstants");
function parseTrade(trade) {
  // Parse Trade into api format object
  const slippage = new _entities.Percent(3, 100); // 0.3%
  const receiver = '<receiver>';
  const exactIn = trade.tradeType === _internalConstants.TradeType.EXACT_INPUT;
  const maxSent = exactIn ? trade.inputAmount : trade.maximumAmountIn(slippage);
  const minReceived = exactIn ? trade.minimumAmountOut(slippage) : trade.outputAmount;
  const tradeType = exactIn ? 'swapexactin' : 'swapexactout';
  const swaps = trade.swaps.map(_ref => {
    let {
      route,
      percent,
      inputAmount,
      outputAmount
    } = _ref;
    route = route.pools.map(p => p.id);
    const maxSent = exactIn ? inputAmount : trade.maximumAmountIn(slippage, inputAmount);
    const minReceived = exactIn ? trade.minimumAmountOut(slippage, outputAmount) : outputAmount;
    const input = inputAmount.toAsset();
    const output = outputAmount.toAsset();
    const memo = `${tradeType}#${route.join(',')}#${receiver}#${minReceived.toExtendedAsset()}#0`;
    return {
      input,
      route,
      output,
      percent,
      memo,
      maxSent: maxSent.toFixed(),
      minReceived: minReceived.toFixed()
    };
  });
  const result = {
    route: [],
    memo: '',
    swaps,
    input: trade.inputAmount.toFixed(),
    output: trade.outputAmount.toFixed(),
    minReceived: minReceived.toFixed(),
    maxSent: maxSent.toFixed(),
    priceImpact: trade.priceImpact.toSignificant(2),
    executionPrice: {
      numerator: trade.executionPrice.numerator.toString(),
      denominator: trade.executionPrice.denominator.toString()
    }
  };

  // FIXME DEPRECATED Hotfix for legacy v1
  result.route = trade.swaps[0].route.pools.map(p => p.id);
  result.memo = `${tradeType}#${result.route.join(',')}#${receiver}#${minReceived.toExtendedAsset()}#0`;
  return result;
}