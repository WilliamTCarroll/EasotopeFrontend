# Frontend for Easotope Calculations

NOTE: Many of the sections below are general notes, and will be modified/cleaned up later

## General Info on Current Software

-   Easotope.org
-   Produces Various Spreadsheet (xls)
-   Partially collect columns
-   Rows are sorted by test
-   "S" defines new sample (Each S is unique)
-   Dates within an S may or may not be unique
-   Two blank Rows between samples

-   Import XLSX, export XLSX (likely with "live" formulas)
-   All (or most) Calculations to be done on the spreadsheet

# Getting Started

This uses `lerna` for workspace handling. Tests and dev scripts can be ran with it, and

1. Clone the repo
2. Open a terminal in the project directory.
3. `npm i` to download requirements
4. `npm run build` (This runs `npm i`, then builds all directories, and links the local dependencies)
5. `npm run dev` (loads up a dev instance of the server)

## GUI

-   Ability to remove specific replicates from a sample, _required_ reason

## Process

1. ~Import spreadsheet from Easotope~
2. ~Split into samples with list of replicates on each~
3. Calculations
    - Averages and standard deviations visible
    - Some material specific
4. Optional removal with notes of replicants
5. Write calculations back onto template spreadsheet

## Column Config File

```js
[
    // The order here determines the output order
    "D49 WG (Raw) SE",
    // If just a string, this is used as the input and output column name
    "D49 WG (Raw)",
    {
        // "from" will grab the name on the input excel file
        from: "d13C VPDB (Final)",
        // And change it to "to" on the output (and display as this, too)
        to: "δ13C VPDB (Final)",
    },
    {
        from: "d18O VPDB (Final)",
        to: "δ18O VPDB (Final)",
        // Some fields may have an array of summary types
        summary: ["average", "stdDev"],
    },
    // If not found on the input, these are still added to the output columns.
    // They may be used for calculations, or placeholders.
    "δ13C VPDB (Final) SD",
    "Temp [°C]",
    // etc
];
```
