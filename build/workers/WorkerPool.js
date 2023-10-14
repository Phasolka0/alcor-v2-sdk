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
    addTaskBuffer(taskOptions) {
        this.tokenToTasks.set(this.tokenToTasks.size, taskOptions);
    }
    addTaskJSON(taskOptions) {
        this.tokenToTasks.set(this.tokenToTasks.size, taskOptions);
    }
    updatePools(pools) {
        return __awaiter(this, void 0, void 0, function* () {
            const startTime = Date.now();
            const allPoolsBuffer = msgpack_lite_1.default.encode(pools.map(pool => entities_1.Pool.toBuffer(pool)));
            yield Promise.all(this.workers.map((worker) => __awaiter(this, void 0, void 0, function* () {
                yield worker.workerInstance.loadPools(allPoolsBuffer);
            })));
            console.log('Workers pools updated for', Date.now() - startTime);
        });
    }
    waitForWorkersAndReturnResult() {
        return __awaiter(this, void 0, void 0, function* () {
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
                const token = this.tokenToTasks.keys().next().value;
                const taskOptions = this.tokenToTasks.get(token);
                if (!taskOptions)
                    break;
                this.tokenToTasks.delete(token);
                //console.log(taskOptions)
                let result;
                if (Buffer.isBuffer(taskOptions)) {
                    result = yield worker.workerInstance.fromRoute(taskOptions);
                }
                else {
                    for (let i = 0; i < taskOptions.route.pools.length; i++) {
                        const pool = taskOptions.route.pools[i];
                        if (worker.hasThisPoolCached(pool)) {
                            console.log('hasThisPoolCached', pool.id);
                            taskOptions.route.pools[i] = pool.id;
                        }
                        else {
                            const buffer = entities_1.Pool.toBuffer(pool);
                            const bufferHash = pool.bufferHash;
                            worker.addBufferHash(pool);
                            taskOptions.route.pools[i] = { buffer, bufferHash };
                        }
                    }
                    taskOptions.route = entities_1.Route.toBuffer(taskOptions.route);
                    const taskBuffer = msgpack_lite_1.default.encode(taskOptions);
                    result = yield worker.workerInstance.fromRoute(taskBuffer);
                }
                const { inputAmount, outputAmount } = msgpack_lite_1.default.decode(result);
                if (result) {
                    this.tokenToResults.set(token, {
                        inputAmount: entities_1.CurrencyAmount.fromBuffer(inputAmount),
                        outputAmount: entities_1.CurrencyAmount.fromBuffer(outputAmount)
                    });
                }
            }
        });
    }
}
exports.WorkerPool = WorkerPool;
