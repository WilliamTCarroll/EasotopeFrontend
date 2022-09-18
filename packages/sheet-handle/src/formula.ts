import { Range, utils } from "xlsx";
import { SummaryType } from "./columnConfig";
import { standardDeviation, average as avg } from "simple-statistics";

/**
 *  Generate the summary formula for the given range
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
    const rangeStr =
        typeof range == "string" ? range : utils.encode_range(range);
    return `AVERAGE(${rangeStr})`;
}
/** Standard Deviation for the given range: `=STDEV` */
export function stdDev(range: Range | string): string {
    const rangeStr =
        typeof range == "string" ? range : utils.encode_range(range);
    return `STDEV(${rangeStr})`;
}
/** Standard Error for the given range: `=STDEV/SQRT(COUNT)` */
export function stdErr(range: Range | string): string {
    const rangeStr =
        typeof range == "string" ? range : utils.encode_range(range);
    return `STDEV(${rangeStr})/SQRT(COUNT(${rangeStr}))`;
}

/** Return the formula result for the specified formula and values */
export function formulaLive(
    formula: SummaryType,
    vals: number[]
): number | Error {
    // Data is useful when checking data
    if (vals.length === 0) {
        return new Error("Dataset Empty");
    }
    switch (formula) {
        case SummaryType.Average:
            return avg(vals);
        case SummaryType.StdDev:
            return standardDeviation(vals);
        case SummaryType.StdErr:
            return standardDeviation(vals) / Math.sqrt(vals.length);
    }
}
