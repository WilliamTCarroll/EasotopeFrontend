import assert from "assert/strict";
import { stdDev, stdErr, average, formula } from "../src/formula";
import {
    parseOneSummary,
    parseSummary,
    SummaryType,
} from "../src/columnConfig";
const { Average, StdDev, StdErr } = SummaryType;

describe("Formula Tests", () => {
    it("individual sanity checks", () => {
        // Basic test up front
        const range = { s: { c: 0, r: 0 }, e: { c: 0, r: 4 } };

        {
            let exp = "AVERAGE(A1:A5)";
            let out = average(range);
            assert.strictEqual(out, exp);
        }
        {
            let exp = "STDEV(A1:A5)";
            let out = stdDev(range);
            assert.strictEqual(out, exp);
        }
        {
            let exp = "STDEV(A1:A5)/SQRT(COUNT(A1:A5))";
            let out = stdErr(range);
            assert.strictEqual(out, exp);
        }
        // If the above worked, so will this.
        // Still, sanity checks
        {
            let exp = "STDEV(NamedRange)/SQRT(COUNT(NamedRange))";
            let out = stdErr("NamedRange");
            assert.strictEqual(out, exp);
        }
    });
    it("Search Function", () => {
        assert.strictEqual(parseOneSummary("stdErr"), StdErr);
        assert.strictEqual(parseOneSummary("StandardErr"), StdErr);
        // Ensure the multiples work
        assert.deepEqual(parseSummary(["average"]), [Average]);
        assert.deepEqual(parseSummary(["average", "StdErr"]), [
            Average,
            StdErr,
        ]);
        // Several tests here, to ensure various inputs are taken
        assert.deepEqual(parseSummary(["stDev"]), [StdDev]);
        assert.deepEqual(parseSummary(["stdDev"]), [StdDev]);
        assert.deepEqual(parseSummary(["standardDeviation"]), [StdDev]);
        // We must ensure we handle the most proper case:
        // SaRcAsMcAsE
        assert.strictEqual(parseOneSummary("StAnDaRdDeViAtIoN"), StdDev);

        assert.strictEqual(
            (parseOneSummary("RandoCardrissian") as any)["message"],
            "Unknown formula: RandoCardrissian"
        );
        assert.deepEqual(
            (parseSummary(["average", "RandoCardrissian"]) as any)["message"],
            "Unknown formula: RandoCardrissian"
        );
    });
    it("Function Enum", () => {
        const range = { s: { c: 1, r: 0 }, e: { c: 1, r: 4 } };
        {
            let exp = "AVERAGE(B1:B5)";
            let out = formula(Average, range);
            assert.strictEqual(out, exp);
        }
        {
            let exp = "STDEV(B1:B5)";
            assert.strictEqual(formula(StdDev, range), exp);
        }
        {
            let exp = "STDEV(B1:B5)/SQRT(COUNT(B1:B5))";
            let out = formula(StdErr, range);
            assert.strictEqual(out, exp);
        }
    });
});
