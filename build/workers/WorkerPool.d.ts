import { Pool } from "../entities";
export declare class SmartWorker {
    id: number;
    workerInstance: any;
    workTimeHistory: Array<number>;
    endWorkTime: number;
    idToHash: Map<number, string>;
    constructor(id: number, workerInstance: any);
    static create(id: number, workerScript: string): Promise<SmartWorker>;
    hasThisPoolCached(pool: Pool): boolean;
    addBufferHash(pool: Pool): void;
}
export declare class WorkerPool {
    tokenToResults: Map<number, any>;
    tokenToTasks: Map<number, any>;
    initializedTokens: boolean;
    workers: Array<SmartWorker>;
    constructor();
    static create(threadsCount: number): Promise<WorkerPool>;
    addTaskJSON(taskOptions: any): void;
    updatePools(pools: Pool[]): Promise<void>;
    waitForWorkersAndReturnResult(): Promise<Map<number, any>>;
    workerLoop(worker: SmartWorker): Promise<void>;
}
