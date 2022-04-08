import { Range, utils } from "xlsx";
import { SummaryType } from "./columnConfig";

/**
 *  Attemt to generate the summary formula for the given range.\
 *  An error is returned if the `formulaName` is not recognized
 */
export function formula(formula: SummaryType, range: Range | string): string {

    switch (formula) {
        case SummaryType.Average:
            return average(range);
        case SummaryType.StdDev:
            return stdDev(range);
        case SummaryType.StdErr:
            return stdErr(range);
    }
}
/** Average for the given range: `=AVERAGE` */
export function average(range: Range | string): string {
    const rangeStr = typeof range == "string" ? range : utils.encode_range(range);
    return `=AVERAGE(${rangeStr})`;
}
/** Standard Deviation for the given range: `=STDEV` */
export function stdDev(range: Range | string): string {
    const rangeStr = typeof range == "string" ? range : utils.encode_range(range);
    return `=STDEV(${rangeStr})`;
}
/** Standard Error for the given range: `=STDEV/SQRT(COUNT)` */
export function stdErr(range: Range | string): string {
    const rangeStr = typeof range == "string" ? range : utils.encode_range(range);
    return `=STDEV(${rangeStr})/SQRT(COUNT(${rangeStr}))`;
}
