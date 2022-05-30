import { CellAddress, CellObject, Range, WorkSheet, utils, } from "xlsx";
import { formula } from "./formula";
import { Replicate, Sample } from "./sample";

/**
 * A file containing any number of Column Config entries.\
 * These denote the order, input, and optionally differing output name (if specified)
 */
export class ColumnConfig {
    entries: Entry[]

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
                return summary
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
    public columnOutput(column: string | CellObject | undefined): string | null {
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
    public fullSheetArray(samples: Sample[]): any[][] {
        const header: string[] = [];
        for (const entry of this.entries) {
            header.push(ColumnConfig.entryOut(entry));
        }
        const out: any[][] = [header];
        // Generate each sample
        for (const sample of samples) {
            // Place a blank line between each Sample
            out.push([]);
            const addr = { c: 0, r: out.length + 1 };
            const lines = this.fullSampleArray(sample, addr);
            out.push(...lines);
        }
        return out;
    }
    /**
     *  Generate the array for the sample at the start address.\
     *  All stored Replicates are written, as well.
     */
    public fullSampleArray(sample: Sample, start: CellAddress): any[][] {
        const header: any[] = [];
        this.entries.forEach((entry, c) => {
            const val = sample[ColumnConfig.entryOut(entry)];
            if (!!val) { header[c] = val; }
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
        const calcs: { [key: string]: any[] } = {};
        this.entries.forEach((entry, c) => {

            if (entry.summary) {
                for (const s of entry.summary) {
                    // Ensure we have anything at all in the array
                    // First entry is the title of this summary
                    calcs[s] = calcs[s] || [s];
                    const range: Range = {
                        s: { c, r: start.r },
                        e: { c, r: lastRow }
                    };
                    const val = formula(s, range)

                    calcs[s][c] = { f: val, t: "n" };
                }
            }
        })
        // Add a note regarding the disabled replicates
        if (disabled.length > 0) {
            disabled.unshift(["Disabled Replicates Below"]);
        }
        for (const key in calcs) {
            enabled.push(calcs[key]);
        }

        const out = [header, ...enabled, ...disabled]

        return out
    }
    /** Generate the array of Excel values for this replicate */
    public replicateArray(replicate: Replicate): any[] {

        const out: any[] = [];
        this.entries.forEach((entry, c) => {
            const val = replicate[ColumnConfig.entryOut(entry)];
            // TODO: ADD MANUAL CALCULATION
            if (!!val) { out[c] = val; }
        });

        return out;
    }
}
/** An entry found in the `ColumnConfig` file */
type Entry = { from: string, to: string | undefined, summary: SummaryType[] | undefined };
/** The kinds of Summary that could possibly be done for this field */
export enum SummaryType {
    Average = "average",
    StdDev = "stdDev",
    StdErr = "stdErr"
}
/** 
 * Attempt to parse a list of summaries from the given array
 * The first one to fail will return an error
 */
export function parseSummary(inp: string[]): SummaryType[] | Error | undefined {
    // If this is blank, it's clearly NOT anything to worry about
    if (!inp) { return undefined; }
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
    if (!inp) { return undefined; }
    // Replace the various longer options with abbreviations (simpler switch)
    const low = inp.toLowerCase()
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