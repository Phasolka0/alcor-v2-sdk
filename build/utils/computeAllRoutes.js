"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeAllRoutesFromMap = exports.computeAllRoutes = void 0;
const entities_1 = require("../entities");
function computeAllRoutes(tokenIn, tokenOut, pools, maxHops) {
    const poolsUsed = Array(pools.length).fill(false);
    const routes = [];
    const computeRoutes = (tokenIn, tokenOut, currentRoute, poolsUsed, _previousTokenOut) => {
        if (currentRoute.length > maxHops) {
            return;
        }
        if (currentRoute.length > 0 &&
            currentRoute[currentRoute.length - 1].involvesToken(tokenOut)) {
            routes.push(new entities_1.Route([...currentRoute], tokenIn, tokenOut));
            return;
        }
        for (let i = 0; i < pools.length; i++) {
            if (poolsUsed[i]) {
                continue;
            }
            const curPool = pools[i];
            const previousTokenOut = _previousTokenOut ? _previousTokenOut : tokenIn;
            if (!curPool.involvesToken(previousTokenOut)) {
                continue;
            }
            const currentTokenOut = curPool.tokenA.equals(previousTokenOut)
                ? curPool.tokenB
                : curPool.tokenA;
            currentRoute.push(curPool);
            poolsUsed[i] = true;
            computeRoutes(tokenIn, tokenOut, currentRoute, poolsUsed, currentTokenOut);
            poolsUsed[i] = false;
            currentRoute.pop();
        }
    };
    computeRoutes(tokenIn, tokenOut, [], poolsUsed);
    return routes;
}
exports.computeAllRoutes = computeAllRoutes;
function computeAllRoutesFromMap(tokenIn, tokenOut, poolMap, maxHops) {
    const routes = [];
    const computeRoutes = (tokenIn, tokenOut, currentRoute, visitedPools, _previousTokenOut) => {
        if (currentRoute.length > maxHops) {
            return;
        }
        if (currentRoute.length > 0 &&
            currentRoute[currentRoute.length - 1].involvesToken(tokenOut)) {
            routes.push(new entities_1.Route([...currentRoute], tokenIn, tokenOut));
            return;
        }
        const previousTokenOut = _previousTokenOut ? _previousTokenOut : tokenIn;
        const relevantPools = poolMap[previousTokenOut.id] || [];
        for (const curPool of relevantPools) {
            if (visitedPools.has(curPool)) {
                continue;
            }
            const currentTokenOut = curPool.tokenA.equals(previousTokenOut)
                ? curPool.tokenB
                : curPool.tokenA;
            currentRoute.push(curPool);
            visitedPools.add(curPool);
            computeRoutes(tokenIn, tokenOut, currentRoute, visitedPools, currentTokenOut);
            visitedPools.delete(curPool);
            currentRoute.pop();
        }
    };
    computeRoutes(tokenIn, tokenOut, [], new Set());
    return routes;
}
exports.computeAllRoutesFromMap = computeAllRoutesFromMap;
