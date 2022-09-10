import { defaultConfig, ColumnConfig, Sample } from "sheet-handle";
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export function getColumnConfig(): ColumnConfig {
    return defaultConfig;
}

export let rows: Writable<Sample[]> = writable([]);
