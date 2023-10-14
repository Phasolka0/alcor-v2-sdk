/// <reference types="node" />
import { Trade } from "../entities";
declare function fromRoute(optionsBuffer: Buffer): Trade<import("../entities").Token, import("../entities").Token, any>;
export declare const WorkerExpose: {
    fromRoute: typeof fromRoute;
};
export {};
