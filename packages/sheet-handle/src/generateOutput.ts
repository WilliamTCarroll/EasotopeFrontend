import { Sample } from "./sample";
import { utils, WorkBook, write, writeFile } from "xlsx";
import type { WritingOptions } from "xlsx";
import { ColumnConfig } from "./columnConfig";

export function generateOutput(
    samples: Sample[],
    colConfig: ColumnConfig
): WorkBook {
    const out = colConfig.fullSheetArray(samples);

    const book = utils.book_new();
    const sheet = utils.aoa_to_sheet(out);

    utils.book_append_sheet(book, sheet);
    return book;
}

export function writeToFile(
    samples: Sample[],
    colConfig: ColumnConfig,
    options: WritingOptions,
    filename: string
) {
    const wb = generateOutput(samples, colConfig);
    writeFile(wb, filename, options);
}
