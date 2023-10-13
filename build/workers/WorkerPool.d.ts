export declare class SmartWorker {
    id: number;
    workerInstance: any;
    workTimeHistory: Array<number>;
    endWorkTime: number;
    constructor(id: number, workerInstance: any);
    static create(id: number, workerScript: string): Promise<SmartWorker>;
}
export declare class WorkerPool {
    resultsArray: Array<any>;
    tokenToTasks: Map<number, any>;
    initializedTokens: boolean;
    workers: Array<SmartWorker>;
    constructor();
    static create(threadsCount: number): Promise<WorkerPool>;
    addTask(taskOptions: any): void;
    waitForWorkersAndReturnResult(): Promise<any[]>;
    workerLoop(worker: SmartWorker): Promise<void>;
}
