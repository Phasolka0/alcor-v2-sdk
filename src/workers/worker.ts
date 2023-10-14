import {CurrencyAmount, Route, Trade} from "../entities";
import {expose} from "threads";
import msgpack from "msgpack-lite";


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



export const WorkerExpose = {
    fromRoute
}
expose(WorkerExpose)