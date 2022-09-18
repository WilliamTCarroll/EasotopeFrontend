import { CellAddress, CellObject, Range, WorkSheet, utils } from "xlsx";
import { formula } from "./formula";
import { Replicate, Sample } from "./sample";
// Loadin Defaults
import { config } from "./defaultColumnConfig";

/**
 * A file containing any number of Column Config entries.\
 * These denote the order, input, and optionally differing output name (if specified)
 */
export class ColumnConfig {
    entries: Entry[];

    /**
     *  Construct ColumnConfig from the given json entries
     *  @throws If any of the ColumnConfig entries are invalid
     */
    constructor(entries: any[]) {
        const errs = [];
        this.entries = [];
        for (const entry of entries) {
            const out = ColumnConfig.parseEntry(entry);
            if (out instanceof Error) {
                errs.push(out);
            } else {
                this.entries.push(out);
            }
        }
        // Any errors should concern us
        if (errs.length > 0) {
            throw errs;
        }
    }
    public static fromJson(json: string): ColumnConfig {
        const entries = JSON.parse(json);
        return new ColumnConfig(entries);
    }
    /** Parse the config entry and returns an error on invalid summary  */
    public static parseEntry(inp: any): Entry | Error {
        const from = inp["from"];
        if (!!from) {
            const to = inp["to"];
            const sumBefore = inp["summary"];
            const summary = parseSummary(sumBefore);

            if (summary instanceof Error) {
                return summary;
            } else {
                return { from, to, summary };
            }
        } else {
            return { from: inp } as Entry;
        }
    }
    /** Get the input column name for the given entry */
    static entryFrom(entry: Entry): string {
        return typeof entry === "string" ? entry : entry.from;
    }
    /** Get the output column name for the given entry */
    static entryOut(entry: Entry): string {
        return typeof entry === "string" ? entry : entry.to || entry.from;
    }
    /**
     * Attempt to find the column header in the stored entries.
     *
     * `column` can be a `string` or `CellObject`; the final column value is found.
     *
     * If found, the output value is returned.
     * If not found, `null` is returned.
     */
    public columnOutput(
        column: string | CellObject | undefined
    ): string | null {
        let col;
        if (!column) {
            return null;
        } else if (typeof column === "string") {
            col = column;
        } else {
            col = column.v;
        }
        for (const entry of this.entries) {
            if (col === ColumnConfig.entryFrom(entry)) {
                return ColumnConfig.entryOut(entry);
            }
        }
        // Nothing found, nothing returned
        return null;
    }
    /** Write the Sample to the given sheet */
    public fullSheetArray(samples: Sample[]): {
        arr: any[][];
        sum: SummaryCellRow[];
    } {
        const header: string[] = [];
        for (const entry of this.entries) {
            header.push(ColumnConfig.entryOut(entry));
        }
        const out: any[][] = [header];
        const summaries: SummaryCellRow[] = [];
        // Generate each sample
        for (const sample of samples) {
            // Place a blank line between each Sample
            out.push([]);
            const addr = { c: 0, r: out.length + 1 };
            const lines = this.fullSampleArray(sample, addr);
            out.push(...lines.arr);
            summaries.push(lines.summary);
        }
        return { arr: out, sum: summaries };
    }
    /**
     *  Generate the array for the sample at the start address.\
     *  All stored Replicates are written, as well.
     */
    public fullSampleArray(
        sample: Sample,
        start: CellAddress
    ): { arr: any[][]; summary: SummaryCellRow } {
        const header: any[] = [];
        this.entries.forEach((entry, c) => {
            const val = sample[ColumnConfig.entryOut(entry)];
            if (!!val) {
                header[c] = val;
            }
        });
        const enabled = [];
        const disabled = [];
        for (const rep of sample.replicates) {
            const line = this.replicateArray(rep);
            if (rep.Disabled) {
                disabled.push(line);
            } else {
                enabled.push(line);
            }
        }
        // Figure up the calculations
        const lastRow = start.r + enabled.length - 1;
        const calcs: SummaryRow = {} as SummaryRow;
        this.entries.forEach((entry, c) => {
            if (entry.summary) {
                const head = ColumnConfig.entryOut(entry);
                for (const s of entry.summary) {
                    // Ensure we have anything at all in the array
                    // First entry is the title of this summary
                    calcs[s] = calcs[s] || [{ head, val: s }];
                    const range: Range = {
                        s: { c, r: start.r },
                        e: { c, r: lastRow },
                    };
                    const val = formula(s, range);

                    calcs[s][c] = {
                        head,
                        val: { f: val, t: "n" },
                    };
                }
            }
        });
        // Add a blank row and note regarding the disabled replicates
        if (disabled.length > 0) {
            disabled.unshift(["Disabled Replicates Below"]);
            disabled.unshift([]);
        }
        // First, push the summaries.
        for (const key of Object.values(SummaryType)) {
            const row = [key as any]; // Start the row with the summary type
            for (let c = 0; c < calcs[key].length; c++) {
                const val = calcs[key][c];
                // Only set this entry if we have a summary, here
                if (val) {
                    row[c] = val.val;
                }
            }

            enabled.push(row);
        }

        const summary = {
            sample: sample["Sample"] || sample["Replicate"],
            row: {},
        } as SummaryCellRow;
        // Now, collect the references for the summary sheet
        // The order is important; we go by the ColumnConfig order
        for (const entry of this.entries) {
            for (const key of entry.summary || []) {
                for (let c = 0; c < calcs[key].length; c++) {
                    const val = calcs[key][c];
                    if (val) {
                        const name = `${val.head}: ${key}`;
                        // Each summary has an offset, depending on their order
                        const r = lastRow + sumOffset(key);
                        summary.row[name] = { r, c } as CellAddress;
                    }
                }
            }
        }

        return { arr: [header, ...enabled, ...disabled], summary };
    }
    /** Generate the array of Excel values for this replicate */
    public replicateArray(replicate: Replicate): any[] {
        const out: any[] = [];
        this.entries.forEach((entry, c) => {
            const val = replicate[ColumnConfig.entryOut(entry)];
            // TODO: ADD MANUAL CALCULATION
            if (!!val) {
                out[c] = val;
            }
        });

        return out;
    }
}
/** An entry found in the `ColumnConfig` file */
type Entry = {
    from: string;
    to: string | undefined;
    summary: SummaryType[] | undefined;
};
/** The kinds of Summary that could possibly be done for this field */
export enum SummaryType {
    Average = "average",
    StdDev = "stdDev",
    StdErr = "stdErr",
}
/** What is the row offset for the given Symmary? */
function sumOffset(sum: SummaryType): number {
    switch (sum) {
        case SummaryType.Average:
            return 1;
        case SummaryType.StdDev:
            return 2;
        case SummaryType.StdErr:
            return 3;
    }
}
/**
 * Attempt to parse a list of summaries from the given array
 * The first one to fail will return an error
 */
export function parseSummary(inp: string[]): SummaryType[] | Error | undefined {
    // If this is blank, it's clearly NOT anything to worry about
    if (!inp) {
        return undefined;
    }
    const out = [];
    for (const entry of inp) {
        const res = parseOneSummary(entry);
        if (res !== undefined) {
            if (res instanceof Error) {
                return res;
            }
            out.push(res);
        }
    }
    return out;
}
/** Attempt to parse the given string as a summary */
export function parseOneSummary(inp: string): SummaryType | Error | undefined {
    if (!inp) {
        return undefined;
    }
    // Replace the various longer options with abbreviations (simpler switch)
    const low = inp
        .toLowerCase()
        .replace("standard", "std")
        .replace("error", "err")
        .replace("deviation", "dev");
    switch (low) {
        case "average":
            return SummaryType.Average;
        case "stdev":
        case "stddev":
            return SummaryType.StdDev;
        case "sterr":
        case "stderr":
            return SummaryType.StdErr;
        default:
            return Error(`Unknown formula: ${inp}`);
    }
}
/** Representation of the summary data on the Calculation Sheet */
type SummaryRow = {
    [key in SummaryType]: { head: string; val: { f: string; t: string } }[];
};
/** Representation of Summary Data on the Summary Sheet */
export type SummaryCellRow = {
    sample: string;
    row: { [key: string]: CellAddress };
};
export const defaultConfig = new ColumnConfig(config);
