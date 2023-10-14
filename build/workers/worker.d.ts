/// <reference types="node" />
declare function fromRoute(optionsBuffer: Buffer): Buffer | undefined;
declare function loadPools(poolsBuffer: Buffer): void;
export declare const WorkerExpose: {
    fromRoute: typeof fromRoute;
    loadPools: typeof loadPools;
};
export {};
