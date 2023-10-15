"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerPool = exports.SmartWorker = void 0;
const threads_1 = require("threads");
const entities_1 = require("../entities");
const msgpack_lite_1 = __importDefault(require("msgpack-lite"));
const threadsCount = 16;
class SmartWorker {
    constructor(id, workerInstance) {
        //hashStorage: Set<string> = new Set()
        this.idToHash = new Map();
        this.id = id;
        this.workerInstance = workerInstance;
        this.workTimeHistory = [];
        this.endWorkTime = 0;
    }
    static create(id, workerScript) {
        return __awaiter(this, void 0, void 0, function* () {
            const workerInstance = yield (0, threads_1.spawn)(new threads_1.Worker(workerScript));
            return new SmartWorker(id, workerInstance);
        });
    }
    hasThisPoolCached(pool) {
        const { bufferHash, id } = pool;
        if (this.idToHash.has(id)) {
            const workerBufferHash = this.idToHash.get(id);
            return workerBufferHash === bufferHash;
        }
        return false;
    }
    addBufferHash(pool) {
        const { bufferHash, id } = pool;
        //this.hashStorage.add(bufferHash)
        if (bufferHash) {
            this.idToHash.set(id, bufferHash);
        }
        else {
            throw new Error('The pool has no hash!');
        }
    }
}
exports.SmartWorker = SmartWorker;
class WorkerPool {
    constructor() {
        this.tokenToResults = new Map();
        this.tokenToTasks = new Map();
        this.initializedTokens = false;
        this.workers = [];
        this.initializedTokens = false;
    }
    static create(threadsCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = new WorkerPool();
            const promises = Array.from({ length: threadsCount }, (_, id) => SmartWorker.create(id, './worker.js'));
            instance.workers = yield Promise.all(promises);
            return instance;
        });
    }
    // addTaskBuffer(taskOptions: Buffer) {
    //     this.tokenToTasks.set(this.tokenToTasks.size, taskOptions);
    // }
    addTaskJSON(taskOptions) {
        this.tokenToTasks.set(this.tokenToTasks.size, taskOptions);
    }
    updatePools(pools) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            //const allPoolsBuffer = msgpack.encode(pools.map(pool => Pool.toBuffer(pool)))
            yield Promise.all(this.workers.map((worker) => __awaiter(this, void 0, void 0, function* () {
                const poolsToWorker = [];
                for (const pool of pools) {
                    if (!worker.hasThisPoolCached(pool)) {
                        const buffer = entities_1.Pool.toBuffer(pool);
                        worker.addBufferHash(pool);
                        poolsToWorker.push(buffer);
                    }
                }
                const allPoolsBuffer = msgpack_lite_1.default.encode(poolsToWorker);
                yield worker.workerInstance.loadPools(allPoolsBuffer);
                //const sizeMB = allPoolsBuffer.length / 1024 / 1024;
                //console.log(`Send`, sizeMB);
            })));
            console.log('Workers pools updated for', Date.now() - startTime);
        });
    }
    waitForWorkersAndReturnResult() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('tasks:', this.tokenToTasks.size);
            this.tokenToResults = new Map();
            yield Promise.all(this.workers.map((worker) => __awaiter(this, void 0, void 0, function* () {
                yield this.workerLoop(worker);
            })));
            return this.tokenToResults;
        });
    }
    workerLoop(worker) {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.tokenToTasks.size !== 0) {
                const tasksPerWorker = Math.max(1, Math.min(Math.floor(this.tokenToTasks.size / this.workers.length), 100));
                const tokens = Array.from(this.tokenToTasks.keys()).slice(0, tasksPerWorker);
                const tasksForThisWorker = [];
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
                const tasks = [];
                for (const task of tasksForThisWorker) {
                    const pools = [];
                    for (let pool of task.route.pools) {
                        if (worker.hasThisPoolCached(pool)) {
                            //console.log('hasThisPoolCached', pool.id)
                            pool = pool.id;
                        }
                        else {
                            const buffer = entities_1.Pool.toBuffer(pool);
                            worker.addBufferHash(pool);
                            pool = buffer;
                        }
                        pools.push(pool);
                    }
                    task.route = entities_1.Route.toBufferAdvanced(task.route, pools);
                    tasks.push(msgpack_lite_1.default.encode(task));
                }
                const tasksBuffer = msgpack_lite_1.default.encode(tasks);
                //let sizeMB = tasksBuffer.length / 1024 / 1024;
                //console.log(`Send`, sizeMB);
                const results = yield worker.workerInstance.fromRouteBulk(tasksBuffer);
                //sizeMB = results.length / 1024 / 1024;
                //console.log(`Received`, sizeMB);
                //console.log(results)
                const resultsArray = msgpack_lite_1.default.decode(results);
                let i = 0;
                for (const result of resultsArray) {
                    const { inputAmount, outputAmount } = msgpack_lite_1.default.decode(result);
                    if (result) {
                        this.tokenToResults.set(tokens[i], {
                            inputAmount: entities_1.CurrencyAmount.fromBuffer(inputAmount),
                            outputAmount: entities_1.CurrencyAmount.fromBuffer(outputAmount)
                        });
                    }
                    i++;
                }
            }
        });
    }
}
exports.WorkerPool = WorkerPool;
