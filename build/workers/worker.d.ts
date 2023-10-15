/// <reference types="node" />
declare function fromRoute(optionsBuffer: Buffer): Buffer | null | undefined;
declare function fromRouteBulk(tasksArray: any[]): Buffer;
declare function loadPools(poolsBuffer: Buffer): void;
export declare const WorkerExpose: {
    fromRoute: typeof fromRoute;
    fromRouteBulk: typeof fromRouteBulk;
    loadPools: typeof loadPools;
};
export {};
