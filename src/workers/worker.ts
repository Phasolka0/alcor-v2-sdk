import {CurrencyAmount, Pool, Route, Trade} from "../entities";
import {expose} from "threads";
import msgpack from "msgpack-lite";

function fromRoute(optionsBuffer: Buffer) {
    try {
        const optionsJSON = msgpack.decode(optionsBuffer);
        const route = Route.fromBuffer(optionsJSON.route);
        const amount = CurrencyAmount.fromBuffer(optionsJSON.amount);
        const tradeType = msgpack.decode(optionsJSON.tradeType);
        //console.log({route, amount, tradeType});


        const {inputAmount, outputAmount} = Trade.fromRouteForWorkers(route, amount, tradeType);
        const resultJson = {
            inputAmount: CurrencyAmount.toBuffer(inputAmount),
            outputAmount: CurrencyAmount.toBuffer(outputAmount)
        }
        return msgpack.encode(resultJson)
    } catch (e) {
        console.log(e)
    }
}

function fromRouteBulk(optinsBulk: Buffer[]) {
    const results: any = []
    for (const optionsBuffer of optinsBulk) {
        results.push(fromRoute(optionsBuffer))
    }
    const resultsBuffer = msgpack.encode(results)
    return resultsBuffer
}

function loadPools(poolsBuffer: Buffer) {
    const poolsArray = msgpack.decode(poolsBuffer)
    const pools: Pool[] = poolsArray.map((poolBuffer: Buffer) => {

        return Pool.fromBuffer(poolBuffer)
    })
    for (const pool of pools) {
        Pool.idToPoolMap.set(pool.id, pool)
    }
}


export const WorkerExpose = {
    fromRoute,
    fromRouteBulk,
    loadPools
}
expose(WorkerExpose)