/// <reference types="node" />
declare function fromRoute(optionsBuffer: Buffer): Buffer | undefined;
declare function fromRouteBulk(buffer: Buffer): Buffer;
declare function loadPools(poolsBuffer: Buffer): void;
export declare const WorkerExpose: {
    fromRoute: typeof fromRoute;
    fromRouteBulk: typeof fromRouteBulk;
    loadPools: typeof loadPools;
};
export {};
