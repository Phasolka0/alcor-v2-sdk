import {spawn, Worker} from 'threads';
import {CurrencyAmount, Pool, Route} from "../entities";
import msgpack from "msgpack-lite";

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
        //const allPoolsBuffer = msgpack.encode(pools.map(pool => Pool.toBuffer(pool)))
        await Promise.all(this.workers.map(async worker => {
            const poolsToWorker: any[] = []
            for (const pool of pools) {
                if (!worker.hasThisPoolCached(pool)) {
                    const buffer = Pool.toBuffer(pool)
                    worker.addBufferHash(pool)
                    poolsToWorker.push(buffer)
                }
            }
            const allPoolsBuffer = msgpack.encode(poolsToWorker)
            await worker.workerInstance.loadPools(allPoolsBuffer)

            //const sizeMB = allPoolsBuffer.length / 1024 / 1024;
            //console.log(`Send`, sizeMB);

        }))
        console.log('Workers pools updated for', Date.now() - startTime)
    }

    async waitForWorkersAndReturnResult() {
        //console.log('tasks:', this.tokenToTasks.size)
        this.tokenToResults = new Map()
        await Promise.all(this.workers.map(async worker => {
            await this.workerLoop(worker)
        }))
        return this.tokenToResults
    }

    async workerLoop(worker) {
        while (this.tokenToTasks.size > 0) {
            const tasksPerWorker = Math.max(1, Math.min(Math.floor(this.tokenToTasks.size / this.workers.length), 50));

            const tokens = Array.from(this.tokenToTasks.keys()).slice(0, tasksPerWorker);
            const tasksForThisWorker = new Array(tasksPerWorker);

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                const taskOptions = this.tokenToTasks.get(token);
                if (taskOptions) {
                    tasksForThisWorker[i] = taskOptions;
                    this.tokenToTasks.delete(token);
                }
            }

            const tasks = tasksForThisWorker.map(task => {
                const pools = task.route.pools.map(pool => {
                    if (worker.hasThisPoolCached(pool)) {
                        return pool.id;
                    } else {
                        const buffer = Pool.toBuffer(pool);
                        worker.addBufferHash(pool);
                        return buffer;
                    }
                });

                return msgpack.encode({...task, route: Route.toBufferAdvanced(task.route, pools)});
            });

            //const tasksBuffer = msgpack.encode(tasks);
            const resultsBuffer = await worker.workerInstance.fromRouteBulk(tasks);
            const resultsArray = msgpack.decode(resultsBuffer);

            for (let i = 0; i < resultsArray.length; i++) {
                if (!resultsArray[i]) continue
                const {inputAmount, outputAmount} = msgpack.decode(resultsArray[i]);
                if (resultsArray[i]) {
                    this.tokenToResults.set(tokens[i], {
                        inputAmount: CurrencyAmount.fromBuffer(inputAmount),
                        outputAmount: CurrencyAmount.fromBuffer(outputAmount)
                    });
                }
            }
        }
    }

}
