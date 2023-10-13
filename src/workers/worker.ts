import {Trade} from "../entities";
import {expose} from "threads";


function fromRoute(options: any) {
    return Trade.fromRoute(options.route, options.currencyAmountIn, options.tradeType)
}



export const WorkerExpose = {
    fromRoute
}
expose(WorkerExpose)