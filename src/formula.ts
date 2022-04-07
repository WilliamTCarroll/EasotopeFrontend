import { SummaryType } from "./columnConfig";

/**
 *  Attemt to generate the summary formula for the given range.\
 *  An error is returned if the `formulaName` is not recognized
 */
export function formula(formula: SummaryType, range: string): string {

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
export function average(range: string): string {
    return `=AVERAGE(${range})`;
}
/** Standard Deviation for the given range: `=STDEV` */
export function stdDev(range: string): string {
    return `=STDEV(${range})`;
}
/** Standard Error for the given range: `=STDEV/SQRT(COUNT)` */
export function stdErr(range: string): string {
    return `=STDEV(${range})/SQRT(COUNT(${range}))`;
}
