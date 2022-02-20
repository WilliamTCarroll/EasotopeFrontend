import { Path } from "typescript";
import { join, basename } from "path";
import { readFile, readFileSync } from "fs-extra";
import { Sample } from "../src/sample";
import { read, WorkBook } from "xlsx";
import { ColumnConfig } from "../src/columnConfig";

export const COLUMN_CONFIG = loadConfig();

function loadConfig(): ColumnConfig {
    let cfg = readFileSync("./ColumnConfig.json", "utf-8");
    return new ColumnConfig(cfg);
}

export async function run(path: Path) {
    // Begin loading the files
    const inp_fut = loadFile(join(path, "inp.xlsx"));
    const exp_fut = loadFile(join(path, "exp.xlsx"));
    // Finish loading the files
    const inp = await inp_fut;
    const exp = await exp_fut;
    compare(inp, exp);
}
/** Load the given file */
export async function loadFile(path: string): Promise<WorkBook> {
    const buf = await readFile(path);
    return read(buf);
}
/** Load the given Sample File */
export async function loadSampleFile(path: string): Promise<SampleFile> {
    const book = await loadFile(path);
    const name = book.SheetNames.at(0) || "ERROR";
    const sheet = book.Sheets[name];
    const samples = Sample.fromSheet(sheet, COLUMN_CONFIG);
    const base = basename(path);
    return { base, samples };
}

function compare(inp: WorkBook, exp: WorkBook) {
    const sheet = inp.Sheets[0];
    const samples = Sample.fromSheet(sheet, COLUMN_CONFIG);
}

export type SampleFile = {
    base: string
    samples: Sample[]
}