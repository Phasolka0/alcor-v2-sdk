import { Tick, TickConstructorArgs } from "./tick";
import { TickDataProvider } from "./tickDataProvider";
/**
 * A data provider for ticks that is backed by an in-memory array of ticks.
 */
export declare class TickListDataProvider implements TickDataProvider {
    private ticks;
    constructor(ticks: (Tick | TickConstructorArgs)[], tickSpacing: number);
    getTick(tick: number): Tick;
    nextInitializedTickWithinOneWord(tick: number, lte: boolean, tickSpacing: number): [number, boolean];
}
