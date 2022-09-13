<script lang="ts">
    import {
        ColumnConfig,
        type Sample,
        writeToFile,
        SummaryType,
    } from "sheet-handle";
    import { rows, getColumnConfig, checkRowsForErr } from "../../stores";
    import TableRow from "./row.svelte";
    enum Status {
        NoteRequired = <any>"Please Add Notes As Required Before Save",
        Ok = <any>"OK",
        NoData = <any>"No Data.  Please go to `Import`",
    }

    let data: Sample[] = [];
    let cols: { val: string; style: string }[] = [];
    let status: Status = Status.NoData;

    $: {
        // Set our status based off our dataset
        if (data.length === 0) {
            status = Status.NoData;
        } else if (checkRowsForErr(data)) {
            status = Status.NoteRequired;
        } else {
            status = Status.Ok;
        }
        // Push the data back into the rows
        rows.set(data);
    }
    // Ensure we update if a new dataset arrives
    rows.subscribe((rows) => {
        // If they match perfectly, this could have been triggered via child component updates
        if (data === rows) {
            return;
        }
        data = rows;
        const first = rows[0];
        if (!first) {
            // Set our error, so something will appear at all
            cols = [{ val: "NO DATA FOUND", style: "string" }];
        } else {
            // Clear out, just in case
            cols = [];

            // Loop through each column
            const config = getColumnConfig();
            for (let i = 0; i < config.entries.length; i++) {
                const head = config.entries[i];
                const val = ColumnConfig.entryOut(head);
                const item = first[val];
                // Attempt to grab what kind of value is stored
                let style: string = item
                    ? typeof item
                    : first.replicates[0]
                    ? typeof first.replicates[0][val]
                    : "undefined";
                if (i === 0) {
                    style = style + " sticky";
                }
                cols.push({ val, style });
            }
        }
    });
    /** Save the stored Samples as the given kind of Workboox */
    function saveFile(bookType: string) {
        const options: any = {
            type: "buffer",
            bookType,
        };
        const date = new Date();
        const name = date.toISOString().replaceAll(":", ".");
        writeToFile(data, getColumnConfig(), options, `${name}.${bookType}`);
    }
</script>

<button on:click={() => saveFile("xlsx")} disabled={status !== Status.Ok}>
    Save File as Excel
</button>
<button on:click={() => saveFile("ods")} disabled={status !== Status.Ok}>
    Save File as OpenOffice
</button>

<p class={Status[status]}>Status: {status.valueOf()}</p>

<table id="table">
    <tr>
        <!-- <th> Disabled </th>
        <th> Notes (Required if Disabled) </th> -->
        {#each cols as col}
            <th class={col.style}
                >{col.val === "Notes"
                    ? "Notes (Required if Disabled)"
                    : col.val}</th
            >
        {/each}
    </tr>
    {#each data as sample}
        <TableRow bind:data={sample} {cols} showDisabled={false} />
        {#each sample.replicates as rep}
            <TableRow bind:data={rep} {cols} />
        {/each}
        <!-- Now, summary rows -->
        <TableRow
            bind:data={sample}
            {cols}
            showDisabled={false}
            summary={SummaryType.Average}
        />
        <TableRow
            bind:data={sample}
            {cols}
            showDisabled={false}
            summary={SummaryType.StdDev}
        />
        <TableRow
            bind:data={sample}
            {cols}
            showDisabled={false}
            summary={SummaryType.StdErr}
        />

        <tr><p /> </tr>
    {/each}
</table>

<style>
    p.NoteRequired {
        background-color: red;
        font-weight: bold;
    }
    p.NoData {
        background-color: yellow;
        font-weight: bold;
    }
</style>
