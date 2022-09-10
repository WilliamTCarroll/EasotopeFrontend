<script lang="ts">
    import type { Replicate, Sample } from "sheet-handle";

    import { ERR_CLASS } from "../../stores";
    export let data: Replicate | Sample;
    export let cols: { val: string; style: string }[] = [];
    export let showDisabled = true;

    let isError = false;
    let noteClass = "";
    // Update the stored values reactively
    $: {
        isError = data.Disabled && data.Notes.trim().length === 0;
        noteClass = isError ? ERR_CLASS : "";
    }
</script>

<tr>
    {#each cols as col}
        <td class={col.style}>
            {#if col.val === "Disabled" && showDisabled}
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
                {data[col.val] || ""}
            {/if}
        </td>
    {/each}
</tr>
