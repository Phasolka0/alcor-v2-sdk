/// <reference types="node" />
declare function fromRoute(optionsBuffer: Buffer): Buffer;
declare function loadPools(poolsBuffer: Buffer): void;
export declare const WorkerExpose: {
    fromRoute: typeof fromRoute;
    loadPools: typeof loadPools;
};
export {};
