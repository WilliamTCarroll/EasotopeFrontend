<script lang="ts">
    import { Sample, type Replicate, type SummaryType } from "sheet-handle";

    import { ERR_CLASS, getColumnConfig } from "../../stores";
    export let data: Replicate | Sample;
    export let cols: { val: string; style: string }[] = [];
    export let showDisabled = true;
    export let summary: SummaryType | null = null;

    let isError = false;
    let noteClass = "";
    let rowClass = "";
    const config = getColumnConfig();
    // Update the stored values reactively
    $: {
        isError = data.Disabled && data.Notes.trim().length === 0;
        noteClass = isError ? ERR_CLASS : "";
        rowClass = data.Disabled ? "disabled-row" : "";
    }
    /**
     *  Get the Display Value for the given key of the stored data
     *  Properly displays the number `0` as `0`, rather than considering it a blank value.
     */
    function display(key: string): any {
        const val = data[key];
        return typeof val === "number" ? val : val || "";
    }
</script>

<tr class={rowClass}>
    {#each cols as col}
        <td class={col.style}>
            {#if summary}
                {#if col.style === "number" && data instanceof Sample}
                    {data.summary(summary, col.val, config)}
                {:else if col.val === "Replicate"}
                    <!-- Display the kind of summary we have -->
                    {summary.valueOf()}
                {:else if col.val === "Sample"}
                    <!-- Display what sample callout we are looking at -->
                    {data[col.val]}
                {/if}
            {:else if col.val === "Disabled" && showDisabled}
                <input
                    type="checkbox"
                    bind:checked={data.Disabled}
                    class="boolean"
                />
            {:else if col.val === "Notes"}
                <div class={noteClass}>
                    {#if isError} **REQUIRED** <br /> {/if}
                    <input
                        type="text"
                        required={data.Disabled}
                        bind:value={data.Notes}
                    />
                </div>
            {:else}
                {display(col.val)}
            {/if}
        </td>
    {/each}
</tr>
