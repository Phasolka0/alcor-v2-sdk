import {CurrencyAmount, Pool, Route, Trade} from "../entities";
import {expose} from "threads";
import msgpack from "msgpack-lite";
const idToPool: Map<number, Pool> = new Map()


function fromRoute(optionsBuffer: Buffer) {
      const optionsJSON = msgpack.decode(optionsBuffer);
      const route = Route.fromBuffer(optionsJSON.route);
      const amount = CurrencyAmount.fromBuffer(optionsJSON.amount);
      const tradeType = msgpack.decode(optionsJSON.tradeType);
      //console.log({route, amount, tradeType});
      const {inputAmount, outputAmount} = Trade.fromRouteForWorkers(route, amount, tradeType);
      const resultJson = {
            inputAmount: CurrencyAmount.toBuffer(inputAmount),
            outputAmount: CurrencyAmount.toBuffer(outputAmount)}
      return msgpack.encode(resultJson)
}
function loadPools(poolsBuffer: Buffer) {
      const poolsArray = msgpack.decode(poolsBuffer)
      const pools: Pool[] = poolsArray.map((poolBuffer: Buffer) => Pool.fromBuffer(poolBuffer))
      for (const pool of pools) {
            idToPool.set(pool.id, pool)
      }

}



export const WorkerExpose = {
    fromRoute,
      loadPools
}
expose(WorkerExpose)