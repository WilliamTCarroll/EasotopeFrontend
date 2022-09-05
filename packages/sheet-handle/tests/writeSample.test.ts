import assert from "assert/strict";
import { ColumnConfig } from "../src/columnConfig";
import { Replicate, Sample } from "../src/sample";

import { writeFile as WriteSheet } from "xlsx";
import { generateOutput } from "../src/generateOutput";

describe("Writing Sample and Replicate to Xlsx", () => {
    // A truncated list of possible entries
    // The order is messed with, to ensure the ColumnConfig controls the order
    const inp = replicate({
        "Run Date": "2018-03-05 02:31 PST",
        "Analysis Status": "OK",
        "Mass Spec": "R2D2 - NuCarb",
        "δ13C VPDB (Final)": -0.86,
        Replicate: "R1",
        "d18O VPDB (Raw)": 8.94,
        Analysis: "CO2 clumpD48",
        "Corr Interval": "2018-02-17 00:00:00 PST",
        "Sample Type": "Calcite",
        "d13C VPDB (Raw)": -0.84,
        "Easotope Name": "DH1A",
        "Acid Temp": 70,
        "d13C VPDB (Raw) SE": 0,
    });
    const disabled = new Replicate();
    Object.assign(disabled, inp);
    disabled.setDisabled(true);
    disabled["Replicate"] = "R2";
    it("Generate Replicate", () => {
        const exp = [
            ,
            "R1",
            "2018-03-05 02:31 PST",
            "CO2 clumpD48",
            "OK",
            "R2D2 - NuCarb",
            "DH1A",
            "Calcite",
            "2018-02-17 00:00:00 PST",
            70,
            -0.84, // Blank entry for 0
            ,
            -0.86, // For the "SomethingElse" field
            ,
            8.94,
        ];

        const out = colConfig.replicateArray(inp);

        assert.deepStrictEqual(out, exp);
    });
    it("Generate Full Sample", () => {
        const sample = new Sample();
        sample.replicates = [inp, disabled, inp, inp];
        sample["Replicate"] = "DH1D";
        const start = { r: 0, c: 0 };
        const out = colConfig.fullSampleArray(sample, start);
        const exp = [
            [, "DH1D"],
            [
                ,
                "R1",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
            [
                ,
                "R1",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
            [
                ,
                "R1",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
            [
                "stdErr",
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                { t: "n", f: "STDEV(K1:K3)/SQRT(COUNT(K1:K3))" },
                ,
                ,
                ,
                { t: "n", f: "STDEV(O1:O3)/SQRT(COUNT(O1:O3))" },
            ],
            ["average", , , , , , , , , , , , { t: "n", f: "AVERAGE(M1:M3)" }],
            ["stdDev", , , , , , , , , , , , { t: "n", f: "STDEV(M1:M3)" }],
            ["Disabled Replicates Below"],
            [
                ,
                "R2",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
        ];
        assert.deepStrictEqual(out, exp);
    });
    it("Generate Group of Samples", () => {
        const s1 = new Sample();
        s1.replicates = [inp, disabled, inp, inp];
        s1["Replicate"] = "DH1D";
        const s2 = new Sample();
        s2.replicates = [disabled, inp, inp];
        s2["Replicate"] = "DH2D";
        const s3 = new Sample();
        s3.replicates = [inp, inp];
        s3["Replicate"] = "DH3D";
        const exp = [
            [
                "Notes/Issues",
                "Replicate",
                "Run Date",
                "Analysis",
                "Analysis Status",
                "Mass Spec",
                "Easotope Name",
                "Sample Type",
                "Corr Interval",
                "Acid Temp",
                "d13C VPDB (Raw)",
                "d13C VPDB (Raw) SE",
                "δ13C VPDB (Final)",
                "SomethingElse",
                "d18O VPDB (Raw)",
            ],
            [],
            [, "DH1D"],
            [
                ,
                "R1",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
            [
                ,
                "R1",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
            [
                ,
                "R1",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
            [
                "stdErr",
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                { t: "n", f: "STDEV(K4:K6)/SQRT(COUNT(K4:K6))" },
                ,
                ,
                ,
                { t: "n", f: "STDEV(O4:O6)/SQRT(COUNT(O4:O6))" },
            ],
            ["average", , , , , , , , , , , , { t: "n", f: "AVERAGE(M4:M6)" }],
            ["stdDev", , , , , , , , , , , , { t: "n", f: "STDEV(M4:M6)" }],
            ["Disabled Replicates Below"],
            [
                ,
                "R2",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
            [],
            [, "DH2D"],
            [
                ,
                "R1",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
            [
                ,
                "R1",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
            [
                "stdErr",
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                { t: "n", f: "STDEV(K14:K15)/SQRT(COUNT(K14:K15))" },
                ,
                ,
                ,
                { t: "n", f: "STDEV(O14:O15)/SQRT(COUNT(O14:O15))" },
            ],
            [
                "average",
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                { t: "n", f: "AVERAGE(M14:M15)" },
            ],
            ["stdDev", , , , , , , , , , , , { t: "n", f: "STDEV(M14:M15)" }],
            ["Disabled Replicates Below"],
            [
                ,
                "R2",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
            [],
            [, "DH3D"],
            [
                ,
                "R1",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
            [
                ,
                "R1",
                "2018-03-05 02:31 PST",
                "CO2 clumpD48",
                "OK",
                "R2D2 - NuCarb",
                "DH1A",
                "Calcite",
                "2018-02-17 00:00:00 PST",
                70,
                -0.84,
                ,
                -0.86,
                ,
                8.94,
            ],
            [
                "stdErr",
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                { t: "n", f: "STDEV(K23:K24)/SQRT(COUNT(K23:K24))" },
                ,
                ,
                ,
                { t: "n", f: "STDEV(O23:O24)/SQRT(COUNT(O23:O24))" },
            ],
            [
                "average",
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                ,
                { t: "n", f: "AVERAGE(M23:M24)" },
            ],
            ["stdDev", , , , , , , , , , , , { t: "n", f: "STDEV(M23:M24)" }],
        ];
        const samples = [s1, s2, s3];
        const out = colConfig.fullSheetArray(samples);
        {
            const book = generateOutput(samples, colConfig);
            // TODO: Add full test on output (including extra sheets with constants

            WriteSheet(book, "./tests/Generate.out.ods");
        }
        assert.deepStrictEqual(out, exp);

        // const json = JSON.stringify(out);
    });
});

const entries = [
    "Notes/Issues",
    "Replicate",
    {
        from: "ID",
        to: "Run Date",
    },
    "Analysis",
    "Analysis Status",
    "Mass Spec",
    "Easotope Name",
    "Sample Type",
    "Corr Interval",
    "Acid Temp",
    {
        from: "d13C VPDB (Raw)",
        summary: ["stdErr"],
    },
    "d13C VPDB (Raw) SE",
    {
        from: "d13C VPDB (Final)",
        to: "δ13C VPDB (Final)",
        summary: ["average", "stdDev"],
    },
    "SomethingElse",
    {
        from: "d18O VPDB (Raw)",
        summary: ["stdErr"],
    },
];

function replicate(inp: any): Replicate {
    const out = new Replicate();
    Object.assign(out, inp);
    return out;
}

const colConfig = new ColumnConfig(entries);
