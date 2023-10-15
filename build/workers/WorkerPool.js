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
                        }
                        else {
                            const buffer = entities_1.Pool.toBuffer(pool);
                            worker.addBufferHash(pool);
                            return buffer;
                        }
                    });
                    return msgpack_lite_1.default.encode(Object.assign(Object.assign({}, task), { route: entities_1.Route.toBufferAdvanced(task.route, pools) }));
                });
                const tasksBuffer = msgpack_lite_1.default.encode(tasks);
                const resultsBuffer = yield worker.workerInstance.fromRouteBulk(tasksBuffer);
                const resultsArray = msgpack_lite_1.default.decode(resultsBuffer);
                for (let i = 0; i < resultsArray.length; i++) {
                    const { inputAmount, outputAmount } = msgpack_lite_1.default.decode(resultsArray[i]);
                    if (resultsArray[i]) {
                        this.tokenToResults.set(tokens[i], {
                            inputAmount: entities_1.CurrencyAmount.fromBuffer(inputAmount),
                            outputAmount: entities_1.CurrencyAmount.fromBuffer(outputAmount)
                        });
                    }
                }
            }
        });
    }
}
exports.WorkerPool = WorkerPool;
