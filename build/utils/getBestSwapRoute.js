"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBestSwapRoute = getBestSwapRoute;
var _lodash = _interopRequireDefault(require("lodash"));
var _queue = _interopRequireDefault(require("mnemonist/queue"));
var _fixedReverseHeap = _interopRequireDefault(require("mnemonist/fixed-reverse-heap"));
var _internalConstants = require("../internalConstants");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function getBestSwapRoute(routeType, percentToQuotes, percents) {
  let swapRouteConfig = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {
    minSplits: 1,
    maxSplits: 8
  };
  const percentToSortedQuotes = _lodash.default.mapValues(percentToQuotes, routeQuotes => {
    return routeQuotes.sort((routeQuoteA, routeQuoteB) => {
      if (routeType == _internalConstants.TradeType.EXACT_INPUT) {
        return routeQuoteA.outputAmount.greaterThan(routeQuoteB.outputAmount) ? -1 : 1;
      } else {
        return routeQuoteA.inputAmount.lessThan(routeQuoteB.inputAmount) ? -1 : 1;
      }
    });
  });
  const quoteCompFn = routeType == _internalConstants.TradeType.EXACT_INPUT ? (a, b) => a.greaterThan(b) : (a, b) => a.lessThan(b);
  const sumFn = currencyAmounts => {
    let sum = currencyAmounts[0];
    for (let i = 1; i < currencyAmounts.length; i++) {
      sum = sum.add(currencyAmounts[i]);
    }
    return sum;
  };
  let bestQuote;
  let bestSwap;
  const bestSwapsPerSplit = new _fixedReverseHeap.default(Array, (a, b) => {
    return quoteCompFn(a.quote, b.quote) ? -1 : 1;
  }, 3);
  const {
    minSplits,
    maxSplits
  } = swapRouteConfig;
  if (!percentToSortedQuotes[100] || minSplits > 1) {
    console.log({
      percentToSortedQuotes: _lodash.default.mapValues(percentToSortedQuotes, p => p.length)
    }, 'Did not find a valid route without any splits. Continuing search anyway.');
  } else {
    bestQuote = percentToSortedQuotes[100][0].outputAmount;
    bestSwap = [percentToSortedQuotes[100][0]];
    for (const routeWithQuote of percentToSortedQuotes[100].slice(0, 5)) {
      bestSwapsPerSplit.push({
        quote: routeWithQuote.outputAmount,
        routes: [routeWithQuote]
      });
    }
  }
  const queue = new _queue.default();
  if (percents.length === 0) return null; // Handle empty percents array

  for (let i = percents.length - 1; i >= 0; i--) {
    const percent = percents[i];
    if (!percentToSortedQuotes[percent]) {
      console.log('continue', {
        percent
      });
      continue;
    }
    queue.enqueue({
      curRoutes: [percentToSortedQuotes[percent][0]],
      percentIndex: i,
      remainingPercent: 100 - percent,
      special: false
    });
    if (!percentToSortedQuotes[percent] || !percentToSortedQuotes[percent][1]) {
      console.log('continue2', {
        percent
      });
      continue;
    }
    queue.enqueue({
      curRoutes: [percentToSortedQuotes[percent][1]],
      percentIndex: i,
      remainingPercent: 100 - percent,
      special: true
    });
  }
  let splits = 1;
  while (queue.size > 0) {
    bestSwapsPerSplit.clear();
    let layer = queue.size;
    splits++;
    if (splits >= 3 && bestSwap && bestSwap.length < splits - 1) {
      break;
    }
    if (splits > maxSplits) {
      break;
    }
    while (layer > 0) {
      layer--;
      const {
        remainingPercent,
        curRoutes,
        percentIndex,
        special
      } = queue.dequeue();
      for (let i = percentIndex; i >= 0; i--) {
        const percentA = percents[i];
        if (percentA > remainingPercent) {
          continue;
        }
        if (!percentToSortedQuotes[percentA]) {
          continue;
        }
        const candidateRoutesA = percentToSortedQuotes[percentA];
        const routeWithQuoteA = findFirstRouteNotUsingUsedPools(curRoutes, candidateRoutesA);
        if (!routeWithQuoteA) {
          continue;
        }
        const remainingPercentNew = remainingPercent - percentA;
        const curRoutesNew = [...curRoutes, routeWithQuoteA];
        if (remainingPercentNew == 0 && splits >= minSplits) {
          const quotesNew = _lodash.default.map(curRoutesNew, r => r.outputAmount);
          const quoteNew = sumFn(quotesNew);
          bestSwapsPerSplit.push({
            quote: quoteNew,
            routes: curRoutesNew
          });
          if (!bestQuote || quoteCompFn(quoteNew, bestQuote)) {
            bestQuote = quoteNew;
            bestSwap = curRoutesNew;
          }
        } else {
          queue.enqueue({
            curRoutes: curRoutesNew,
            remainingPercent: remainingPercentNew,
            percentIndex: i,
            special
          });
        }
      }
    }
  }
  if (!bestSwap) {
    console.log(`Could not find a valid swap`);
    return null;
  }
  const quote = sumFn(_lodash.default.map(bestSwap, routeWithValidQuote => routeWithValidQuote.outputAmount));
  const routeWithQuotes = bestSwap.sort((routeAmountA, routeAmountB) => routeAmountB.outputAmount.greaterThan(routeAmountA.outputAmount) ? 1 : -1);
  return routeWithQuotes;
}
const findFirstRouteNotUsingUsedPools = (usedRoutes, candidateRoutes) => {
  const usedPools = new Set();
  usedRoutes.forEach(r => r.route.pools.forEach(pool => usedPools.add(pool.id)));
  for (const candidate of candidateRoutes) {
    if (candidate.route.pools.every(pool => !usedPools.has(pool.id))) {
      return candidate;
    }
  }
  return null;
};