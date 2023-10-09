import JSBI from "jsbi";
interface FeeGrowthOutside {
    feeGrowthOutsideAX64: JSBI;
    feeGrowthOutsideBX64: JSBI;
}
export declare function subIn256(x: JSBI, y: JSBI): JSBI;
export declare function subIn128(x: JSBI, y: JSBI): JSBI;
export declare abstract class TickLibrary {
    /**
     * Cannot be constructed.
     */
    private constructor();
    static getFeeGrowthInside(feeGrowthOutsideLower: FeeGrowthOutside, feeGrowthOutsideUpper: FeeGrowthOutside, tickLower: number, tickUpper: number, tickCurrent: number, feeGrowthGlobalAX64: JSBI, feeGrowthGlobalBX64: JSBI): JSBI[];
}
export {};
