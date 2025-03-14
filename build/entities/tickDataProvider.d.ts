import { Tick } from "./tick";
/**
 * Provides information about ticks
 */
export interface TickDataProvider {
    /**
     * Return information corresponding to a specific tick
     * @param tick the tick to load
     */
    getTick(tick: number): Tick;
    /**
     * Return the next tick that is initialized within a single word
     * @param tick The current tick
     * @param lte Whether the next tick should be lte the current tick
     * @param tickSpacing The tick spacing of the pool
     */
    nextInitializedTickWithinOneWord(tick: number, lte: boolean, tickSpacing: number): [number, boolean];
}
/**
 * This tick data provider does not know how to fetch any tick data. It throws whenever it is required. Useful if you
 * do not need to load tick data for your use case.
 */
export declare class NoTickDataProvider implements TickDataProvider {
    private static ERROR_MESSAGE;
    getTick(_tick: number): Tick;
    nextInitializedTickWithinOneWord(_tick: number, _lte: boolean, _tickSpacing: number): [number, boolean];
}
