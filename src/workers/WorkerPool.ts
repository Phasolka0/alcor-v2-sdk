import {spawn, Worker} from 'threads';
import {CurrencyAmount} from "../entities";
import msgpack from "msgpack-lite";
const threadsCount = 16

export class SmartWorker {
    id: number
    workerInstance: any

    workTimeHistory: Array<number>
    endWorkTime: number
    constructor(id: number, workerInstance: any, ) {
        this.id = id;
        this.workerInstance = workerInstance;
        this.workTimeHistory = []
        this.endWorkTime = 0
    }

    static async create(id: number, workerScript: string) {
        const workerInstance = await spawn(new Worker(workerScript));
        return new SmartWorker(id, workerInstance);
    }


    // endWorkerWork() {
    //     this.currentWorkType = ''
    //     this.endWorkTime = performance.now()
    // }
    //
    // endPoolWork(time: number) {
    //     this.workTimeHistory.push(time - this.endWorkTime)
    //     if (this.workTimeHistory.length > 10) {
    //         const averageTime = average(this.workTimeHistory)
    //         //console.log(this.id, averageTime)
    //         this.workTimeHistory.shift()
    //     }
    // }
    //
    // updateTaskCount() {
    //     let count = 0;
    //     for (const token of this.primaryTokens) {
    //         if (this.pool.tokenToTasks.has(token)) {
    //             count++;
    //         }
    //     }
    //     this.taskCount = count;
    // }


}

export class WorkerPool {
    tokenToResults: Map<number, any> = new Map()
    tokenToTasks: Map<number, any> = new Map()
    initializedTokens = false
    workers: Array<SmartWorker> = []
    constructor() {
        this.initializedTokens = false
    }

    static async create(threadsCount: number) {
        const instance = new WorkerPool();
        const promises = Array.from({length: threadsCount}, (_, id) =>
            SmartWorker.create(id, './worker.js'));
        instance.workers = await Promise.all(promises);
        return instance;
    }

    addTask(taskOptions: any) {
        this.tokenToTasks.set(this.tokenToTasks.size, taskOptions);
    }

    async waitForWorkersAndReturnResult() {
        this.tokenToResults = new Map()
        await Promise.all(this.workers.map(async worker => {
            this.workerLoop(worker)
            this.workerLoop(worker)
            await this.workerLoop(worker)
        }))
        return this.tokenToResults
    }

    async workerLoop(worker: SmartWorker) {
        while (this.tokenToTasks.size !== 0) {
            const token = this.tokenToTasks.keys().next().value;
            const taskOptions = this.tokenToTasks.get(token)
            if (!taskOptions) break
            this.tokenToTasks.delete(token)
            //console.log(taskOptions)
            const result = await worker.workerInstance.fromRoute(taskOptions)
            const {inputAmount, outputAmount} = msgpack.decode(result)
            if (result) {
                this.tokenToResults.set(token, {
                    inputAmount: CurrencyAmount.fromBuffer(inputAmount),
                    outputAmount: CurrencyAmount.fromBuffer(outputAmount)
                })
            }
        }
    }
}
