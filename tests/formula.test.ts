/*eslint no-redeclare: "allow"*/
import assert from "assert/strict";
import { stdDev, stdErr, average, formula } from "../src/formula"

describe("Formula Tests", () => {

    it("individual sanity checks", () => {
        // Basic test up front
        let range = "A1:A5";
        {
            let exp = "=AVERAGE(A1:A5)"
            let out = average(range);
            assert.strictEqual(out, exp);
        }
        {
            let exp = "=STDEV(A1:A5)"
            let out = stdDev(range);
            assert.strictEqual(out, exp);
        }
        {
            let exp = "=STDEV(A1:A5)/SQRT(COUNT(A1:A5))"
            let out = stdErr(range);
            assert.strictEqual(out, exp);
        }
        // If the above worked, so will this.
        // Still, sanity checks
        {
            let exp = "=STDEV(NamedRange)/SQRT(COUNT(NamedRange))"
            let out = stdErr("NamedRange");
            assert.strictEqual(out, exp);
        }
    })
    it("Search Function", () => {
        let range = "B1:B5";
        {
            let exp = "=AVERAGE(B1:B5)"
            let out = formula("average", range);
            assert.strictEqual(out, exp);
        }
        {
            // Several tests here, to ensure various inputs are taken
            let exp = "=STDEV(B1:B5)"
            assert.strictEqual(formula("stDev", range), exp);
            assert.strictEqual(formula("stdDev", range), exp);
            assert.strictEqual(formula("standardDeviation", range), exp);
            // We must ensure we handle the most proper case:
            // SaRcAsMcAsE
            assert.strictEqual(formula("StAnDaRdDeViAtIoN", range), exp);
        }
        {
            let exp = "=STDEV(B1:B5)/SQRT(COUNT(B1:B5))"
            let out = formula("stdErr", range);
            assert.strictEqual(out, exp);
        }
        {
            let exp = Error("Unknown formula: RandoCardrissian");
            let out: any = formula("RandoCardrissian", "Whatever");
            assert.strictEqual(out.message, exp.message);
        }
    })

})