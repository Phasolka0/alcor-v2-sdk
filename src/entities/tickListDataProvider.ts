import { TickList } from "../utils";
import { Tick, TickConstructorArgs } from "./tick";
import { TickDataProvider } from "./tickDataProvider";

/**
 * A data provider for ticks that is backed by an in-memory array of ticks.
 */
export class TickListDataProvider implements TickDataProvider {
  public ticks: Tick[];

  constructor(ticks: (Tick | TickConstructorArgs)[], tickSpacing?: number) {
    const ticksMapped: Tick[] = ticks.map((t) =>
      t instanceof Tick ? t : new Tick(t)
    );
    if (tickSpacing) {
      TickList.validateList(ticksMapped, tickSpacing);
    }

    this.ticks = ticksMapped;
  }

  getTick(
    tick: number
  ): Tick {
    return TickList.getTick(this.ticks, tick);
  }

  nextInitializedTickWithinOneWord(
    tick: number,
    lte: boolean,
    tickSpacing: number
  ): [number, boolean] {
    return TickList.nextInitializedTickWithinOneWord(
      this.ticks,
      tick,
      lte,
      tickSpacing
    );
  }

  static serialize(ticks: Tick[]): string {
    const serializedTicks = ticks.map((tick) => Tick.serialize(tick));
    return JSON.stringify({
      ticks: serializedTicks
    });
  }

  static deserialize(ticksString: string): TickListDataProvider {
    const ticks = JSON.parse(ticksString);
    return ticks.map(Tick.deserialize);
  }
}
