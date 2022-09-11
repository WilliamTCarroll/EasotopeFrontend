<script lang="ts">
    import { ColumnConfig, type Sample, writeToFile } from "sheet-handle";
    import { rows, getColumnConfig, checkRowsOk } from "../../stores";
    import TableRow from "./row.svelte";

    let data: Sample[] = [];
    let cols: { val: string; style: string }[] = [];
    let anyErrors = false;

    $: {
        anyErrors = checkRowsOk(data);
        console.log("CHECK ROWS FN");
        rows.set(data);
    }

    rows.subscribe((rows) => {
        if (data === rows) {
            return;
        }
        data = rows;
        const first = rows[0];
        console.log("UPDATE DATA");
        if (!first) {
            // Set our error
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
        writeToFile(data, getColumnConfig(), options, `out.${bookType}`);
    }
</script>

<button on:click={() => saveFile("xlsx")} disabled={anyErrors}>
    Save File as Excel
</button>
<button on:click={() => saveFile("ods")} disabled={anyErrors}>
    Save File as OpenOffice
</button>
<p>
    {#if anyErrors}
        Status: Please Add Notes As Required Before Save
    {:else}
        Status: OK
    {/if}
</p>

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
    {#each data as item}
        <TableRow bind:data={item} {cols} showDisabled={false} />
        {#each item.replicates as rep}
            <TableRow bind:data={rep} {cols} />
        {/each}
    {/each}
</table>
