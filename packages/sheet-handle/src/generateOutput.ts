import { Sample } from "./sample";
import { CellObject, utils, WorkBook, writeFile } from "xlsx";
import type { WritingOptions } from "xlsx";
import { ColumnConfig, SummaryCellRow, SummaryType } from "./columnConfig";

/** The name of the `Data Calculations` Sheet */
export const DATA_CALC = "Data Calculations";
/** The name of the `Summary` Sheet */
export const SUMMARY = "Summary Sheet";

export function generateOutput(
    samples: Sample[],
    colConfig: ColumnConfig
): WorkBook {
    const { arr, sum } = colConfig.fullSheetArray(samples);

    const book = utils.book_new();
    const data = utils.aoa_to_sheet(arr);
    const summary = utils.aoa_to_sheet(summaryToArr(sum, colConfig));
    utils.book_append_sheet(book, data, DATA_CALC);
    utils.book_append_sheet(book, summary, SUMMARY);

    return book;
}
/** Generate the sheet (as array of array) for the summary page */
function summaryToArr(sum: SummaryCellRow[], colConfig: ColumnConfig): any[][] {
    // Grab the headers
    const out = [];
    // Is this the first row?  If so, headers are produced
    let isFirst = true;
    const first = ["Sample Name"];
    for (const item of sum) {
        const row: CellObject[] = [{ v: item.sample, t: "s" }];
        // Collect the summary in the order of the config file
        for (const entry of colConfig.entries) {
            if (!entry.summary) continue;
            for (const key in SummaryType) {
                const summary = key as SummaryType;
                // What is the name of this report item?
                const head = ColumnConfig.entryOut(entry);
                const name = `${head}: ${summary}`;
                if (isFirst) {
                    first.push(name);
                }
                const cell = item.row[name];
                // Only generate the item if found
                if (cell) {
                    const val = utils.encode_range(cell, cell);
                    row.push({ f: `$'${DATA_CALC}'.${val}`, t: "n" });
                }
            }
        }
        out.push(row);
        isFirst = false;
    }
    out.unshift(first);

    return out;
}

/** Save the given set of Samples as the given FileName */
export function writeToFile(
    samples: Sample[],
    colConfig: ColumnConfig,
    options: WritingOptions,
    filename: string
) {
    const wb = generateOutput(samples, colConfig);
    writeFile(wb, filename, options);
}
