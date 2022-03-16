
/**
 *  Attemt to generate the summary formula for the given range.\
 *  An error is returned if the `formulaName` is not recognized
 */
export function formula(formulaName: string, range: string): string | Error {
    const low = formulaName.toLowerCase();
    switch (low) {
        case "average":
            return average(range);
        case "stdev": case "stddev": case "standarddeviation":
            return stdDev(range);
        case "sterr": case "stderr" || (low.startsWith("st") && low.endsWith("error")):
            return stdErr(range);
        default:
            return Error(`Unknown formula: ${formulaName}`);

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