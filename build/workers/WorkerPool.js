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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerPool = exports.SmartWorker = void 0;
const threads_1 = require("threads");
const threadsCount = 16;
class SmartWorker {
    constructor(id, workerInstance) {
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
}
exports.SmartWorker = SmartWorker;
class WorkerPool {
    constructor() {
        this.resultsArray = [];
        this.initializedTokens = false;
        this.workers = [];
        this.tokenToTasks = new Map();
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
    addTask(taskOptions) {
        this.tokenToTasks.set(this.tokenToTasks.size, taskOptions);
    }
    waitForWorkersAndReturnResult() {
        return __awaiter(this, void 0, void 0, function* () {
            this.resultsArray = [];
            yield Promise.all(this.workers.map((worker) => __awaiter(this, void 0, void 0, function* () {
                yield this.workerLoop(worker);
            })));
            return this.resultsArray;
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
                const result = yield worker.workerInstance.fromRoute(taskOptions);
                if (result) {
                    this.resultsArray.push(result);
                }
            }
        });
    }
}
exports.WorkerPool = WorkerPool;
