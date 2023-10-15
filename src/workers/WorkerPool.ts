import {spawn, Worker} from 'threads';
import {CurrencyAmount, Pool, Route} from "../entities";
import msgpack from "msgpack-lite";

const threadsCount = 16

export class SmartWorker {
    id: number
    workerInstance: any

    workTimeHistory: Array<number>
    endWorkTime: number

    //hashStorage: Set<string> = new Set()
    idToHash: Map<number, string> = new Map()

    constructor(id: number, workerInstance: any,) {
        this.id = id;
        this.workerInstance = workerInstance;
        this.workTimeHistory = []
        this.endWorkTime = 0
    }

    static async create(id: number, workerScript: string) {
        const workerInstance = await spawn(new Worker(workerScript));
        return new SmartWorker(id, workerInstance);
    }

    hasThisPoolCached(pool: Pool) {
        const {bufferHash, id} = pool
        if (this.idToHash.has(id)) {
            const workerBufferHash = this.idToHash.get(id)
            return workerBufferHash === bufferHash
        }
        return false
    }

    addBufferHash(pool: Pool) {
        const {bufferHash, id} = pool
        //this.hashStorage.add(bufferHash)
        if (bufferHash) {
            this.idToHash.set(id, bufferHash)
        } else {
            throw new Error('The pool has no hash!')
        }

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

    // addTaskBuffer(taskOptions: Buffer) {
    //     this.tokenToTasks.set(this.tokenToTasks.size, taskOptions);
    // }
    addTaskJSON(taskOptions: any) {
        this.tokenToTasks.set(this.tokenToTasks.size, taskOptions);
    }

    async updatePools(pools: Pool[]) {
        const startTime = Date.now()
        const allPoolsBuffer = msgpack.encode(pools.map(pool => Pool.toBuffer(pool)))
        await Promise.all(this.workers.map(async worker => {
            await worker.workerInstance.loadPools(allPoolsBuffer)
        }))
        console.log('Workers pools updated for', Date.now() - startTime)
    }

    async waitForWorkersAndReturnResult() {
        this.tokenToResults = new Map()
        await Promise.all(this.workers.map(async worker => {
            await this.workerLoop(worker)
        }))
        return this.tokenToResults
    }

    async workerLoop(worker: SmartWorker) {
        while (this.tokenToTasks.size !== 0) {
            const tasksPerWorker = Math.max(1, Math.min(Math.floor(this.tokenToTasks.size / this.workers.length), 50));


            const tokens = Array.from(this.tokenToTasks.keys()).slice(0, tasksPerWorker);
            const tasksForThisWorker: any = [];

            for (const token of tokens) {
                const taskOptions = this.tokenToTasks.get(token);
                if (taskOptions) {
                    tasksForThisWorker.push(taskOptions);
                    this.tokenToTasks.delete(token);
                }
            }

            //console.log(taskOptions)
            //let result
            // if (Buffer.isBuffer(taskOptions)) {
            //     result = await worker.workerInstance.fromRoute(taskOptions)
            // } else {
            const tasks: Buffer[] = []
            for (const task of tasksForThisWorker) {
                const pools: any[] = []
                for (let pool of task.route.pools) {
                    if (worker.hasThisPoolCached(pool)) {
                        //console.log('hasThisPoolCached', pool.id)
                        pool = pool.id
                    } else {
                        const buffer = Pool.toBuffer(pool)
                        const bufferHash = pool.bufferHash
                        worker.addBufferHash(pool)
                        pool = {buffer, bufferHash}
                    }
                    pools.push(pool)
                }

                task.route = Route.toBufferAdvanced(task.route, pools)
                tasks.push(msgpack.encode(task))
            }
            const results: Buffer = await worker.workerInstance.fromRouteBulk(tasks)
            console.log(results)
            const resultsArray = msgpack.decode(results)
            let i = 0
            for (const result of resultsArray) {
                const {inputAmount, outputAmount} = msgpack.decode(result)
                if (result) {
                    this.tokenToResults.set(tokens[i], {
                        inputAmount: CurrencyAmount.fromBuffer(inputAmount),
                        outputAmount: CurrencyAmount.fromBuffer(outputAmount)
                    })
                }
                i++
            }

        }
    }
}
