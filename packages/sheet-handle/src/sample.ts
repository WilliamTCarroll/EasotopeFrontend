import { CellObject, Range, utils, WorkSheet, read } from "xlsx";
import { ColumnConfig } from "./columnConfig";

/**
 * A `Sample` contains any number of `Replicate`.\
 * @see {@link Replicate}
 */
export class Sample {
    [key: string]: any;
    replicates: Replicate[] = [];
    /** Attempt to parse the given blob as a WorkBook and grab the first sheet */
    public static fromBlob(blob: Blob, config: ColumnConfig): Sample[] {
        const book = read(blob);
        // Grab only the first sheet
        const sheet = book.Sheets[book.SheetNames[0]];
        return Sample.fromSheet(sheet, config);
    }
    /**
     * Attempts to load the given sheet as a list of samples
     * @param sheet Sheet to load
     * @returns A list of samples
     * @throws An error if the Range is empty
     */
    public static fromSheet(sheet: WorkSheet, config: ColumnConfig): Sample[] {
        const range_opt = sheet["!ref"];
        // Rename the first row as Replicate
        sheet["A1"] = "Replicate";
        let range: Range;
        // Ensure we have a range
        if (range_opt) {
            range = utils.decode_range(range_opt);
        } else {
            throw new Error("Sheet is not filled in");
        }
        const out = [];
        let sample: Sample | null = null;
        let replicate: Replicate | null = null;

        for (let r = range.s.r + 1; r <= range.e.r; r++) {
            const isSample = new String(sheet[`A${r + 1}`].v).startsWith("S");
            // If there is already a sample, push it to the output and reset
            if (isSample && sample) {
                out.push(sample);
                sample = new Sample();
            }
            for (let c = range.s.c; c <= range.e.c; c++) {
                const headIndex = `${utils.encode_col(c)}1`;
                const head = config.columnOutput(sheet[headIndex]);
                if (!head) {
                    continue;
                }
                const cell = utils.encode_cell({ c, r });
                const val = sheet[cell];
                if (isSample) {
                    // Ensure the sample is set
                    sample = sample || new Sample();
                    if (val && head) {
                        const outVal = getValue(val);
                        // Left as a switch, assuming that other cases are required
                        switch (head) {
                            // For Sample, the Run Date is actually the ID of said Sample (stored in "Replicate")
                            case "Run Date":
                                sample.Sample = outVal;
                                sample[head] = "";
                                break;
                            default:
                                sample[head] = outVal;
                        }
                    }
                } else {
                    // Ensure the replicate is set
                    replicate = replicate || new Replicate();
                    if (val && head) {
                        // Left as a switch, assuming that other cases are required
                        switch (head) {
                            case "Disabled":
                                // Sometimes, the `=FALSE()` resolves as `0`, or as `FALSE`
                                replicate[head] = !!val.v;
                                break;
                            default:
                                replicate[head] = getValue(val);
                        }
                    }
                }
            }

            // If the replicate is set, push it
            if (replicate) {
                if (sample) {
                    sample.replicates.push(replicate);
                    replicate = null;
                } else {
                    throw new Error(
                        `Replicate appears before Sample at row: ${r + 1}`
                    );
                }
            }
        }
        // Push the final sample
        if (sample) {
            out.push(sample);
        }
        return out;
    }
}
/**
 *  Attempt to grab the stored value in the CellObject
 *  This checks if `v` is a key on the object, and returns it if so.
 */
function getValue(inp: CellObject | any): any {
    return inp.v === undefined ? inp : inp.v;
}

/**
 * A `Replicate` is an individual set of data,
 * any number of which may be contained in a sample.
 */
export class Replicate {
    [key: string]: any;
    /** Is this Replicate disabled? */
    Disabled: boolean = false;
    /**
     *  What notes are upon this Replicate?
     *  This is required if `Disabled`
     */
    Notes: string = "";
    // TODO: More defined ones??
    /** Set whether or not this replicate is excluded */
    public setDisabled(disabled: boolean) {
        this.Disabled = disabled;
    }
}
