import { Trade } from "../entities";
declare function fromRoute(options: any): Trade<import("../entities").Token, import("../entities").Token, any>;
export declare const WorkerExpose: {
    fromRoute: typeof fromRoute;
};
export {};
