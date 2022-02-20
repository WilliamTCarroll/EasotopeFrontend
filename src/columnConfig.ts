import { CellObject } from "xlsx";

/**
 * A file containing any number of Column Config entries.\
 * These denote the order, input, and optionally differing output name (if specified)
 */
export class ColumnConfig {
    entries: Entry[]

    /** Construct ColumnConfig from the given json entries */
    constructor(json: string) {
        const entries = JSON.parse(json);
        this.entries = Object.assign([], entries);
    }
    /** Get the input column name for the given entry */
    static entryFrom(entry: Entry): string {
        return typeof entry === "string" ? entry : entry.from;
    }
    /** Get the output column name for the given entry */
    static entryOut(entry: Entry): string {
        return typeof entry === "string" ? entry : entry.to;
    }
    /**
     * Attempt to find the column header in the stored entries.\
     * 
     * `column` can be a `string` or `CellObject`; the final column value is found.
     * 
     * If found, the output value is returned.\
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
}
/** An entry found in the `ColumnConfig` file */
type Entry = string | { from: string, to: string };