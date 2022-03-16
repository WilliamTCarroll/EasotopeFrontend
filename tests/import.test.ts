import { loadSampleFile } from "./common";
import assert from "assert/strict";
import { readFile, writeFile } from "fs/promises";

/* 
    This test is primarily for the basic import.
*/
const BASIC_PATH = "./tests/import/";

describe("Basic Test", () => {

    it("Load and Ensure JSON matches", async () => {
        // Begin loading the expected and load all the input sheets
        let expPromise = readFile(`${BASIC_PATH}exp.json`, "utf-8");
        // Ensure that a differing format of input won't trip us up
        const sheets = await Promise.all(([
            `${BASIC_PATH}inp.xlsx`,
            `${BASIC_PATH}inp.ods`,
            `${BASIC_PATH}inp.xls`,
        ]
            .map(loadSampleFile)
        ));
        const exp = await expPromise;

        const errs = [];
        for (const sheet of sheets) {
            // Ensure that line breaks won't trip us up
            const json = JSON.stringify(sheet.samples, null, 4).replace("\r\n", "\n");
            if (exp !== json) {
                errs.push(writeFile(`${BASIC_PATH}${sheet.base}.out.json`, json));
            }
        }
        // Save all output files
        if (errs.length > 0) {
            await Promise.all(errs);
            assert.fail("Errors with Loading.  See `*.out.json`");
        }
    })

})

