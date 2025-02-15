"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkerPool = exports.SmartWorker = void 0;
var _threads = require("threads");
var _entities = require("../entities");
var _msgpackLite = _interopRequireDefault(require("msgpack-lite"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let SmartWorker = exports.SmartWorker = /*#__PURE__*/function () {
  function SmartWorker(id, workerInstance) {
    _classCallCheck(this, SmartWorker);
    _defineProperty(this, "id", void 0);
    _defineProperty(this, "workerInstance", void 0);
    _defineProperty(this, "workTimeHistory", void 0);
    _defineProperty(this, "endWorkTime", void 0);
    //hashStorage: Set<string> = new Set()
    _defineProperty(this, "idToHash", new Map());
    this.id = id;
    this.workerInstance = workerInstance;
    this.workTimeHistory = [];
    this.endWorkTime = 0;
  }
  return _createClass(SmartWorker, [{
    key: "hasThisPoolCached",
    value: function hasThisPoolCached(pool) {
      const {
        bufferHash,
        id
      } = pool;
      if (this.idToHash.has(id)) {
        const workerBufferHash = this.idToHash.get(id);
        return workerBufferHash === bufferHash;
      }
      return false;
    }
  }, {
    key: "addBufferHash",
    value: function addBufferHash(pool) {
      const {
        bufferHash,
        id
      } = pool;
      //this.hashStorage.add(bufferHash)
      if (bufferHash) {
        this.idToHash.set(id, bufferHash);
      } else {
        throw new Error('The pool has no hash!');
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
  }], [{
    key: "create",
    value: async function create(id, workerScript) {
      const workerInstance = await (0, _threads.spawn)(new _threads.Worker(workerScript));
      return new SmartWorker(id, workerInstance);
    }
  }]);
}();
let WorkerPool = exports.WorkerPool = /*#__PURE__*/function () {
  function WorkerPool() {
    _classCallCheck(this, WorkerPool);
    _defineProperty(this, "tokenToResults", new Map());
    _defineProperty(this, "tokenToTasks", new Map());
    _defineProperty(this, "initializedTokens", false);
    _defineProperty(this, "workers", []);
    this.initializedTokens = false;
  }
  return _createClass(WorkerPool, [{
    key: "addTaskJSON",
    value:
    // addTaskBuffer(taskOptions: Buffer) {
    //     this.tokenToTasks.set(this.tokenToTasks.size, taskOptions);
    // }
    function addTaskJSON(taskOptions) {
      this.tokenToTasks.set(this.tokenToTasks.size, taskOptions);
    }
  }, {
    key: "updatePools",
    value: async function updatePools(pools) {
      const startTime = Date.now();
      //const allPoolsBuffer = msgpack.encode(pools.map(pool => Pool.toBuffer(pool)))
      await Promise.all(this.workers.map(async worker => {
        const poolsToWorker = [];
        for (const pool of pools) {
          if (!worker.hasThisPoolCached(pool)) {
            const buffer = _entities.Pool.toBuffer(pool);
            worker.addBufferHash(pool);
            poolsToWorker.push(buffer);
          }
        }
        const allPoolsBuffer = _msgpackLite.default.encode(poolsToWorker);
        await worker.workerInstance.loadPools(allPoolsBuffer);

        //const sizeMB = allPoolsBuffer.length / 1024 / 1024;
        //console.log(`Send`, sizeMB);
      }));
      console.log('Workers pools updated for', Date.now() - startTime);
    }
  }, {
    key: "waitForWorkersAndReturnResult",
    value: async function waitForWorkersAndReturnResult() {
      //console.log('tasks:', this.tokenToTasks.size)
      this.tokenToResults = new Map();
      await Promise.all(this.workers.map(async worker => {
        await this.workerLoop(worker);
      }));
      return this.tokenToResults;
    }
  }, {
    key: "workerLoop",
    value: async function workerLoop(worker) {
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
              const buffer = _entities.Pool.toBuffer(pool);
              worker.addBufferHash(pool);
              return buffer;
            }
          });
          return _msgpackLite.default.encode(_objectSpread(_objectSpread({}, task), {}, {
            route: _entities.Route.toBufferAdvanced(task.route, pools)
          }));
        });
        const tasksBuffer = _msgpackLite.default.encode(tasks);
        const resultsBuffer = await worker.workerInstance.fromRouteBulk(tasksBuffer);
        const resultsArray = _msgpackLite.default.decode(resultsBuffer);
        for (let i = 0; i < resultsArray.length; i++) {
          if (!resultsArray[i]) continue;
          const {
            inputAmount,
            outputAmount
          } = _msgpackLite.default.decode(resultsArray[i]);
          if (resultsArray[i]) {
            this.tokenToResults.set(tokens[i], {
              inputAmount: _entities.CurrencyAmount.fromBuffer(inputAmount),
              outputAmount: _entities.CurrencyAmount.fromBuffer(outputAmount)
            });
          }
        }
      }
    }
  }], [{
    key: "create",
    value: async function create(threadsCount) {
      const instance = new WorkerPool();
      const promises = Array.from({
        length: threadsCount
      }, (_, id) => SmartWorker.create(id, './worker.js'));
      instance.workers = await Promise.all(promises);
      return instance;
    }
  }]);
}();