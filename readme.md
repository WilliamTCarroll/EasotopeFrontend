# Frontend for Easotope Calculations

NOTE: Many of the sections below are general notes, and will be modified/cleaned up later

## General Info on Current Software
- Easotope.org
- Produces Various Spreadsheet (xls)
- Partially collect columns
- Rows are sorted by test
- "S" defines new sample (Each S is unique)
- Dates within an S may or may not be unique
- Two blank Rows between samples

- Import XLSX, export XLSX (likely with "live" formulas)
- All (or most) Calculations to be done on the spreadsheet

## GUI 
- Ability to remove specific replicates from a sample, *required* reason

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
        "from": "d13C VPDB (Final)",
        // And change it to "to" on the output (and display as this, too)
        "to": "δ13C VPDB (Final)"
    },
    // If not found on the input, these are still added to the output columns.
    // They may be used for calculations, or placeholders.
    "δ13C VPDB (Final) SD",
    "Temp [°C]",
    // etc
]
```